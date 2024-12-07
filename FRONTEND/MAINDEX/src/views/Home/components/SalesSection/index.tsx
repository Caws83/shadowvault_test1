import React from 'react';
import { Flex, Text, TicketFillIcon } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { keyframes, styled } from 'styled-components';
import { isMobile } from 'components/isMobile';
import IconCard, { IconCardData } from '../IconCard';
import LotteryCardContent from '../WinSection/LotteryCardContent';
import tokens from 'config/constants/tokens';

export interface SalesSectionButton {
  to: string;
  text: string;
  external: boolean;
  name: string;
}

interface SalesSectionProps {
  buttons: SalesSectionButton[];
  isHome?: boolean;
}


const Page = styled.a`
  background-image: url('images/home/backgrounds/backRed.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 12px;
  margin: ${isMobile ? '16px' : '6px'};
  transition: all 0.3s ease;
  width: ${isMobile ? '41%' : '30%'};
  min-height: ${isMobile ? "30vh" : "30%"};
  display: flex;
  flex-direction: column;
  &:hover {
    transform: scale(1.05);
  }
`;

const LotteryPage = styled.a`
  background-image: url('images/home/backgrounds/backRed.jpg'); 
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 12px;
  margin: ${isMobile ? '16px' : '6px'};
  transition: all 0.3s ease;
  width: ${isMobile ? '80%' : '30%'};
  min-height: ${isMobile ? "100%" : '30%'};
  display: flex;
  flex-direction: column;
  &:hover {
    transform: scale(1.1) rotate(-1.36deg); /* Include rotation in hover state */
  }
`;


const SalesSection: React.FC<SalesSectionProps> = ({ buttons, isHome }) => {
  const { t } = useTranslation();

  return (
    <Flex flexDirection="row" flexWrap="wrap" height={isMobile ? null : "85vh"} justifyContent="center">
      {buttons.map((button, index) => (
        <Page key={index} href={button.to} target={button.external ? '_blank' : undefined} >
          <Text bold fontSize="16px">{button.text}</Text>
          <Flex justifyContent="flex-end" alignItems="flex-end" style={{ flex: 1 }}>
            <Text color="secondary" bold fontSize="18px">
              {t(button.name)}
            </Text>
          </Flex>
        </Page>
      ))}
      
       
      {isHome &&
      <LotteryPage>
          <LotteryCardContent lotteryToken={tokens.mswap} />
      </LotteryPage>
      }
      
          
    </Flex>
  );
};

export default SalesSection;
