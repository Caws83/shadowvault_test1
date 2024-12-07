import React from 'react';
import { Flex, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { styled } from 'styled-components';
import { isMobile } from 'components/isMobile';


export interface SalesSectionButton {
  text: string;
  name: string;
}

interface SalesSectionProps {
  buttons: SalesSectionButton[];
}


const Page = styled.a`
  background-image: url('images/home/backgrounds/backRed.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 12px;
  margin: ${isMobile ? '12px' : '6px'};
  transition: all 0.3s ease;
  width: 80%;
  min-height: ${isMobile ? "15vh" : "21%"};
  display: flex;
  flex-direction: column;
  &:hover {
    transform: scale(1.05);
  }
`;


const ButtonCard: React.FC<SalesSectionProps> = ({ buttons }) => {
  const { t } = useTranslation();

  return (
    <Flex flexDirection="row" flexWrap="wrap" height={isMobile ? null : "75vh"} justifyContent="center">
      {buttons.map((button, index) => (
        <Page key={index}  >
          <Flex alignItems="flex-end" justifyContent="center" style={{ flex: 1 }}>
          <Text color="secondary" fontSize="24px" >{button.text}</Text>
          </Flex>
          <Flex alignItems="flex-end" justifyContent="center" style={{ flex: 1 }}>
            <Text color="text" bold fontSize="18px">
              {t(button.name)}
            </Text>
          </Flex>
        </Page>
      ))}
    
    </Flex>
  );
};

export default ButtonCard;
