/* eslint-disable no-param-reassign */
import React, { useState, useMemo } from 'react'
import { useStaticQuery, graphql, Link, navigate } from 'gatsby'
import { geoPath, geoMercator } from 'd3-geo'
import slugify from 'slugify'
import classnames from 'classnames'
import stateShapes from '~data/visualization/states-hexgrid.json'
import usMapStyles from './us-map.module.scss'

const mapWidth = 1140
const mapHeight = 700
const margin = {
  top: -20,
  left: 0,
  right: 50,
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
        width="100%"
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
      <table className="a11y-only">
        <caption>States by case increases in the past day</caption>

        <thead>
          <tr>
            <th>State</th>
            <th>Increase</th>
          </tr>
        </thead>
        <tbody>
          {stateShapes.features.map(feature => (
            <tr>
              <td>
                <Link to={feature.properties.link}>
                  {feature.properties.stateName}
                </Link>
              </td>
              <td>{feature.properties.covidData.positiveIncrease}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
