import React from 'react'
import { useStaticQuery, graphql, navigateTo } from 'gatsby'

const JumpState = ({ url }) => {
  const data = useStaticQuery(graphql`
    {
      allCovidStateInfo(sort: { fields: name }) {
        nodes {
          name
          state
          childSlug {
            slug
          }
        }
      }
    }
  `)
  const states = data.allCovidStateInfo.nodes

  return (
    <select
      onChange={event => {
        navigateTo(url(states[event.target.value]))
      }}
    >
      <option>Jump to state</option>
      {states.map((state, index) => (
        <option value={index}>{state.name}</option>
      ))}
    </select>
  )
}

export default JumpState
