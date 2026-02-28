// AI Trading Agent Types
export enum LeverageMode {
  SAFE = 'SAFE', // 5-10x leverage with automated risk controls
  PSYCHO = 'PSYCHO', // Up to 100x leverage, high risk
}

export interface AITradeSignal {
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number // 0-100
  leverage: number
  stopLoss?: number
  takeProfit?: number
  reasoning: string
  timestamp: number
}

export interface AIPosition {
  id: string
  tokenPair: string
  leverage: number
  mode: LeverageMode
  entryPrice: number
  currentPrice: number
  positionSize: number
  stopLoss?: number
  takeProfit?: number
  liquidationPrice: number
  pnl: number
  pnlPercentage: number
  createdAt: number
}

export interface AIConfig {
  enabled: boolean
  mode: LeverageMode
  maxLeverage: number
  autoStopLoss: boolean
  autoTakeProfit: boolean
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH'
}

