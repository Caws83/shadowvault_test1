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

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "28px" : "32px"} color="text" mb="18px">
              Why SWAP on Earth when you can SWAP on MARS!
            </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "24px" : "28px"} color="secondary" mb="18px">
              Test our full potential on the SHIBARIUM Chain.
            </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="18px">
              MARSWAP THE GATEWAY TO SHIBARIUM!

              
              </Text>
              <Text style={{ textShadow: '3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="18px">
              THE FIRST EVER DEX USING A FLAT FEE ACROSS MULTIPLE CHAINS!
              </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "14px" : "18px"} mb="18px">
              We specialize in tailor-made solutions for DeFi projects, complemented by user-friendly self-service options.
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
