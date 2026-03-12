// Aggregator token lists: Uniswap + SushiSwap for ETH, BSC, Sepolia, etc.
const UNISWAP_DEFAULT_LIST = 'https://unpkg.com/@uniswap/default-token-list@2.0.0/build/uniswap-default.tokenlist.json'
const SUSHI_DEFAULT_LIST = 'https://unpkg.com/@sushiswap/default-token-list@43.3.0/build/sushiswap-default.tokenlist.json'

export const UNSUPPORTED_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  UNISWAP_DEFAULT_LIST,
  SUSHI_DEFAULT_LIST,
  ...UNSUPPORTED_LIST_URLS,
]

// default lists to be 'active' so Swap token selector shows Uniswap + Sushi tokens
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  UNISWAP_DEFAULT_LIST,
  SUSHI_DEFAULT_LIST,
]
