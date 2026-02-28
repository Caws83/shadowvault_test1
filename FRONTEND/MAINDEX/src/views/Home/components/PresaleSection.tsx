import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Button, Card, Box } from 'uikit'
import { Link } from 'react-router-dom'
import { isMobile } from 'components/isMobile'

const PresaleContainer = styled.div<{ $isMobile: boolean }>`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ $isMobile }) => $isMobile ? '32px 16px' : '64px 48px'};
  background: linear-gradient(180deg, #000000 0%, #0A0A0A 100%);
`

const PresaleCard = styled(Card)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
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
    opacity: 0.6;
  }

  &:hover {
    border-color: #DC143C;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(220, 20, 60, 0.3);
  }
`

const StatBox = styled(Box)`
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid #DC143C;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(220, 20, 60, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin: 16px 0;
`

const ProgressFill = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #DC143C 0%, #8B0000 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
`

const StyledButton = styled(Button)`
  background-image: linear-gradient(9deg, rgb(220, 20, 60) 0%, rgb(139, 0, 0) 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(220, 20, 60, 0.4);
    transform: translateY(-2px);
  }
`

const PresaleSection: React.FC = () => {
  const mobile = isMobile()
  
  // Mock presale data - replace with actual data from contracts
  const presaleData = {
    tokenPrice: '$0.01 - $0.05',
    softCap: '$5M',
    hardCap: '$7M',
    raised: '$2.1M',
    raisedPercentage: 30, // 2.1M / 7M * 100
    earlyBirdBonus: '20%',
    stakingAPY: '66-80%',
    whitelistSlots: '5,000-10,000',
    minBuy: '$50-100',
    participants: '1,234',
  }

  const fundingAllocation = [
    { label: 'Development & AI', percentage: 40, color: '#DC143C' },
    { label: 'Marketing', percentage: 20, color: '#8B0000' },
    { label: 'Liquidity Provision', percentage: 20, color: '#DC143C' },
    { label: 'Audits & Legal', percentage: 10, color: '#8B0000' },
    { label: 'Reserves', percentage: 10, color: '#DC143C' },
  ]

  return (
    <PresaleContainer $isMobile={mobile} style={{ minHeight: '200px', background: '#000' }}>
      <Flex flexDirection="column" alignItems="center" mb="48px">
        <Text
          bold
          fontSize={mobile ? "32px" : "48px"}
          color="text"
          mb="16px"
          textAlign="center"
          style={{ textShadow: '0 0 20px rgba(220, 20, 60, 0.5)' }}
        >
          $SHDV Token Presale
        </Text>
        <Text
          fontSize={mobile ? "18px" : "24px"}
          color="secondary"
          textAlign="center"
          maxWidth="800px"
        >
          Multi-stage presale to raise $5M for ShadowVault Protocol development, audits, and liquidity bootstrapping
        </Text>
      </Flex>

      <Flex flexDirection={mobile ? "column" : "row"} gap="24px" mb="32px">
        {/* Main Presale Card */}
        <PresaleCard flex="2">
          <Flex flexDirection="column" gap="24px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text bold fontSize="24px" color="text">
                Presale Progress
              </Text>
              <Text fontSize="20px" color="secondary" bold>
                {presaleData.raised} / {presaleData.hardCap}
              </Text>
            </Flex>

            <ProgressBar>
              <ProgressFill percentage={presaleData.raisedPercentage} />
            </ProgressBar>

            <Flex flexDirection={mobile ? "column" : "row"} gap="16px">
              <StatBox flex="1">
                <Text fontSize="14px" color="textSubtle" mb="8px">
                  Token Price
                </Text>
                <Text bold fontSize="20px" color="secondary">
                  {presaleData.tokenPrice}
                </Text>
              </StatBox>
              <StatBox flex="1">
                <Text fontSize="14px" color="textSubtle" mb="8px">
                  Early Bird Bonus
                </Text>
                <Text bold fontSize="20px" color="secondary">
                  {presaleData.earlyBirdBonus}
                </Text>
                <Text fontSize="12px" color="textSubtle" mt="4px">
                  First $1M raised
                </Text>
              </StatBox>
              <StatBox flex="1">
                <Text fontSize="14px" color="textSubtle" mb="8px">
                  Staking APY
                </Text>
                <Text bold fontSize="20px" color="secondary">
                  {presaleData.stakingAPY}
                </Text>
              </StatBox>
            </Flex>

            <Flex flexDirection="column" gap="12px" mt="16px">
              <Text bold fontSize="18px" color="text" mb="8px">
                Presale Details
              </Text>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">Soft Cap:</Text>
                <Text bold color="text">{presaleData.softCap}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">Hard Cap:</Text>
                <Text bold color="text">{presaleData.hardCap}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">Minimum Buy:</Text>
                <Text bold color="text">{presaleData.minBuy}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">Whitelist Slots:</Text>
                <Text bold color="text">{presaleData.whitelistSlots}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text color="textSubtle">Participants:</Text>
                <Text bold color="secondary">{presaleData.participants}</Text>
              </Flex>
            </Flex>

            <Link to="/ifos" style={{ width: '100%' }}>
              <StyledButton fullWidth>
                Buy Presale Tokens
              </StyledButton>
            </Link>
          </Flex>
        </PresaleCard>

        {/* Funding Allocation Card */}
        <PresaleCard flex="1">
          <Text bold fontSize="20px" color="text" mb="24px">
            Funding Allocation
          </Text>
          <Flex flexDirection="column" gap="12px">
            {fundingAllocation.map((item, index) => (
              <Box key={index}>
                <Flex justifyContent="space-between" mb="4px">
                  <Text fontSize="14px" color="text">
                    {item.label}
                  </Text>
                  <Text fontSize="14px" color="secondary" bold>
                    {item.percentage}%
                  </Text>
                </Flex>
                <ProgressBar style={{ height: '8px', margin: '0' }}>
                  <ProgressFill percentage={item.percentage} />
                </ProgressBar>
              </Box>
            ))}
          </Flex>

          <Box mt="24px" p="16px" style={{ background: 'rgba(220, 20, 60, 0.1)', borderRadius: '8px' }}>
            <Text fontSize="12px" color="textSubtle" lineHeight="1.6">
              <strong>Note:</strong> Presale tokens can be staked immediately for 66-80% APY rewards. 
              Early bird bonus applies to first $1M raised. Whitelist required for participation.
            </Text>
          </Box>
        </PresaleCard>
      </Flex>

      {/* Token Info Card */}
      <PresaleCard>
        <Text bold fontSize="24px" color="text" mb="24px">
          $SHDV Token Information
        </Text>
        <Flex flexDirection={mobile ? "column" : "row"} gap="24px">
          <Box flex="1">
            <Text bold fontSize="16px" color="secondary" mb="12px">
              Token Utility
            </Text>
            <Flex flexDirection="column" gap="8px">
              <Text fontSize="14px" color="text">• Staking for AI agent access (min 1,000 SHDV)</Text>
              <Text fontSize="14px" color="text">• Fee discounts (0.05-0.3% swaps based on holdings)</Text>
              <Text fontSize="14px" color="text">• Governance voting on platform parameters</Text>
              <Text fontSize="14px" color="text">• Premium AI features unlock</Text>
            </Flex>
          </Box>
          <Box flex="1">
            <Text bold fontSize="16px" color="secondary" mb="12px">
              Tokenomics
            </Text>
            <Flex flexDirection="column" gap="8px">
              <Text fontSize="14px" color="text">• Total Supply: 1,000,000,000 SHDV (1B)</Text>
              <Text fontSize="14px" color="text">• Presale: 20% (200M tokens)</Text>
              <Text fontSize="14px" color="text">• Liquidity: 30% (300M tokens)</Text>
              <Text fontSize="14px" color="text">• Team: 20% (200M) - 4 year vesting</Text>
              <Text fontSize="14px" color="text">• Marketing: 15% (150M)</Text>
              <Text fontSize="14px" color="text">• Ecosystem: 15% (150M)</Text>
            </Flex>
          </Box>
        </Flex>
      </PresaleCard>
    </PresaleContainer>
  )
}

export default PresaleSection

