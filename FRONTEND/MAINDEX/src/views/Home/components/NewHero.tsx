import React from 'react'
import { Flex, Text } from 'uikit'
import { FaChartLine, FaUserShield } from 'react-icons/fa'
import { GiThorHammer } from 'react-icons/gi'
import { BsCurrencyExchange } from 'react-icons/bs'
import { Link } from 'react-router-dom'  // <-- add this

import { useTranslation } from 'contexts/Localization'
import { useAccount } from 'wagmi'
import { isMobile } from 'components/isMobile'

const Hero = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const mobile = isMobile()

  const handleAskToly = () => {
    console.log("Ask Toly button clicked")

  }

  return (
    <div style={{ minHeight: '400px', padding: '20px', background: '#000' }}>
      <div className="hero-container" style={{ minHeight: '400px' }}>
        <div className="text-container">
          <Flex flexDirection="column">
            {/* Main Headline */}
            <Text className="hero-headline" fontSize={mobile ? '32px' : '48px'} bold>
              ShadowVault Protocol
            </Text>

            {/* Subheadline */}
            <Text
              className="hero-subheadline"
              fontSize={mobile ? '16px' : '20px'}
              color="#dadad2"
              maxWidth="600px"
            >
              Trade in Shadows. Leverage Fearless. Privacy-centric DEX with AI-driven leverage trading.
            </Text>

            {/* Key Features */}
            <Flex flexDirection="column" mt="20px">
              <div className="feature-item">
                <CheckIcon /> Zero-Knowledge Privacy - Complete transaction anonymity
              </div>
              <div className="feature-item">
                <CheckIcon /> Uniswap Liquidity - Deep pools for optimal execution
              </div>
              <div className="feature-item">
                <CheckIcon /> AI Trading Agent - Safe Mode (5-10x) or Psycho Mode (100x)
              </div>
            </Flex>

            {/* Stats or Social Proof */}
            <Flex mt="32px" width="100%" justifyContent="space-between">
              <div className="stat-item">
                <Text fontSize="24px" bold color="#dadad2">
                  100%
                </Text>
                <Text fontSize="14px" color="#dadad2">
                  Fair Launch
                </Text>
              </div>
              <div className="stat-item">
                <Text fontSize="24px" bold>
                  AI-Powered
                </Text>
                <Text fontSize="14px">Security</Text>
              </div>
              <div className="stat-item">
                <Text fontSize="24px" bold>
                  24/7
                </Text>
                <Text fontSize="14px">AI Support</Text>
              </div>
            </Flex>
          </Flex>
        </div>

        {!mobile && (
          <div className="action-panel">
            {/* Quick Token Forge -> /marscreate */}
            <Link to="/swap">
              <button className="quick-action-button hero-cta-button btnBorderAnim">
                Trade Now <BsCurrencyExchange style={{ width: '30px', height: '30px' }} />
              </button>
            </Link>

            <Link to="/swap">
              <button className="quick-action-button hero-cta-button">
                AI Agents <FaUserShield />
              </button>
            </Link>

            <Link to="/liquidity">
              <button className="quick-action-button hero-cta-button">
                Add Liquidity <FaChartLine />
              </button>
            </Link>

            <button
              className="quick-action-button hero-cta-button"
              onClick={handleAskToly}
            >
              AI Agents <FaUserShield />
            </button>

            <Flex flexDirection="column" mt="24px">
              <Text fontSize="14px" color="textSubtle">
                Platform Statistics
              </Text>
              <Flex justifyContent="space-between">
                <Text>Total Tokens Launched</Text>
                <Text bold>1,234</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Active Traders</Text>
                <Text bold>5.2K</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Total Value Locked</Text>
                <Text bold>$2.1M</Text>
              </Flex>
            </Flex>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable check icon
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
)

export default Hero
