import { ChainId, JSBI, Percent, Token, REALWBONE } from 'sdk'
// import { WETH, USDT, USDC } from './tokens'

export const ROUTER_ADDRESS = '0xe368B201EdbE8759e7c0D128752DBFb5325EdF36'

// a list of tokens by chain
export type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

// used to construct intermediary pairs for trading 
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.BSC]: [REALWBONE[ChainId.BSC]],
  [ChainId.BSC_TESTNET]: [REALWBONE[ChainId.BSC_TESTNET]],
  [ChainId.SEPOLIA]: [REALWBONE[ChainId.SEPOLIA]],
  [ChainId.NEONDEV]: [REALWBONE[ChainId.NEONDEV]],
}

export const EASY_TOKENS: Token[] = [
  REALWBONE[ChainId.BSC],
  REALWBONE[ChainId.BSC_TESTNET],
  REALWBONE[ChainId.SEPOLIA],
  REALWBONE[ChainId.NEONDEV],
]

/**
 * Additional bases for specific tokens
 */
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {},
  [ChainId.SEPOLIA]: {},
  [ChainId.NEONDEV]: {},
}

export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.BSC]: {},
  [ChainId.BSC_TESTNET]: {},
  [ChainId.SEPOLIA]: {},
  [ChainId.NEONDEV]: {},
}

export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.BSC]: [REALWBONE[ChainId.BSC]],
  [ChainId.BSC_TESTNET]: [REALWBONE[ChainId.BSC_TESTNET]],
  [ChainId.SEPOLIA]: [REALWBONE[ChainId.SEPOLIA]],
  [ChainId.NEONDEV]: [REALWBONE[ChainId.NEONDEV]],
}

export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.BSC]: [REALWBONE[ChainId.BSC]],
  [ChainId.BSC_TESTNET]: [REALWBONE[ChainId.BSC_TESTNET]],
  [ChainId.SEPOLIA]: [REALWBONE[ChainId.SEPOLIA]],
  [ChainId.NEONDEV]: [REALWBONE[ChainId.NEONDEV]],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  // [ChainId.SHIBNET]: [[MSWAP[ChainId.SHIBNET], REALWBONE[ChainId.SHIBNET]]],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 75
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(400), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(999), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(20000), BIPS_BASE) // 20%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(3000), BIPS_BASE) // 30%

// used to ensure the user doesn't send so much BNB so they end up with <.01
export const MIN_BNB: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 BNB
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C',
]

export { default as farmsConfig } from './farms'
// export { default as poolsConfig } from './pools'
// export { default as ifosConfig } from './ifo'
