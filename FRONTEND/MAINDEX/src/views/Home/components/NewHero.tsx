import React, { useEffect, useState } from 'react';
import { Flex, Link, Button, Text } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useAccount } from 'wagmi';
import { isMobile } from 'components/isMobile';
import { 
  FaRocket, 
  FaChartLine, 
  FaShieldAlt, 
  FaLock, 
  FaUserShield 
} from 'react-icons/fa';
import { 
  BsFillLightningFill, 
  BsCurrencyExchange 
} from 'react-icons/bs';

const Hero = () => {
  const { t } = useTranslation();
  const { address: account } = useAccount();

  return (
    <>
      <div className="hero-container">
        <div className="text-container">
          <Flex flexDirection="column">
            {/* Main Headline */}
            <Text className="hero-headline" fontSize={isMobile ? '32px' : '48px'} bold>
              Launch Tokens with AI
            </Text>
            
            {/* Subheadline */}
            <Text className="hero-subheadline" fontSize={isMobile ? '16px' : '20px'} color="#dadad2" maxWidth="600px">
              AI-powered DEX that makes token launches safer than PumpFun
            </Text>

            {/* Key Features */}
            <Flex flexDirection="column" mt="20px">
              <div className="feature-item">
                <CheckIcon /> Instant Token Launch (1-8 hours graduation)
              </div>
              <div className="feature-item">
                <CheckIcon /> AI-Powered Security
              </div>
              <div className="feature-item">
                <CheckIcon /> Managed by Toly - Your AI Token Launch Assistant
              </div>
            </Flex>

            {/* Stats or Social Proof */}
            <Flex mt="32px" width="100%" justifyContent="space-between">
              <div className="stat-item">
                <Text fontSize="24px" bold color="#dadad2">100%</Text>
                <Text fontSize="14px" color="#dadad2">Fair Launch</Text>
              </div>
              <div className="stat-item">
                <Text fontSize="24px" bold>AI-Powered</Text>
                <Text fontSize="14px">Security</Text>
              </div>
              <div className="stat-item">
                <Text fontSize="24px" bold>24/7</Text>
                <Text fontSize="14px">AI Support</Text>
              </div>
            </Flex>
          </Flex>
        </div>

        {!isMobile && (
          <div className="action-panel">
            <button className="quick-action-button hero-cta-button">
              Quick Token Forge <FaRocket />
            </button>
            
            <button className="quick-action-button hero-cta-button">
              Trade Now <BsCurrencyExchange />
            </button>
            
            <button className="quick-action-button hero-cta-button">
              Create Presale <FaChartLine />
            </button>
            
            <button className="quick-action-button hero-cta-button">
              Ask Toly <FaUserShield />
            </button>

            {/* Optional: Add some stats or info */}
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
    </>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

export default Hero;
