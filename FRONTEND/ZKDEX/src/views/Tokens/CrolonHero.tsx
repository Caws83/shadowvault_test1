import React from 'react';
import styled from 'styled-components';
import { Flex, Text, Link, Button } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import { isMobile } from 'components/isMobile'
import { CROLONbuttonData } from './data';
import SalesSection from 'views/Home/components/SalesSection';


// Define styled components for background video
const ContentContainer = styled(Flex)`
  flex-direction: column;
  position: relative;
  min-width: 45%;
  border: 1px solid #818589; /* Add white border */
  border-radius: 8px; /* Optional: Add border radius for a rounded look */
  padding: 16px; /* Optional: Add padding for some space around the content */
  overflow: hidden; /* Ensure video doesn't overflow */
  margin: ${isMobile ? '16px' : '6px'};
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover; /* Ensure the video covers the entire container while maintaining its aspect ratio */
`;

const CakeHero = () => {
  const { t } = useTranslation();
  const { address: account } = useAccount();


  return (
    
    <Flex
      flexDirection={isMobile ? 'column' : 'row'}
    >
      <ContentContainer>
        {/* Background Video */}
        <VideoBackground id="background-video" autoPlay loop muted>
          <source src={"/images/home/backgrounds/backVid3.mp4"} type="video/mp4" />
        </VideoBackground>

        
        <Flex m="24px" height="100%" alignItems="center" justifyContent="space-between" flexDirection="column" style={{ flex: 1, textAlign: 'center' }}>
            <Flex flexDirection="row" alignItems="center" justifyContent="center">
              <img src="/images/tokens/CLMRS.png" alt="Desktop Logo" className="desktop-icon" style={{ width: `125px` }} />
              <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize='48px' color="primary">CROLON MARS</Text>
            </Flex>
            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "32px" : "28px"} color="secondary" mb="8px">
              CROLON MARS MetaVerse
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
            Crolon Mars is our first token that was launched on the Cronos chain
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
            the project boasts a multitude of utility including a P2E game, NFTs and the CROLON MARS Metaverse
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
            that is conceptualised to to be able to bridge one Metaverse to another through a series of portals
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }}  fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
            the metaverse also links with our $MSWAP (ETH) token allowing users to virtually "mine the token as they explore.
            </Text>

            <Flex m="16px" alignItems="flex-end" justifyContent="center" flexDirection={isMobile ? "column" : "row"}>
              <Link m="16px" href="/#/swap?outputCurrency=0xaAd00d36Dbc8343C3505Ba51418a43D3622D2964&dex=crodex">
                <Button variant={!account ? 'secondary' : 'primary'}>{t('BUY Crolon Mars')}</Button>
              </Link>
            </Flex>

        </Flex>

      </ContentContainer>

      <SalesSection buttons={CROLONbuttonData} />

    </Flex>
  );
};

export default CakeHero;
