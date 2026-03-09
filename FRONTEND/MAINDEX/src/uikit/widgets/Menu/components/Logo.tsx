import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Flex from '../../../components/Box/Flex';

interface Props {
  isDark: boolean;
  href: string;
}

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
  text-decoration: none;

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: 12px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 22px;
  width: 72px;
  flex-shrink: 0;

  ${({ theme }) => theme.mediaQueries.sm} {
    height: 32px;
    width: 96px;
  }
`;

const LogoImage = styled.img`
  height: 100%;
  width: 100%;
  object-fit: contain;
  object-position: left;
`;

const TextContainer = styled.div`
  display: grid;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  font-size: 12px;
  line-height: 1;
  width: max-content;

  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 14px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 16px;
  }
`;

const TopText = styled.span`
  white-space: nowrap;
`;

const ShadowText = styled.span<{ isDark: boolean }>`
  color: ${({ isDark, theme }) => isDark ? '#FFFFFF' : theme.colors.text};
`;

const VaultText = styled.span`
  color: #E11D2E;
`;

const BottomText = styled.span`
  margin-top: -1px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  background: linear-gradient(to right, #9ca3af, #4b5563);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-top: 3px;
  }
`;

const Logo: React.FC<Props> = ({ isDark, href }) => {
  const isAbsoluteUrl = href.startsWith('http');
  
  const innerContent = (
    <>
      <ImageContainer>
        <LogoImage 
          src="/images/shadow-vault-logo.png" 
          alt="ShadowVault Protocol" 
        />
      </ImageContainer>
      <TextContainer>
        <TopText>
          <ShadowText isDark={isDark}>Shadow</ShadowText>
          <VaultText> Vault</VaultText>
        </TopText>
        <BottomText>
          {"Protocol".split("").map((letter, i) => (
            <span key={i}>{letter}</span>
          ))}
        </BottomText>
      </TextContainer>
    </>
  );

  return (
    <Flex>
      {isAbsoluteUrl ? (
        <StyledLink as="a" href={href} aria-label="ShadowVault Protocol">
          {innerContent}
        </StyledLink>
      ) : (
        <StyledLink to={href} aria-label="ShadowVault Protocol">
          {innerContent}
        </StyledLink>
      )}
    </Flex>
  );
};

export default React.memo(Logo, (prev, next) => prev.isDark === next.isDark);
