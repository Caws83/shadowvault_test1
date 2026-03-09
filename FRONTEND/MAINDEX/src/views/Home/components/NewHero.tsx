import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { isMobile } from 'components/isMobile'

const HeroWrapper = styled.div`
  min-height: calc(100vh - 80px);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`

const ContentContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const MainTitle = styled.h1`
  font-size: 64px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 44px;
  }
`

const SubTitle = styled.div`
  font-size: 20px;
  color: #f0f0f0;
  margin-bottom: 16px;
  line-height: 1.6;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.8);
  font-weight: 500;
`

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;
`

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FeatureTitle = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #fff;
`

const FeatureDesc = styled.div`
  font-size: 15px;
  color: #b0b0b0;
  line-height: 1.4;
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: rgba(20, 20, 22, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  margin-top: 16px;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    flex-direction: column;
    background: transparent;
    border: none;
    padding: 0;
    gap: 12px;
    box-shadow: none;
    backdrop-filter: none;
  }
`

const InputPlaceholder = styled.div`
  flex: 1;
  color: #aaa;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 500;

  @media (max-width: 768px) {
    width: 100%;
    background: rgba(20, 20, 22, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    box-sizing: border-box;
  }
`

const StartButton = styled.button`
  background: linear-gradient(9deg, rgb(220, 20, 60) 0%, rgb(139, 0, 0) 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(220, 20, 60, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(220, 20, 60, 0.4);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

const RightSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Card = styled.div`
  background: rgba(20, 20, 22, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(220, 20, 60, 0.4);
    background: rgba(30, 30, 35, 0.7);
  }
`

const CardTitle = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
`

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`

const Hero = () => {
  const mobile = isMobile()

  return (
    <HeroWrapper>
      <ContentContainer>
        <LeftSection>
          <MainTitle>
            Shadow<span style={{ color: '#f41927' }}>Vault</span><br />
            Protocol
          </MainTitle>
          
          <SubTitle>
            Trade in Shadows. Leverage Fearlessly.<br />
            Privacy-centric DEX with AI-driven trading.
          </SubTitle>

          <InputGroup>
            <InputPlaceholder>Connect your wallet</InputPlaceholder>
            <Link to="/swap" style={{ textDecoration: 'none', width: mobile ? '100%' : 'auto' }}>
              <StartButton>Start now</StartButton>
            </Link>
          </InputGroup>
        </LeftSection>

        <RightSection>
          <Card>
            <FeatureItem>
              <FeatureTitle>Zero-Knowledge Privacy</FeatureTitle>
              <FeatureDesc>Complete transaction anonymity</FeatureDesc>
            </FeatureItem>
          </Card>

          <Card>
            <FeatureItem>
              <FeatureTitle>Uniswap Liquidity</FeatureTitle>
              <FeatureDesc>Deep pools for optimal execution</FeatureDesc>
            </FeatureItem>
          </Card>

          <Card>
            <FeatureItem>
              <FeatureTitle>AI Trading Agent</FeatureTitle>
              <FeatureDesc>Safe Mode (5-10x) or Psycho Mode (100x)</FeatureDesc>
            </FeatureItem>
          </Card>
        </RightSection>
      </ContentContainer>
    </HeroWrapper>
  )
}

export default Hero
