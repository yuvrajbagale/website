/* eslint-disable no-param-reassign */
import React, { useState, useMemo } from 'react'
import { useStaticQuery, graphql, Link, navigate } from 'gatsby'
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
  if (number <= 500) {
    return 500
  }
  if (number <= 2000) {
    return 1000
  }
  if (number <= 5000) {
    return 2000
  }
  return 5000
}

const State = ({ feature, path, setHover, isHovered = false }) => {
  const levelClass =
    usMapStyles[`level${limit(feature.properties.covidData.positiveIncrease)}`]

  return (
    <path
      key={`path${feature.properties.state}`}
      d={path(feature)}
      className={classnames(
        usMapStyles.state,
        isHovered && usMapStyles.hovered,
        levelClass,
      )}
      onMouseEnter={() => {
        if (isHovered) {
          return false
        }
        return setHover(feature)
      }}
      onClick={() => {
        navigate(feature.properties.link)
      }}
    />
  )
}

const Label = ({ feature, path }) => {
  const centroid = path.centroid(feature)
  const levelClass =
    usMapStyles[`text${limit(feature.properties.covidData.positiveIncrease)}`]
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
        onClick={() => {
          navigate(feature.properties.link)
        }}
      >
        {feature.properties.state}
      </text>
      <text
        x={centroid[0] - 20}
        y={centroid[1] + 15}
        className={classnames(usMapStyles.label, levelClass)}
        onClick={() => {
          navigate(feature.properties.link)
        }}
      >
        {feature.properties.covidData.positiveIncrease.toLocaleString()}
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
            <Link
              to={`/data/state/${slugify(state.name, {
                strict: true,
                lower: true,
              })}`}
            >
              <div className={usMapStyles.name}>{state.state}</div>
              <span className="a11y-only">{state.name}</span>
              <div className={usMapStyles.number}>
                {state.positiveIncrease.toLocaleString()}
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
      title="Over 5,000 cases"
      level={5000}
      states={states.filter(state => state.positiveIncrease > 5000)}
    />
    <StateListStatistics
      title="2,000-5,000 cases"
      level={2000}
      states={states.filter(
        state =>
          state.positiveIncrease >= 2000 && state.positiveIncrease < 5000,
      )}
    />
    <StateListStatistics
      title="1,000-2,000 cases"
      level={1000}
      states={states.filter(
        state =>
          state.positiveIncrease >= 1000 && state.positiveIncrease < 2000,
      )}
    />
    <StateListStatistics
      title="Under 1,000 cases"
      level={500}
      states={states.filter(state => state.positiveIncrease < 1000)}
    />
  </div>
)

export default () => {
  const [hoveredState, setHoveredState] = useState(false)
  const data = useStaticQuery(graphql`
    {
      allCovidState {
        nodes {
          positiveIncrease
          state
        }
      }
      allCovidStateInfo {
        nodes {
          name
          state
        }
      }
    }
  `)

  stateShapes.features.forEach(feature => {
    const stateInfo = data.allCovidStateInfo.nodes.find(
      state => state.state === feature.properties.state,
    )
    const stateData = data.allCovidState.nodes.find(
      state => state.state === feature.properties.state,
    )
    if (!stateInfo || !stateData) {
      return
    }
    feature.properties.stateName = stateInfo.name
    feature.properties.link = `/data/state/${slugify(stateInfo.name, {
      strict: true,
      lower: true,
    })}`
    feature.properties.covidData = stateData
  })

  const states = []
  data.allCovidStateInfo.nodes.forEach(state => {
    states.push({
      ...state,
      ...data.allCovidState.nodes.find(item => item.state === state.state),
    })
  })

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
    <div className={usMapStyles.mapWrapper}>
      <h2 className={usMapStyles.mapHeading}>
        New cases of COVID-19 reported by states, 7-day rolling average
      </h2>
      <svg
        className={usMapStyles.map}
        width={mapWidth}
        height={mapHeight}
        onMouseLeave={() => setHoveredState(false)}
        aria-hidden
      >
        <g>
          {stateShapes.features.map(feature => (
            <State
              feature={feature}
              path={path}
              setHover={stateFeature => setHoveredState(stateFeature)}
            />
          ))}
        </g>
        <g>
          {stateShapes.features.map(feature => (
            <Label feature={feature} path={path} />
          ))}
        </g>

        {hoveredState && (
          <g>
            <State
              feature={hoveredState}
              path={path}
              setHover={state => setHoveredState(state)}
              isHovered
            />
            <Label feature={hoveredState} path={path} />
          </g>
        )}
      </svg>
      <StateList states={states} />
    </div>
  )
}
