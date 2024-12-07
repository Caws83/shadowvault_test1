import React from 'react';
import styled from 'styled-components';
import { Flex, Link, Button, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { KYCButtonData } from './data';
import { isMobile } from 'components/isMobile'
import ButtonCard from './ButtonsCard';


// Define styled components for background video
const ContentContainer = styled(Flex)`
  flex-direction: column;
  position: relative;
  min-width: 70%;
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

  return (
    
    <Flex
    flexDirection={isMobile ? 'column' : 'row'}
    >
      <ContentContainer>
        {/* Background Video */}
        <VideoBackground id="background-video" autoPlay loop muted>
          <source src={"/images/home/backgrounds/backVid4.mp4"} type="video/mp4" />
        </VideoBackground>

        
          <Flex m="8px" height="100%" alignItems="center" justifyContent="space-between" flexDirection="column" style={{ textAlign: 'center' }}>
            <img src="/images/home/logoWithText.svg" alt="Desktop Logo" className="desktop-icon" style={{ width: `240px` }} />

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "28px" : "32px"} bold color="text" mb="18px">
              KNOW YOUR CUSTOMER
            </Text>

            <Flex alignItems="flex-end" justifyContent="center" mb="12px">
              <Link href="mailto:TEAM@MARSWAP.EXCHANGE">
                <Button variant='primary'>{t('GET YOURS TODAY')}</Button>
              </Link>
            </Flex>

            <Text style={{ textShadow: '3px 3px 6px black' }} fontSize={isMobile ? "24px" : "28px"} bold color="secondary" mb="12px">
            VERIFF AND MARSWAP
            </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="6px">
            Marswap's integration with Veriff for KYC is vital for project owners, ensuring a secure and compliant decentralized environment.

              
              </Text>
              <Text style={{ textShadow: '3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="6px">
              Veriff's identity verification processes enhance credibility, attract reliable users, and mitigate the risk of fraud. 
              </Text>

            <Text style={{ textShadow: '3px 3px 6px black' }} bold fontSize={isMobile ? "14px" : "22px"} mb="6px">
            This collaboration empowers project leaders to navigate regulatory challenges, fostering confidence among investors and stakeholders in the crypto space.
            </Text>

          
            <img src="/images/home/KYC/veriff.png" alt="veriff Logo" className="desktop-icon" style={{ width: `240px` }} />

          

        </Flex>
        
      </ContentContainer>

      <ButtonCard buttons={KYCButtonData}/>

    </Flex>
  );
};

export default Hero;
