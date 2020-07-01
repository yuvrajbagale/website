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

const metrics = {
  sevenDayPositive: {
    title: {
      main: 'New COVID-19 cases by state/territory',
      subTitle: 'Seven-day rolling average',
    },
    getLimitClass: ({ sevenDayPositive }) => {
      if (sevenDayPositive <= 1000) {
        return 'Low'
      }
      if (sevenDayPositive <= 2000) {
        return 'Medium'
      }
      return 'High'
    },
    format: ({ sevenDayPositive }) => sevenDayPositive.toLocaleString(),
    levels: [
      {
        type: 'low',
        className: usMapStyles.levelLow,
        title: 'Below 1,000 cases',
        find: states =>
          states.filter(({ sevenDayPositive }) => sevenDayPositive < 1000),
      },
      {
        type: 'medium',
        title: '1,000-2,000 cases',
        className: usMapStyles.levelMedium,
        find: states =>
          states.filter(
            ({ sevenDayPositive }) =>
              sevenDayPositive >= 1000 && sevenDayPositive < 2000,
          ),
      },
      {
        type: 'high',
        title: 'Over 2,000 cases',
        className: usMapStyles.levelHigh,
        find: states =>
          states.filter(({ sevenDayPositive }) => sevenDayPositive > 2000),
      },
    ],
  },
  testsPer100thousand: {
    title: {
      main: 'Tests for COVID-19 by state/territory',
      subTitle: 'Seven-day rolling average of tests per 100k people',
    },
    getLimitClass: ({ testsPer100thousand }) => {
      if (testsPer100thousand < 100) {
        return 'Low'
      }
      if (testsPer100thousand < 150) {
        return 'Medium'
      }
      return 'High'
    },
    format: ({ testsPer100thousand }) => testsPer100thousand.toLocaleString(),
    levels: [
      {
        type: 'low',
        className: usMapStyles.levelLow,
        title: 'Below 100 tests',
        find: states =>
          states.filter(({ testsPer100thousand }) => testsPer100thousand < 100),
      },
      {
        type: 'medium',
        title: '100-150 tests',
        className: usMapStyles.levelMedium,
        find: states =>
          states.filter(
            ({ testsPer100thousand }) =>
              testsPer100thousand >= 100 && testsPer100thousand < 150,
          ),
      },
      {
        type: 'high',
        title: 'Over 150 tests',
        className: usMapStyles.levelHigh,
        find: states =>
          states.filter(({ testsPer100thousand }) => testsPer100thousand > 150),
      },
    ],
  },
  percentPositive: {
    title: {
      main: 'Percent positive tests for COVID-19 by state/territory',
      subTitle: 'Percentage of positive tests in the past seven days',
    },
    getLimitClass: ({ percentPositive }) => {
      if (percentPositive < 0.05) {
        return 'Low'
      }
      if (percentPositive < 0.08) {
        return 'Medium'
      }
      return 'High'
    },
    format: ({ percentPositive }) =>
      `${Math.round(percentPositive * 1000) / 10}%`,
    levels: [
      {
        type: 'low',
        className: usMapStyles.levelLow,
        title: 'Below 5% positive',
        find: states =>
          states.filter(({ percentPositive }) => percentPositive < 0.05),
      },
      {
        type: 'medium',
        title: '5% - 8% positive',
        className: usMapStyles.levelMedium,
        find: states =>
          states.filter(
            ({ percentPositive }) =>
              percentPositive >= 0.05 && percentPositive < 0.08,
          ),
      },
      {
        type: 'high',
        title: 'Over 8% positive',
        className: usMapStyles.levelHigh,
        find: states =>
          states.filter(({ percentPositive }) => percentPositive > 0.08),
      },
    ],
  },
}

const State = ({ feature, path, metric, setActive, isActive = false }) => {
  const levelClass =
    usMapStyles[
      `level${metrics[metric].getLimitClass(feature.properties.stateInfo)}`
    ]

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

const Label = ({ feature, setActive, metric, path }) => {
  const centroid = path.centroid(feature)
  const levelClass =
    usMapStyles[
      `text${metrics[metric].getLimitClass(feature.properties.stateInfo)}`
    ]
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
        {metrics[metric].format(feature.properties.stateInfo)}
      </text>
    </>
  )
}

const StateListStatistics = ({ title, states, className, metric }) => {
  if (!states || !states.length) {
    return null
  }
  return (
    <>
      <h3>{title}</h3>
      <div className={usMapStyles.list}>
        {states.map(state => (
          <div
            className={classnames(usMapStyles.state, className)}
            key={`stat-${state.state}`}
          >
            <Link to={state.link}>
              <div className={usMapStyles.name} aria-hidden>
                {state.state}
              </div>
              <span className="a11y-only">{state.name}</span>
              <div className={usMapStyles.number}>
                {metrics[metric].format(state)}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

const StateList = ({ states, metric }) => (
  <div className={usMapStyles.stateList}>
    {[...metrics[metric].levels]
      .reverse()
      .map(({ type, title, className, find }) => (
        <StateListStatistics
          key={title}
          title={title}
          level={type}
          metric={metric}
          className={className}
          states={find(states)}
        />
      ))}
  </div>
)

const getAverage = (history, field) =>
  history.reduce((total, item) => total + item[field], 0) / history.length

const MapLegendItem = ({ title, className }) => (
  <div className={usMapStyles.item}>
    <div className={classnames(usMapStyles.bar, className)} />
    {title}
  </div>
)

const MapLegend = ({ metric }) => (
  <div className={usMapStyles.legend}>
    {metrics[metric].levels.map(({ title, type }) => (
      <MapLegendItem title={title} key={title} className={usMapStyles[type]} />
    ))}
  </div>
)

const Map = ({ metric }) => {
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
              key={`state-${feature.properties.state}`}
              feature={feature}
              path={path}
              metric={metric}
              setActive={stateFeature => setActiveState(stateFeature)}
            />
          ))}
        </g>
        <g>
          {stateShapes.features.map(feature => (
            <Label
              key={`label-${feature.properties.state}`}
              feature={feature}
              path={path}
              metric={metric}
              setActive={stateFeature => setActiveState(stateFeature)}
            />
          ))}
        </g>

        {activeState && (
          <g>
            <State
              feature={activeState}
              path={path}
              metric={metric}
              setActive={() => setActiveState(false)}
              isActive
            />
            <Label
              feature={activeState}
              path={path}
              metric={metric}
              setActive={() => setActiveState(false)}
            />
          </g>
        )}
      </svg>
      <MapLegend metric={metric} />
    </>
  )
}

export default () => {
  const [metric, setMetric] = useState('sevenDayPositive')
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
            negativeIncrease
            childPopulation {
              population
            }
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
    const stateInfo = nodes.map(node => {
      node.posNegIncrease = node.positiveIncrease + node.negativeIncrease
      node.percentPositive = node.positiveIncrease / node.posNegIncrease
      return node
    })

    states.push({
      ...state,
      sevenDayPositive: Math.round(getAverage(stateInfo, 'positiveIncrease')),
      testsPer100thousand: Math.round(
        (getAverage(stateInfo, 'posNegIncrease') /
          stateInfo[0].childPopulation.population) *
          100000,
      ),
      percentPositive:
        stateInfo.reduce(
          (positive, posNegState) => posNegState.positiveIncrease + positive,
          0,
        ) /
        stateInfo.reduce(
          (posNeg, posNegState) =>
            posNegState.positiveIncrease +
            posNegState.negativeIncrease +
            posNeg,
          0,
        ),
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
      <h1>COVID-19 in the US</h1>
      <div className={usMapStyles.toggle}>
        <button
          type="button"
          data-active={metric === 'sevenDayPositive' ? true : undefined}
          onClick={event => {
            event.preventDefault()
            setMetric('sevenDayPositive')
          }}
        >
          Cases
        </button>
        <button
          type="button"
          data-active={metric === 'testsPer100thousand' ? true : undefined}
          onClick={event => {
            event.preventDefault()
            setMetric('testsPer100thousand')
          }}
        >
          Tests
        </button>
        <button
          type="button"
          data-active={metric === 'percentPositive' ? true : undefined}
          onClick={event => {
            event.preventDefault()
            setMetric('percentPositive')
          }}
        >
          Percent positive
        </button>
      </div>

      <h2 className={usMapStyles.mapHeading} aria-live="polite">
        {metrics[metric].title.main}
        <div>{metrics[metric].title.subTitle}</div>
      </h2>
      <Map metric={metric} />
      <StateList states={states} metric={metric} />
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
