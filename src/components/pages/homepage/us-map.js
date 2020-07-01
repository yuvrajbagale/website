/* eslint-disable no-param-reassign */
import React, { useState, useMemo } from 'react'
import { useStaticQuery, graphql, Link } from 'gatsby'
import { geoPath, geoMercator } from 'd3-geo'
import slugify from 'slugify'
import classnames from 'classnames'
import stateShapes from '~data/visualization/states-hexgrid.json'
import usMapStyles from './us-map.module.scss'

const mapWidth = 1000
const mapHeight = 600
const margin = {
  top: 0,
  left: 5,
  right: 5,
  bottom: 0,
}

const limit = number => {
  if (number <= 1000) {
    return 'Low'
  }
  if (number <= 2000) {
    return 'Medium'
  }
  return 'High'
}

const State = ({ feature, path, setActive, isActive = false }) => {
  const levelClass =
    usMapStyles[`level${limit(feature.properties.stateInfo.sevenDayPositive)}`]

  return (
    <path
      key={`path${feature.properties.state}`}
      d={path(feature)}
      className={classnames(
        usMapStyles.state,
        isActive && usMapStyles.active,
        levelClass,
      )}
      onClick={event => {
        event.preventDefault()
        if (isActive) {
          return setActive(false)
        }
        return setActive(feature)
      }}
    />
  )
}

const Label = ({ feature, setActive, path }) => {
  const centroid = path.centroid(feature)
  const levelClass =
    usMapStyles[`text${limit(feature.properties.stateInfo.sevenDayPositive)}`]
  return (
    <>
      <text
        x={centroid[0] - 20}
        y={centroid[1]}
        className={classnames(
          usMapStyles.label,
          usMapStyles.stateLabel,
          levelClass,
        )}
        onClick={() => setActive(feature)}
      >
        {feature.properties.stateInfo.state}
      </text>
      <text
        x={centroid[0] - 20}
        y={centroid[1] + 15}
        className={classnames(usMapStyles.label, levelClass)}
        onClick={() => setActive(feature)}
      >
        {feature.properties.stateInfo.sevenDayPositive.toLocaleString()}
      </text>
    </>
  )
}

const StateListStatistics = ({ title, states, level }) => {
  if (!states || !states.length) {
    return null
  }
  return (
    <>
      <h3>{title}</h3>
      <div className={usMapStyles.list}>
        {states.map(state => (
          <div
            className={classnames(
              usMapStyles.state,
              usMapStyles[`level${level}`],
            )}
          >
            <Link to={state.link}>
              <div className={usMapStyles.name} aria-hidden>
                {state.state}
              </div>
              <span className="a11y-only">{state.name}</span>
              <div className={usMapStyles.number}>
                {state.sevenDayPositive.toLocaleString()}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

const StateList = ({ states }) => (
  <div className={usMapStyles.stateList}>
    <StateListStatistics
      title="Over 2,000 cases"
      level="High"
      states={states.filter(state => state.sevenDayPositive > 2000)}
    />
    <StateListStatistics
      title="1,000-2,000 cases"
      level="Medium"
      states={states.filter(
        state =>
          state.sevenDayPositive >= 1000 && state.sevenDayPositive < 2000,
      )}
    />
    <StateListStatistics
      title="Below 1,000 cases"
      level="Low"
      states={states.filter(state => state.sevenDayPositive < 1000)}
    />
  </div>
)

const getAverage = (history, field) =>
  Math.round(
    history.reduce((total, item) => total + item[field], 0) / history.length,
  )

const Tooltip = ({ feature, path }) => {
  const bounds = path.bounds(feature)

  return (
    <svg x={bounds[1][0]} y={bounds[1][1]}>
      <rect x={0} y={0} className={usMapStyles.tooltip}>
        <text>{feature.properties.stateInfo.name}</text>
      </rect>
    </svg>
  )
}

const MapLegendItem = ({ title, className }) => (
  <div className={usMapStyles.item}>
    <div className={classnames(usMapStyles.bar, className)} />
    {title}
  </div>
)

const MapLegend = () => (
  <div className={usMapStyles.legend}>
    <MapLegendItem title="Below 1,000 cases" className={usMapStyles.low} />
    <MapLegendItem title="1,000 to 2,000" className={usMapStyles.medium} />
    <MapLegendItem title="Above 2,000 cases" className={usMapStyles.high} />
  </div>
)

const Map = () => {
  const [activeState, setActiveState] = useState(false)
  const path = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [margin.left, margin.top],
        [mapWidth - margin.right, mapHeight - margin.bottom],
      ],
      stateShapes,
    )
    return geoPath().projection(projection)
  }, [mapWidth, mapHeight])

  return (
    <>
      <svg
        className={usMapStyles.map}
        width={mapWidth}
        height={mapHeight}
        onMouseLeave={() => setActiveState(false)}
        aria-hidden
      >
        <g>
          {stateShapes.features.map(feature => (
            <State
              feature={feature}
              path={path}
              setActive={stateFeature => setActiveState(stateFeature)}
            />
          ))}
        </g>
        <g>
          {stateShapes.features.map(feature => (
            <Label
              feature={feature}
              path={path}
              setActive={stateFeature => setActiveState(stateFeature)}
            />
          ))}
        </g>

        {activeState && (
          <g>
            <State
              feature={activeState}
              path={path}
              setActive={() => setActiveState(false)}
              isActive
            />
            <Label
              feature={activeState}
              path={path}
              setActive={() => setActiveState(false)}
            />
            <Tooltip feature={activeState} path={path} />
          </g>
        )}
      </svg>
      <MapLegend />
    </>
  )
}
export default () => {
  const data = useStaticQuery(graphql`
    {
      allCovidStateInfo {
        nodes {
          name
          state
        }
      }
      allCovidStateDaily(sort: { fields: [state, date], order: [ASC, DESC] }) {
        group(field: state, limit: 7) {
          nodes {
            state
            positiveIncrease
          }
        }
      }
    }
  `)

  const states = []
  data.allCovidStateInfo.nodes.forEach(state => {
    const { nodes } = data.allCovidStateDaily.group.find(
      group => group.nodes[0].state === state.state,
    )

    states.push({
      ...state,
      sevenDayPositive: getAverage(nodes, 'positiveIncrease'),
      link: `/data/state/${slugify(state.name, {
        strict: true,
        lower: true,
      })}`,
    })
  })

  stateShapes.features.forEach(feature => {
    feature.properties.stateInfo = states.find(
      state => state.state === feature.properties.state,
    )
  })

  return (
    <div className={usMapStyles.mapWrapper}>
      <h2 className={usMapStyles.mapHeading}>
        New COVID-19 cases by state/territory
        <div>Seven-day rolling average</div>
      </h2>
      <Map />
      <StateList states={states} />
      <p>
        We compile data from official, public state and territory data. This
        data shows a strong day-of-the-week effect because fewer tests are
        completed on weekends in most areas, so we calculate a seven-day rolling
        average of the new case numbers. You can see all the{' '}
        <Link to="/data">national and state data</Link> or{' '}
        <Link to="/data/download">download CSVs</Link>.
      </p>
    </div>
  )
}
