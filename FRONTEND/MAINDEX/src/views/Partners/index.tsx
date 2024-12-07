import React from 'react'
import styled from 'styled-components'
import Hero from './Hero'
import PageHeader from 'components/PageHeader';

const HeroContainer = styled.div`
padding: 1%;
width: 100%;
`;

const Home: React.FC = () => {



  return (
    <>
      <PageHeader firstHeading="MARSWAP Partners" />
      <HeroContainer>
        <Hero />
      </HeroContainer>
    </>

  )
}

export default Home
