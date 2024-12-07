import React from 'react';
import styled from 'styled-components';
import { Flex, Text, Link, Button } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import { isMobile } from 'components/isMobile'
import SalesSection from 'views/Home/components/SalesSection';
import { MSWAPbuttonData } from './data';


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

const MswapHero = () => {
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

        
        <Flex m="24px" height="100%" alignItems="center" justifyContent="space-between" flexDirection="column" style={{ flex: 1, textAlign: 'center' }}>
            <Flex flexDirection="row" alignItems="center" justifyContent="center">
              <img src="/logo2.png" alt="Desktop Logo" className="desktop-icon" style={{ width: `125px` }} />
              <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize='48px' color="primary">MARSWAP</Text>
            </Flex>
            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "32px" : "28px"} color="secondary" mb="8px">
              Your ticket to MARS!
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
              MARSWAP Token ( $MSWAP) represents a groundbreaking opportunity within the MARSWAP ecosystem.
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="secondary" mb="8px">
              Designed as a trading token. 
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
              $MSWAP plays a pivotal role in the decentralized finance ( DeFI ) landscape. 
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
              It offers users a unique chance to trade and earn on price movement as it operates with 0% tax and has a renounced contract.
            </Text>

            <Flex m="16px" alignItems="flex-end" justifyContent="center" flexDirection={isMobile ? "column" : "row"}>
              <Link m="16px" href="/#/swap?outputCurrency=0x4bE2b2C45b432BA362f198c08094017b61E3BDc6&dex=shibSwap">
                <Button variant={!account ? 'secondary' : 'primary'}>{t('BUY MARSWAP')}</Button>
              </Link>
            </Flex>

        </Flex>

      </ContentContainer>

      <SalesSection buttons={MSWAPbuttonData} />

    </Flex>
  );
};

export default MswapHero;
