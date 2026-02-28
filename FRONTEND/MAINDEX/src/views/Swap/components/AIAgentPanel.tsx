import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Button, Box, Card } from 'uikit'
import { LeverageMode, AITradeSignal } from 'features/ai-agent/types'
import { useAIAgent } from 'features/ai-agent/hooks/useAIAgent'
import LeverageModeSelector from './LeverageModeSelector'

const AgentCard = styled(Card)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 20px;
  border-radius: 16px;
`

const SignalBox = styled(Box)`
  background: rgba(220, 20, 60, 0.1);
  border: 1px solid #DC143C;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`

interface AIAgentPanelProps {
  tokenPair: string
  onExecuteTrade?: (signal: AITradeSignal) => void
}

const AIAgentPanel: React.FC<AIAgentPanelProps> = ({
  tokenPair,
  onExecuteTrade,
}) => {
  const [mode, setMode] = useState<LeverageMode>(LeverageMode.SAFE)
  const [enabled, setEnabled] = useState(false)

  const aiConfig = {
    enabled,
    mode,
    maxLeverage: mode === LeverageMode.SAFE ? 10 : 100,
    autoStopLoss: mode === LeverageMode.SAFE,
    autoTakeProfit: mode === LeverageMode.SAFE,
    riskTolerance: mode === LeverageMode.SAFE ? 'LOW' : 'HIGH' as const,
  }

  const { signals, isAnalyzing, analyzeMarket, executeTrade } = useAIAgent(aiConfig)

  const handleAnalyze = async () => {
    const signal = await analyzeMarket(tokenPair)
    if (signal && onExecuteTrade) {
      onExecuteTrade(signal)
    }
  }

  const latestSignal = signals[0]

  return (
    <AgentCard>
      <Flex flexDirection="column" gap="16px">
        <Flex justifyContent="space-between" alignItems="center">
          <Text bold fontSize="20px" color="text">
            AI Trading Agent
          </Text>
          <Button
            scale="sm"
            variant={enabled ? 'primary' : 'secondary'}
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? 'Disable' : 'Enable'} AI
          </Button>
        </Flex>

        {enabled && (
          <>
            <LeverageModeSelector
              selectedMode={mode}
              onModeChange={setMode}
            />

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant="primary"
              fullWidth
            >
              {isAnalyzing ? 'Analyzing Market...' : 'Get AI Trade Signal'}
            </Button>

            {latestSignal && (
              <SignalBox>
                <Flex justifyContent="space-between" mb="8px">
                  <Text bold color="text">
                    Latest Signal: {latestSignal.action}
                  </Text>
                  <Text color="secondary">
                    {latestSignal.confidence}% Confidence
                  </Text>
                </Flex>
                <Text fontSize="12px" color="textSubtle" mb="8px">
                  {latestSignal.reasoning}
                </Text>
                <Flex justifyContent="space-between" mb="8px">
                  <Text fontSize="12px" color="textSubtle">
                    Suggested Leverage: {latestSignal.leverage}x
                  </Text>
                  {latestSignal.stopLoss && (
                    <Text fontSize="12px" color="textSubtle">
                      Stop Loss: {latestSignal.stopLoss * 100}%
                    </Text>
                  )}
                </Flex>
                <Button
                  scale="sm"
                  variant="primary"
                  fullWidth
                  onClick={() => executeTrade(latestSignal, tokenPair, 100)}
                >
                  Execute Trade
                </Button>
              </SignalBox>
            )}
          </>
        )}

        {!enabled && (
          <Text fontSize="14px" color="textSubtle" textAlign="center">
            Enable AI Agent to get automated trade signals based on on-chain data, 
            sentiment analysis, and market patterns.
          </Text>
        )}
      </Flex>
    </AgentCard>
  )
}

export default AIAgentPanel

