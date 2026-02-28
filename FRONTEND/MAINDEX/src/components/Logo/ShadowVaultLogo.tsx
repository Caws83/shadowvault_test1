import React from 'react'
import styled from 'styled-components'
import { isMobile } from 'components/isMobile'

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ShieldIcon = styled.div<{ $isMobile: boolean }>`
  width: ${({ $isMobile }) => $isMobile ? '32px' : '40px'};
  height: ${({ $isMobile }) => $isMobile ? '32px' : '40px'};
  position: relative;
  background: linear-gradient(135deg, #808080 0%, #606060 100%);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    position: absolute;
    width: 60%;
    height: 60%;
    background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 0 4px rgba(220, 20, 60, 0.8));
  }
`

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`

const MainText = styled.span<{ $isMobile: boolean }>`
  font-size: ${({ $isMobile }) => $isMobile ? '18px' : '24px'};
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 0 10px rgba(220, 20, 60, 0.5);
  letter-spacing: 1px;
`

const SubText = styled.span<{ $isMobile: boolean }>`
  font-size: ${({ $isMobile }) => $isMobile ? '10px' : '12px'};
  font-weight: 500;
  color: #DC143C;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 2px;
`

interface ShadowVaultLogoProps {
  showSubtext?: boolean
}

const ShadowVaultLogo: React.FC<ShadowVaultLogoProps> = ({ showSubtext = true }) => {
  const mobile = isMobile()
  
  return (
    <LogoContainer>
      <ShieldIcon $isMobile={mobile} />
      <LogoText>
        <MainText $isMobile={mobile}>ShadowVault</MainText>
        {showSubtext && <SubText $isMobile={mobile}>Protocol</SubText>}
      </LogoText>
    </LogoContainer>
  )
}

export default ShadowVaultLogo

