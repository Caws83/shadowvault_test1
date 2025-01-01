import React from 'react';
import { Flex, Button, Text, useModal, Link } from 'uikit';
import { FaTelegram, FaTwitter } from 'react-icons/fa';
import {
  StyledFooter,
  StyledSocialLinks,
} from './styles';
import { FooterProps } from './types';
import { isMobile } from 'components/isMobile';
import Terms from './Components/Terms'
import Privacy from './Components/Privacy'
import Disclaimer from './Components/Disclaimer'
// import Legal from './Components/Legal';
import { styled } from 'styled-components';
import { useLocation } from 'react-router-dom';

const StyledImage = styled.img`
  width: 40px;
`;

const StyledButton = styled(Button)`
  font-size: 16px;
  color: #dadad2;
  svg {
    font-size: 20px;
    margin-right: 4px;
    color: #dadad2;
  }
`;

const FooterLinks = () => {
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
  
  const handleDisclaimer = () => {
    window.open('https://solforgeai.com/disclaimer/', '_blank', 'noopener noreferrer');
  };

  // const [onPresentLegal] = useModal(<Legal />)
  const [onPresentTerms] = useModal(<Terms />)
  const [onPresentPrivacy] = useModal(<Privacy />)
  const [onPresentDisclaimer] = useModal(<Disclaimer />)

  const location = useLocation();

  return (
    <Flex mr={isMobile ? "" : "32px"} >
      <Flex justifyContent="center" alignItems="center" flexDirection="row">
        {/* <StyledButton scale="xs" variant="text" onClick={onPresentLegal}>
          Legal
        </StyledButton> */}
        <StyledButton scale="xs" variant="text" onClick={handleDocs}>
          Documentation
        </StyledButton>
        <StyledButton scale="xs" variant="text" onClick={handleDisclaimer}>
          Disclaimer
        </StyledButton>
        <StyledButton scale="xs" variant="text" onClick={handleTelegram}>
          <FaTelegram />
        </StyledButton>
        <StyledButton scale="xs" variant="text" onClick={handleTwitter}>
          <FaTwitter />
        </StyledButton>
      </Flex>
    </Flex>
  );
}

export default FooterLinks;
