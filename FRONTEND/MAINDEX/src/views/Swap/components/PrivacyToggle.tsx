import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Toggle } from 'uikit'
import { PrivacyConfig } from 'features/privacy/types'

const PrivacyCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`

interface PrivacyToggleProps {
  config: PrivacyConfig
  onConfigChange: (config: PrivacyConfig) => void
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  config,
  onConfigChange,
}) => {
  const handleToggle = (key: keyof PrivacyConfig) => {
    onConfigChange({
      ...config,
      [key]: !config[key],
    })
  }

  return (
    <PrivacyCard>
      <Flex flexDirection="column" gap="12px">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex flexDirection="column">
            <Text bold fontSize="16px" color="text">
              Zero-Knowledge Privacy
            </Text>
            <Text fontSize="12px" color="textSubtle">
              Hide your trades, positions, and wallet activity
            </Text>
          </Flex>
          <Toggle
            checked={config.enabled}
            onChange={() => handleToggle('enabled')}
          />
        </Flex>

        {config.enabled && (
          <>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex flexDirection="column">
                <Text fontSize="14px" color="text">
                  Use Zero-Knowledge Proofs
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  Transactions verified without revealing details
                </Text>
              </Flex>
              <Toggle
                checked={config.useZeroKnowledge}
                onChange={() => handleToggle('useZeroKnowledge')}
              />
            </Flex>

            <Flex justifyContent="space-between" alignItems="center">
              <Flex flexDirection="column">
                <Text fontSize="14px" color="text">
                  Shielded Pool
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  Route through privacy pool for maximum anonymity
                </Text>
              </Flex>
              <Toggle
                checked={config.shieldedPool}
                onChange={() => handleToggle('shieldedPool')}
              />
            </Flex>

            <Text fontSize="11px" color="textSubtle" style={{ fontStyle: 'italic' }}>
              🔒 Your trades remain completely hidden: no visible wallet traces, 
              positions, entries/exits, or history. Pulling liquidity from Uniswap 
              pools ensures deep liquidity while maintaining privacy.
            </Text>
          </>
        )}
      </Flex>
    </PrivacyCard>
  )
}

export default PrivacyToggle

