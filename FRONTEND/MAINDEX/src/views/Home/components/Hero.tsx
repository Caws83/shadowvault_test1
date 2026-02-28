import React from 'react';
import styled from 'styled-components';
import { Flex, Link, Button, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import { buttonData } from './SalesSection/data';
import SalesSection from './SalesSection';
import { isMobile } from 'components/isMobile'


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


const Hero = () => {
  const { t } = useTranslation();
  const { address: account } = useAccount();

  return (
    
    <Flex
    flexDirection={isMobile ? 'column' : 'row'}
    >
      <ContentContainer>
        {/* Background Video */}
        <VideoBackground id="background-video" autoPlay loop muted>
          <source src={"/images/home/backgrounds/backVid.mp4"} type="video/mp4" />
        </VideoBackground>

        
          <Flex m="8px" height="100%" alignItems="center" justifyContent="space-between" flexDirection="column" style={{ textAlign: 'center' }}>
            <img src="/images/home/logoWithText.svg" alt="Desktop Logo" className="desktop-icon" style={{ width: `240px` }} />

            <Text style={{ textShadow: '0 0 10px #DC143C, 3px 3px 6px black' }} fontSize={isMobile ? "28px" : "32px"} color="text" mb="18px" bold>
              Trade in Shadows. Leverage Fearless.
            </Text>

            <Text style={{ textShadow: '0 0 8px #DC143C, 3px 3px 6px black' }} fontSize={isMobile ? "24px" : "28px"} color="secondary" mb="18px">
              ShadowVault Protocol - Uniswap's Private Shadow with AI Superpowers
            </Text>

            <Text style={{ textShadow: '0 0 6px #DC143C, 3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="18px">
              ZERO-KNOWLEDGE PRIVACY
            </Text>
              <Text style={{ textShadow: '0 0 6px #DC143C, 3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="18px">
              UNISWAP LIQUIDITY | AI AGENT POWER
              </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "14px" : "18px"} mb="18px">
              Trade assets pseudonymously with zero-knowledge proofs. Tap into Uniswap's vast liquidity pools. Deploy optional AI agent for leveraged positions - Safe Mode (5-10x) or Full Psycho (100x).
            </Text>

          


          <Flex alignItems="flex-end" justifyContent="center">
            <Link href="/#/swap">
              <Button variant={!account ? 'secondary' : 'primary'}>{t('Trade Now')}</Button>
            </Link>
          </Flex>

        </Flex>
        
      </ContentContainer>

      <SalesSection buttons={buttonData} isHome={true} />

    </Flex>
  );
};

export default Hero;
