/**
 * Normalized DTOs for ShadowVault backend ↔ frontend (Phase 3+).
 * Hyperliquid wire types come from `@nktkas/hyperliquid`; we map into these for stable API contracts.
 */

export type HyperliquidNetwork = 'mainnet' | 'testnet'

/** Resolved URLs + credentials metadata (never log private keys). */
export interface HyperliquidResolvedConfig {
  network: HyperliquidNetwork
  isTestnet: boolean
  /** Base REST API origin (no path), e.g. https://api.hyperliquid.xyz */
  apiBaseUrl: string
  /** WebSocket URL including path, e.g. wss://api.hyperliquid.xyz/ws */
  wsUrl: string
  infoTimeoutMs: number
  exchangeTimeoutMs: number
  /** Agent wallet used to sign L1 actions (server-side only). */
  agentPrivateKeyConfigured: boolean
  /** Expected checksummed agent address from env (optional cross-check). */
  agentAddressExpected: `0x${string}` | null
  /** Subaccount / vault the master may sign for (optional). */
  vaultAddress: `0x${string}` | null
  /** Max retries for idempotent read-only Info calls. */
  infoMaxRetries: number
  /** Initial backoff ms for Info retries. */
  infoRetryInitialMs: number
}

export interface NormalizedOrderBookLevel {
  price: string
  size: string
  /** Number of orders at level (if provided by venue). */
  n?: number
}

export interface NormalizedL2Book {
  coin: string
  time?: number
  bids: NormalizedOrderBookLevel[]
  asks: NormalizedOrderBookLevel[]
}

export interface NormalizedPublicTrade {
  coin: string
  side: 'buy' | 'sell'
  px: string
  sz: string
  time: number
  hash?: string
}

/** Perp universe entry (subset for UI lists). */
export interface NormalizedPerpMarketSummary {
  /** Hyperliquid coin name from meta, e.g. BTC, ETH */
  name: string
  /** Index in `universe` array — used as asset id `a` in orders. */
  index: number
}
