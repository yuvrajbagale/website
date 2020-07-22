import React from 'react'
import navigationPaneStyles from './navigation-pane.module.scss'

export default ({ title, children }) => (
  <div className={navigationPaneStyles.container}>
    <div className={navigationPaneStyles.header}>
      <h3>{title}</h3>
    </div>
    <div className={navigationPaneStyles.content}>{children}</div>
  </div>
)
