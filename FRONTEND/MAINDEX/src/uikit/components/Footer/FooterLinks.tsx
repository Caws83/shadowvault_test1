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

const StyledImage = styled.img`
  width: 40px;
  `;

const FooterLinks  = ({

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

      <Flex mr={isMobile ? "" : "32px"} >
  
        <Flex justifyContent="center" alignItems="center" flexDirection="row">
             
    

     
          <Button scale="xs" variant="text" onClick={onPresentLegal} >
            Legal
          </Button>
       
     
          <Button scale="xs" variant="text" onClick={handleDocs} >
            Documentation
          </Button>
   
        <Button scale="xs" variant="text" onClick={handleTelegram} >
              Telegram
            </Button>
            <Button scale="xs" variant="text" onClick={handleTwitter} >
              Twitter/X
            </Button>  
          <Button scale="xs" variant="text" onClick={handleEmailClick} >
            Email
          </Button>         
          </Flex>

      </Flex>

  );
  


  
}
export default FooterLinks;
