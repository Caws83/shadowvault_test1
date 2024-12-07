import React from 'react'
import styled from 'styled-components'
import Hero from './Hero'
import Hero2 from './Hero2';

const HeroContainer = styled.div`
padding: 1%;
`;

const Home: React.FC = () => {



  return (
<>
      <HeroContainer>
        <Hero />
      </HeroContainer>
      <HeroContainer>
        <Hero2/>
      </HeroContainer>
      </>
  )
}

export default Home
