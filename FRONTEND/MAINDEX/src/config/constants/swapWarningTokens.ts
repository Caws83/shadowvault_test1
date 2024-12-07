import tokens from 'config/constants/tokens'
import { Address } from './types'

const { cfg } = tokens

interface WarningToken {
  symbol: string
  address: Address
}

interface WarningTokenList {
  [key: string]: WarningToken
}

const SwapWarningTokens = <WarningTokenList>{
  cfg,
}

export default SwapWarningTokens
