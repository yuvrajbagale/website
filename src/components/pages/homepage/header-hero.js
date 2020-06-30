import React from 'react'
import UsMap from './us-map'
import Container from '~components/common/container'
import heroStyle from './header-hero.module.scss'

export default () => {
  return (
    <div className={`hero ${heroStyle.hero}`}>
      <Container>
        <UsMap />
      </Container>
    </div>
  )
}
