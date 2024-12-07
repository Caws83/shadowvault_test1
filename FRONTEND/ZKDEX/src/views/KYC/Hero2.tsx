import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Flex } from 'uikit';
import { KYCCerts, LogoButtonData } from './data';
import { isMobile } from 'components/isMobile';
import LogoCard from './LogoCard';

const ContentContainer = styled(Flex)`
  flex-direction: column;
  position: relative;
  min-width: 70%;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
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
`;

const Hero2 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % KYCCerts.length);
    }, 4500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Ensure video keeps playing when currentIndex changes
    const video = document.getElementById('background-video') as HTMLVideoElement;
    video.play().catch(err => console.error(err));
  }, [currentIndex]);

  return (
    <Flex flexDirection={isMobile ? 'column-reverse' : 'row'}>
      <LogoCard buttons={LogoButtonData} />

      <ContentContainer>
        <VideoBackground id="background-video" autoPlay loop muted>
          <source src={"/images/home/backgrounds/backVid5.mp4"} type="video/mp4" />
        </VideoBackground>

        <Flex alignItems="center" justifyContent="center" height="100%">
          <img 
            src={`/images/home/KYC/audits/${KYCCerts[currentIndex].logo}.png`} 
            alt="Logo" 
            className="desktop-icon" 
            style={{ 
              width: `240px`, 
              borderRadius: '12px', 
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 5)' 
            }} 
          />
        </Flex>
      </ContentContainer>
    </Flex>
  );
};

export default Hero2;
