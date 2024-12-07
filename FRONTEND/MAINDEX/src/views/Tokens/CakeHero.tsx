import React from 'react';
import styled from 'styled-components';
import { Flex, Text, Link, Button } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import { isMobile } from 'components/isMobile'
import { MSWAPFbuttonData } from './data';
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
  object-fit: cover;
  transform: scaleX(-1); /* Flip the video horizontally */
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
              <img src="/images/tokens/MSWAP.png" alt="Desktop Logo" className="desktop-icon" style={{ width: `125px` }} />
              <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize='48px' color="primary">MARSWAP FARM</Text>
            </Flex>
            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "32px" : "28px"} color="secondary" mb="8px">
              MARSWAP Farming Token
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
            $MSWAPF on Shibarium: Within the ecosystem
            </Text>
           
            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
              users can participate in yield farming using the $MSWAPF token on Shibarium
            </Text>

            <Text bold style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "18px" : "18px"} color="text" mb="8px">
              enabling them to earn rewards through liquidity provision and farming activities.
            </Text>

            <Flex m="16px" alignItems="flex-end" justifyContent="center" flexDirection={isMobile ? "column" : "row"}>
              <Link m="16px" href="/#/swap?outputCurrency=0xABbAF2746C46f8F269e0a252285ABE9d8D8CDf63&dex=marswap">
                <Button variant={!account ? 'secondary' : 'primary'}>{t('BUY MSWAPF')}</Button>
              </Link>
            </Flex>

        </Flex>

      </ContentContainer>

      <SalesSection buttons={MSWAPFbuttonData} />

    </Flex>
  );
};

export default CakeHero;
