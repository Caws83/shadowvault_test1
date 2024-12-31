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

const Logo: React.FC<Props> = ({ isDark, href }) => {
  const isAbsoluteUrl = href.startsWith('http');
  const innerLogo = (
    <>
      {isMobile ? (
        <img src="/images/home/sol-forge-ai-logo.png" alt="Sol Forge AI" className="mobile-icon" />
      ) : (
        <img src="/images/home/sol-forge-ai-logo.png" alt="Sol Forge AI" className="desktop-icon" />
      )}
    </>
  );

  return (
    <Flex>
      {isAbsoluteUrl ? (
        <StyledLink to={href} aria-label="MarSwap Dex">
          {innerLogo}
        </StyledLink>
      ) : (
        <StyledLink to={href} aria-label="MarSwap Dex">
          {innerLogo}
        </StyledLink>
      )}
    </Flex>
  );
};

export default React.memo(Logo, (prev, next) => prev.isDark === next.isDark);
