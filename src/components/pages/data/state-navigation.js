import React from 'react'
import { Link, useStaticQuery, graphql } from 'gatsby'
import NavigationPane from '~components/common/navigation-pane'
import slug from '~utilities/slug'
import stateNavigationStyles from './state-navigation.module.scss'

export default ({ linkToAnchor = false }) => {
  const data = useStaticQuery(graphql`
    {
      allCovidStateInfo(sort: { fields: state }) {
        nodes {
          name
          state
        }
      }
    }
  `)

  return (
    <NavigationPane title="Jump to a state">
      <ul className={stateNavigationStyles.list}>
        {data.allCovidStateInfo.nodes.map(({ state, name }) => (
          <li>
            {linkToAnchor ? (
              <a title={name} href={`#state-${state.toLowerCase()}`}>
                {state}
              </a>
            ) : (
              <Link title={name} to={`/data/state/${slug(name)}`}>
                {state}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </NavigationPane>
  )
}
