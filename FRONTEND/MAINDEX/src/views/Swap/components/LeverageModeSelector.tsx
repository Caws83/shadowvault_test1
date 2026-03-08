import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Box } from 'uikit'
import { LeverageMode } from 'features/ai-agent/types'

const ModeCard = styled(Box)<{ active: boolean; mode: LeverageMode }>`
  border: 1px solid ${({ active, mode }) => 
    active 
      ? mode === LeverageMode.PSYCHO 
        ? 'rgba(230, 57, 70, 0.6)' 
        : '#22c55e'
      : 'rgba(255,255,255,0.1)'};
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  background: ${({ active, mode }) => 
    active && mode === LeverageMode.PSYCHO
      ? 'rgba(80, 40, 40, 0.25)'
      : active
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%)'
      : 'rgba(0,0,0,0.3)'};
  transition: all 0.25s ease;
  
  &:hover {
    border-color: ${({ mode }) => 
      mode === LeverageMode.PSYCHO 
        ? 'rgba(230, 57, 70, 0.7)' 
        : '#22c55e'};
    background: ${({ mode }) => 
      mode === LeverageMode.PSYCHO
        ? 'rgba(80, 40, 40, 0.2)'
        : 'rgba(34, 197, 94, 0.08)'};
  }
`

const WarningBox = styled(Box)`
  background: rgba(60, 30, 30, 0.35);
  border: 1px solid rgba(230, 57, 70, 0.4);
  border-radius: 12px;
  padding: 16px;
  margin-top: 14px;
`

interface LeverageModeSelectorProps {
  selectedMode: LeverageMode
  onModeChange: (mode: LeverageMode) => void
}

const LeverageModeSelector: React.FC<LeverageModeSelectorProps> = ({
  selectedMode,
  onModeChange,
}) => {
  return (
    <Flex flexDirection="column" gap="18px">
      <Text bold fontSize="20px" color="text">
        Select Leverage Mode
      </Text>
      
      <Flex gap="14px" flexDirection={['column', 'row']}>
        <ModeCard
          active={selectedMode === LeverageMode.SAFE}
          mode={LeverageMode.SAFE}
          onClick={() => onModeChange(LeverageMode.SAFE)}
          flex="1"
        >
          <Text bold fontSize="18px" color="success" mb="8px">
            Safe Mode
          </Text>
          <Text fontSize="15px" color="text" mb="10px" bold>
            5-10x Leverage
          </Text>
          <Text fontSize="13px" color="textSubtle">
            • Automated stop-loss protection<br/>
            • Volatility-adjusted position sizing<br/>
            • Conservative risk management<br/>
            • Recommended for beginners
          </Text>
        </ModeCard>

        <ModeCard
          active={selectedMode === LeverageMode.PSYCHO}
          mode={LeverageMode.PSYCHO}
          onClick={() => onModeChange(LeverageMode.PSYCHO)}
          flex="1"
        >
          <Text bold fontSize="18px" style={{ color: 'rgba(220, 180, 180, 0.95)' }} mb="8px">
            Full Psycho Mode
          </Text>
          <Text fontSize="15px" style={{ color: 'rgba(220, 180, 180, 0.9)' }} mb="10px" bold>
            Up to 100x Leverage
          </Text>
          <Text fontSize="13px" color="textSubtle">
            • Maximum leverage potential<br/>
            • High-risk, high-reward<br/>
            • Minimal safeguards<br/>
            • ⚠️ Can liquidate on 1% moves
          </Text>
        </ModeCard>
      </Flex>

      {selectedMode === LeverageMode.PSYCHO && (
        <WarningBox>
          <Text bold fontSize="14px" style={{ color: 'rgba(220, 180, 180, 0.95)' }} mb="4px">
            ⚠️ EXTREME RISK WARNING
          </Text>
          <Text fontSize="12px" color="text">
            Full Psycho Mode enables up to 100x leverage. This can lead to TOTAL LOSS very quickly. 
            A 1% adverse price move can liquidate your position. Only use funds you can afford to lose completely.
            Proceed at your own peril.
          </Text>
        </WarningBox>
      )}
    </Flex>
  )
}

export default LeverageModeSelector

