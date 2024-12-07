import React from 'react';
import { Flex } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { isMobile } from 'components/isMobile'
import { buttonData } from './PartnerSection/data';
import PartnerSection from './PartnerSection';





const Hero = () => {
  const { t } = useTranslation();

  return (
    
    <Flex
    flexDirection={isMobile ? 'column' : 'row'}
    >
      <PartnerSection buttons={buttonData}/>

    </Flex>
  );
};

export default Hero;
