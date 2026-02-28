import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Box, Card } from 'uikit'
import { isMobile } from 'components/isMobile'

const PillarCard = styled(Card)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #DC143C, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: #DC143C;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(220, 20, 60, 0.3);

    &::before {
      opacity: 1;
    }
  }
`

const PillarIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #DC143C 0%, #8B0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(220, 20, 60, 0.4);
`

const ThreePillars: React.FC = () => {
  const mobile = isMobile()
  
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      py="64px"
      px={mobile ? "16px" : "48px"}
      style={{ background: 'linear-gradient(180deg, #000000 0%, #0A0A0A 100%)' }}
    >
      <Text
        bold
        fontSize={mobile ? "32px" : "48px"}
        color="text"
        mb="16px"
        textAlign="center"
        style={{ textShadow: '0 0 20px rgba(220, 20, 60, 0.5)' }}
      >
        ShadowVault Protocol
      </Text>
      <Text
        fontSize={mobile ? "18px" : "24px"}
        color="secondary"
        mb="48px"
        textAlign="center"
      >
        Three Pillars of Power
      </Text>

      <Flex
        flexDirection={mobile ? "column" : "row"}
        gap="32px"
        maxWidth="1200px"
        width="100%"
      >
        {/* Pillar 1: Zero-Knowledge Privacy */}
        <PillarCard flex="1">
          <Flex flexDirection="column" alignItems="center" textAlign="center">
            <PillarIcon>🔒</PillarIcon>
            <Text bold fontSize="24px" color="text" mb="12px">
              Zero-Knowledge Privacy
            </Text>
            <Text fontSize="16px" color="textSubtle" mb="16px">
              Trade assets pseudonymously with zero-knowledge proofs. 
              Your transactions remain completely hidden: no visible wallet traces, 
              positions, entries/exits, or history.
            </Text>
            <Box
              style={{
                background: 'rgba(220, 20, 60, 0.1)',
                border: '1px solid #DC143C',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
              }}
            >
              <Text fontSize="14px" color="text">
                <strong>Uniswap's Private Shadow</strong> - Pull deep liquidity 
                from Uniswap pools while maintaining complete anonymity.
              </Text>
            </Box>
          </Flex>
        </PillarCard>

        {/* Pillar 2: Uniswap Liquidity */}
        <PillarCard flex="1">
          <Flex flexDirection="column" alignItems="center" textAlign="center">
            <PillarIcon>💧</PillarIcon>
            <Text bold fontSize="24px" color="text" mb="12px">
              Uniswap Liquidity
            </Text>
            <Text fontSize="16px" color="textSubtle" mb="16px">
              Tap into Uniswap's vast liquidity pools for seamless swaps with 
              minimal slippage. Deep liquidity ensures optimal execution prices 
              for all your trades.
            </Text>
            <Box
              style={{
                background: 'rgba(220, 20, 60, 0.1)',
                border: '1px solid #DC143C',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
              }}
            >
              <Text fontSize="14px" color="text">
                <strong>Best Execution</strong> - Access the deepest liquidity 
                pools across all major trading pairs.
              </Text>
            </Box>
          </Flex>
        </PillarCard>

        {/* Pillar 3: AI Agent Power */}
        <PillarCard flex="1">
          <Flex flexDirection="column" alignItems="center" textAlign="center">
            <PillarIcon>🤖</PillarIcon>
            <Text bold fontSize="24px" color="text" mb="12px">
              AI Agent Power
            </Text>
            <Text fontSize="16px" color="textSubtle" mb="16px">
              Deploy an optional AI agent for leveraged positions. Safe Mode 
              (5-10x) with automated risk controls, or Full Psycho Mode (100x) 
              for high-risk, high-reward plays.
            </Text>
            <Box
              style={{
                background: 'rgba(220, 20, 60, 0.1)',
                border: '1px solid #DC143C',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
              }}
            >
              <Text fontSize="14px" color="text">
                <strong>AI-Driven Trading</strong> - Machine learning analyzes 
                on-chain data, sentiment, and patterns to optimize your positions.
              </Text>
            </Box>
          </Flex>
        </PillarCard>
      </Flex>

      <Text
        fontSize={mobile ? "16px" : "20px"}
        color="textSubtle"
        mt="48px"
        textAlign="center"
        maxWidth="800px"
        style={{ fontStyle: 'italic' }}
      >
        "Trade in Shadows. Leverage Fearless."
      </Text>
    </Flex>
  )
}

export default ThreePillars

