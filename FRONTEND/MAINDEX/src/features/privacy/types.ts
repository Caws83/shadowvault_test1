// Privacy Layer Types
export interface PrivacyConfig {
  enabled: boolean
  useZeroKnowledge: boolean
  shieldedPool: boolean
}

export interface ShieldedTransaction {
  id: string
  tokenIn: string
  tokenOut: string
  amountIn: string
  amountOut: string
  timestamp: number
  proof?: string // ZK proof
}

export interface PrivacyStats {
  totalShieldedTrades: number
  totalShieldedVolume: string
  averageAnonymitySet: number
}

