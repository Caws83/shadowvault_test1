import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Box, HelpIcon, useTooltip } from 'uikit'
import { LeverageMode } from 'features/ai-agent/types'

const ModeCard = styled(Box)<{ active: boolean }>`
  position: relative;
  border: 1px solid ${({ active }) => 
    active 
      ? 'rgba(230, 57, 70, 0.6)' 
      : 'rgba(255,255,255,0.05)'};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  background: ${({ active }) => 
    active 
      ? 'linear-gradient(180deg, rgba(230, 57, 70, 0.08) 0%, rgba(230, 57, 70, 0.02) 100%)'
      : 'rgba(30, 31, 34, 0.4)'};
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    border-color: ${({ active }) => 
      active ? 'rgba(230, 57, 70, 0.8)' : 'rgba(255,255,255,0.1)'};
    background: ${({ active }) => 
      active 
        ? 'linear-gradient(180deg, rgba(230, 57, 70, 0.1) 0%, rgba(230, 57, 70, 0.04) 100%)'
        : 'rgba(30, 31, 34, 0.6)'};
  }
`

const WarningBox = styled(Box)`
  background: rgba(230, 57, 70, 0.08);
  border-left: 3px solid rgba(230, 57, 70, 0.6);
  border-radius: 4px 12px 12px 4px;
  padding: 12px 16px;
  margin-top: 12px;
`

interface LeverageModeSelectorProps {
  selectedMode: LeverageMode
  onModeChange: (mode: LeverageMode) => void
}

const LeverageModeSelector: React.FC<LeverageModeSelectorProps> = ({
  selectedMode,
  onModeChange,
}) => {
  const { targetRef: safeRef, tooltip: safeTooltip, tooltipVisible: safeVisible } = useTooltip(
    "Automated stop-losses and conservative sizing. Ideal for beginners.",
    { placement: 'bottom' }
  )

  const { targetRef: psychoRef, tooltip: psychoTooltip, tooltipVisible: psychoVisible } = useTooltip(
    "Maximum leverage potential. High risk, high reward. Minimal safeguards.",
    { placement: 'bottom' }
  )

  return (
    <Flex flexDirection="column">
      <Flex gap="12px" flexDirection={['column', 'row']}>
        <ModeCard
          active={selectedMode === LeverageMode.SAFE}
          onClick={() => onModeChange(LeverageMode.SAFE)}
          flex="1"
        >
          <Flex alignItems="center" mb="4px">
            <Text bold fontSize="12px" color={selectedMode === LeverageMode.SAFE ? "#E11D2E" : "textSubtle"} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>
              Safe Mode
            </Text>
            <div ref={safeRef} style={{ display: 'flex' }}>
              <HelpIcon color="textSubtle" width="14px" />
            </div>
            {safeVisible && safeTooltip}
          </Flex>
          <Text fontSize="16px" color="text" bold>
            5-10x
          </Text>
        </ModeCard>

        <ModeCard
          active={selectedMode === LeverageMode.PSYCHO}
          onClick={() => onModeChange(LeverageMode.PSYCHO)}
          flex="1"
        >
          <Flex alignItems="center" mb="4px">
            <Text bold fontSize="12px" style={{ color: selectedMode === LeverageMode.PSYCHO ? '#E11D2E' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '6px' }}>
              Psycho Mode
            </Text>
            <div ref={psychoRef} style={{ display: 'flex' }}>
              <HelpIcon color="textSubtle" width="14px" />
            </div>
            {psychoVisible && psychoTooltip}
          </Flex>
          <Text fontSize="16px" color="text" bold>
            Up to 100x
          </Text>
        </ModeCard>
      </Flex>

      {selectedMode === LeverageMode.PSYCHO && (
        <WarningBox>
          <Text bold fontSize="13px" style={{ color: '#E11D2E' }} mb="4px">
            ⚠️ EXTREME RISK
          </Text>
          <Text fontSize="12px" color="textSubtle" style={{ lineHeight: '1.5' }}>
            100x leverage can lead to rapid total loss. A 1% adverse price move will liquidate your position.
          </Text>
        </WarningBox>
      )}
    </Flex>
  )
}

export default LeverageModeSelector

