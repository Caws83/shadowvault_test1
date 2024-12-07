import React, { useEffect, useState } from 'react';
import { Flex } from 'uikit';
import { styled } from 'styled-components';
import { isMobile } from 'components/isMobile';


export interface logoButtons {
  logo: string;
}

interface LogoSectionProps {
  buttons: logoButtons[];
}

const Page = styled.a`
  padding: 12px;
  transition: all 0.3s ease;
  width: 100%;
  &:hover {
    transform: scale(1.05);
  }
`;



const LogoCard: React.FC<LogoSectionProps> = ({ buttons }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
useEffect(() => {
  const intervalId = setInterval(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % buttons.length);
  }, 2500); // Change image every 5 seconds

  return () => {
    clearInterval(intervalId);
  };
}, []);

  return (
    
    <Page>
          <img 
            src={`/images/partners/${buttons[currentIndex].logo}.png`} 
            alt="Logo" 
            className="desktop-icon"  
          />
    </Page>
    

  );
};

export default LogoCard;
