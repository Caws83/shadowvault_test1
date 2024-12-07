import React from 'react';
import { Flex, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { styled } from 'styled-components';
import { isMobile } from 'components/isMobile';


export interface PartnerSectionButton {
  to: string;
  external: boolean;
  name: string;
  logo: string;
}

interface PartnerSectionProps {
  buttons: PartnerSectionButton[];
}


const Page = styled.a`
  background-image: url('images/home/backgrounds/backRed.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 1px solid #818589;
  border-radius: 8px;
  padding: 12px;
  margin: ${isMobile ? '16px' : '8px'};
  width: ${isMobile ? '85%' : null};
  transition: all 0.3s ease;
  display: flex;
  &:hover {
    transform: scale(1.05);
  }
`;

const PartnerSection: React.FC<PartnerSectionProps> = ({ buttons }) => {
  const { t } = useTranslation();

  return (
    <Flex flexDirection="row" flexWrap="wrap" justifyContent="center">
      {buttons.map((button, index) => (
        <Page key={index} href={button.to} target={button.external ? '_blank' : undefined} >
          <Flex flexDirection="row" alignItems="center" p="8px">
            <img src={`/images/partners/${button.logo}.png`} alt="Desktop Logo" className="desktop-icon" style={{ height: `80px` }} />
            <Text fontSize="20px" ml="8px" >{button.name}</Text>
          </Flex>
        </Page>
      ))}
      
      
    </Flex>
  );
};

export default PartnerSection;
