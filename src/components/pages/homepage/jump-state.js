import React, { useState } from 'react'
import { useStaticQuery, graphql, Link } from 'gatsby'
import {
  TabletDisclosure,
  TabletDisclosureHeader,
  TabletDisclosureContent,
} from '~components/common/tablet-disclosure'
import jumpStateStyles from './jump-state.module.scss'

const JumpState = ({ url }) => {
  const [isOpen, setIsOpen] = useState(false)
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
  const key = Math.random()

  return (
    <TabletDisclosure alwaysToggle>
      <TabletDisclosureHeader
        isOpen={isOpen}
        setIsOpen={() => {
          setIsOpen(!isOpen)
        }}
      >
        Jump to state
      </TabletDisclosureHeader>
      <TabletDisclosureContent isOpen={isOpen}>
        <ul className={jumpStateStyles.list}>
          {states.map(state => (
            <li key={`jump-${key}-${state.state}`}>
              <Link to={url(state)}>{state.state}</Link>
            </li>
          ))}
        </ul>
      </TabletDisclosureContent>
    </TabletDisclosure>
  )
}

export default JumpState
