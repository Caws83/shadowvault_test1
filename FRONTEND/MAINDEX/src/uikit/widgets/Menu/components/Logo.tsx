import React from 'react';
import { isMobile } from 'components/isMobile';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Flex from '../../../components/Box/Flex';

interface Props {
  isDark: boolean;
  href: string;
}

const blink = keyframes`
  0%,  100% { transform: scaleY(1); } 
  50% { transform:  scaleY(0.1); } 
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  .mobile-icon {
    width: 120px;
    ${({ theme }) => theme.mediaQueries.nav} {
      display: none;
    }
  }
  .desktop-icon {
    width: 200px;
    display: none;
    ${({ theme }) => theme.mediaQueries.nav} {
      display: block;
    }
  }
`;

const LogoImage = styled.img<{ $isMobile: boolean }>`
  height: ${({ $isMobile }) => $isMobile ? '40px' : '50px'};
  width: auto;
  object-fit: contain;
  max-width: ${({ $isMobile }) => $isMobile ? '200px' : '300px'};
`;

const Logo: React.FC<Props> = ({ isDark, href }) => {
  const isAbsoluteUrl = href.startsWith('http');
  const mobile = isMobile();
  
  const innerLogo = (
    <LogoImage 
      src="/images/home/marswap.png" 
      alt="ShadowVault Protocol" 
      $isMobile={mobile}
    />
  );

  return (
    <Flex>
      {isAbsoluteUrl ? (
        <StyledLink to={href} aria-label="ShadowVault Protocol">
          {innerLogo}
        </StyledLink>
      ) : (
        <StyledLink to={href} aria-label="ShadowVault Protocol">
          {innerLogo}
        </StyledLink>
      )}
    </Flex>
  );
};

export default React.memo(Logo, (prev, next) => prev.isDark === next.isDark);
