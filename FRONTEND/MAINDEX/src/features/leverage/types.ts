// Leverage Trading Types
export interface LeverageTradeParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  leverage: number
  mode: 'SAFE' | 'PSYCHO'
  stopLoss?: number
  takeProfit?: number
}

export interface LeveragePosition {
  id: string
  tokenPair: string
  leverage: number
  entryPrice: number
  currentPrice: number
  positionSize: number
  collateral: number
  liquidationPrice: number
  pnl: number
  pnlPercentage: number
  mode: 'SAFE' | 'PSYCHO'
  stopLoss?: number
  takeProfit?: number
  createdAt: number
}

export interface LeverageConfig {
  maxSafeLeverage: number // Default 10x
  maxPsychoLeverage: number // Default 100x
  liquidationThreshold: number // Default 0.9 (90% of collateral)
  minCollateralRatio: number
}

