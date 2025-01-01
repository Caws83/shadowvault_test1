import { ChainId } from 'sdk'

export const EPOCH_TIME = 1

export const shardConfig = {
  apiKey: '75077347-4585-422c-9dce-646f79469728',
  socketId: 'd5296476-24e3-4bc5-9d96-2c89c0dd6070',
}

export const BASE_BSC_SCAN_URLS = {
  245022926: 'https://devnet.neonscan.org/',
}

export const API_URL = 'https://api.marswap.exchange'
export const BLOCKS_PER_YEAR = (60 / EPOCH_TIME) * 60 * 24 * 365 // 10512000
export const BASE_URL = `${window.location.origin}/`
export const BASE_ADD_LIQUIDITY_URL = `${BASE_URL}/#/add`
export const BASE_REMOVE_LIQUIDITY_URL = `${BASE_URL}/#/remove`
export const BASE_LIQUIDITY_POOL_URL = `${BASE_URL}/#/pool`
export const DEFAULT_TOKEN_DECIMAL = 10 ** 18
export const DEFAULT_GAS_LIMIT = 300000
export const AUCTION_BIDDERS_TO_FETCH = 500
export const RECLAIM_AUCTIONS_TO_FETCH = 500
export const AUCTION_WHITELISTED_BIDDERS_TO_FETCH = 500

export const TOP_AD_ID = '2242934'
export const BOTTOM_AD_ID = '2242935'

export const MINIMUM_COMPOST = 5

