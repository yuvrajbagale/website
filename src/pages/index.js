import React from 'react'
import { SkipNavContent } from '@reach/skip-nav'
import SkipNavigation from '~components/utils/skip-navigation'
import Header from '~components/layout/header'
import SEO from '~components/utils/seo'
import Footer from '~components/layout/footer'
import Container from '~components/common/landing-page/container'
import HeaderHero from '~components/pages/homepage/header-hero'
import BlogList from '~components/pages/homepage/blog-list'
import Datasets from '~components/pages/homepage/datasets'
import LatestTotals from '~components/pages/homepage/latest-totals'
import WhoIsUsing from '~components/pages/homepage/who-is-using-our-data'

const Homepage = () => (
  <>
    <SEO title="The COVID Tracking Project" />
    <SkipNavigation />
    <Header siteTitle="The COVID Tracking Project" noMargin />
    <SkipNavContent />
    <HeaderHero />

    <main id="main">
      <Datasets />
      <Container>
        <LatestTotals />
      </Container>
      <BlogList />
      <Container>
        <WhoIsUsing />
      </Container>
    </main>
    <Footer />
  </>
)

export default Homepage
