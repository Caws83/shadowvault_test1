import React from 'react'
import styled from 'styled-components'
import PageSection from 'components/PageSection'
import MswapHero from './MswapHero'
import CakeHero from './CakeHero'
import CrolonHero from './CrolonHero'
import CakeDataRow from './CakeDataRow'
import MSWAPDataRow from './MswapDataRow'
import CroDataRow from './CroDataRow'
import { Flex } from 'uikit'
import { isMobile } from 'components/isMobile'

const HeroContainer = styled.div`
padding: 1%;
`;

const Tokens: React.FC = () => {

  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }



  return (
    <>

      <HeroContainer>
        <MswapHero />
      </HeroContainer>

    <Flex flexDirection={["column", null, null, "row"]} alignItems="center" justifyContent="center">
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        index={3}
        hasCurvedDivider={false}
      >
        <MSWAPDataRow />
      </PageSection>
      <Flex >
        <img src="/images/home/tdist.png" alt="Desktop Logo" className="desktop-icon" style={{ width: isMobile ? '100vw' : `20vw`}} />
      </Flex>
    </Flex>

      <HeroContainer>
        <CakeHero />
      </HeroContainer>

      <Flex flexDirection={["column", null, null, "row"]} alignItems="center" justifyContent="center">
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        index={3}
        hasCurvedDivider={false}
      >
        <CakeDataRow />
      </PageSection>
      <Flex >
        <img src="/images/home/tdistMSWAPF.png" alt="Desktop Logo" className="desktop-icon" style={{ width: isMobile ? '100vw' : `20vw`}} />
      </Flex>
    </Flex>

     

      <HeroContainer>
        <CrolonHero />
      </HeroContainer>

      <Flex flexDirection={["column", null, null, "row"]} alignItems="center" justifyContent="center">
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        index={3}
        hasCurvedDivider={false}
      >
        <CroDataRow />
      </PageSection>

      <Flex >
        <img src="/images/home/tdistCROLON.png" alt="Desktop Logo" className="desktop-icon" style={{ width: isMobile ? '100vw' : `20vw`}} />
      </Flex>
    </Flex>

    </>
  )
}

export default Tokens
