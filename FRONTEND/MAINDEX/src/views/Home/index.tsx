import React from 'react'
import Hero from './components/NewHero'
import ThreePillars from './components/ThreePillars'
import Page from '../Page'
import PresaleSection from './components/PresaleSection'

const Home: React.FC = () => {
  return (
    <Page>
      <Hero />
      <ThreePillars />
      <PresaleSection />
    </Page>
  )
}

export default Home
