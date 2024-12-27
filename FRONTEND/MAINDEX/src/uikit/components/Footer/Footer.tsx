import React from 'react';
import { Flex, Button, Text, useModal, Link } from 'uikit';
import {
  StyledFooter,
  StyledSocialLinks,
} from './styles';
import { FooterProps } from './types';
import { isMobile } from 'components/isMobile';
import Terms from './Components/Terms'
import Privacy from './Components/Privacy'
import Disclaimer from './Components/Disclaimer'
import Legal from './Components/Legal';
import { styled } from 'styled-components';
import { useLocation } from 'react-router-dom';
import { footerLinks } from 'components/Menu/footerConfig';
import FooterLinks from './FooterLinks';

const StyledImage = styled.img`
  width: 40px;
  `;

const MenuItem: React.FC<FooterProps> = ({
  isDark,
  toggleTheme,
  ...props
}) => {

  const handleEmailClick = () => {
    window.location.href = 'mailto:team@zk.marswap.exchange';
  };
  
  const handleTelegram = () => {
    window.open('https://t.me/MSWAP_LAUNCHPAD', '_blank', 'noopener noreferrer');
  };
  const handleTwitter = () => {
    window.open('https://twitter.com/MARSWAP1', '_blank', 'noopener noreferrer');
  };
  const handleDocs = () => {
    window.open('https://zkdocs.marswap.exchange', '_blank', 'noopener noreferrer');
  };
  const [onPresentLegal] = useModal(<Legal />)
  const [onPresentTerms] = useModal(<Terms />)
  const [onPresentPrivacy] = useModal(<Privacy />)
  const [onPresentDisclaimer] = useModal(<Disclaimer />)

  const location = useLocation();

  return (
    <StyledFooter p={['20px 3px', null, '6px 12px 8px 12px']} {...props} justifyContent={isMobile ?  "center" : "space-between"} mt="auto">
    
        {!isMobile &&
          <Flex justifyContent="flex-start" alignItems="flex-start" height="100%"> 
            <span className="poweredBy">Built on Solana</span>
          </Flex>
          
        }

{!isMobile ? 
     <FooterLinks/>      
 : null}
        {isMobile && location.pathname === "/"  ? 
     <FooterLinks/>

  
       


       
 : null}
     
    </StyledFooter>
  );
  


  
}
export default MenuItem;
