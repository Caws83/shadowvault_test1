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

  // const [onPresentLegal] = useModal(<Legal />)
  const [onPresentTerms] = useModal(<Terms />)
  const [onPresentPrivacy] = useModal(<Privacy />)

  const location = useLocation();

  return (
    <Flex mr={isMobile ? "" : "32px"} >
      <Flex justifyContent="center" alignItems="center" flexDirection="row">
        {/* <StyledButton scale="xs" variant="text" onClick={onPresentLegal}>
          Legal
        </StyledButton> */}
      </Flex>
    </Flex>
  );
}

export default FooterLinks;
