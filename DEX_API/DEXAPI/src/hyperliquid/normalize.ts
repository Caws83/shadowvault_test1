/**
 * Map `@nktkas/hyperliquid` Info responses into stable Normalized* DTOs for our JSON routes.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 */
import type { NormalizedL2Book, NormalizedOrderBookLevel, NormalizedPublicTrade } from './types'

/** Matches `@nktkas/hyperliquid` L2BookResponse (avoids subpath imports under classic moduleResolution). */
export interface HyperliquidL2BookWire {
  coin: string
  time: number
  levels: [
    bids: { px: string; sz: string; n: number }[],
    asks: { px: string; sz: string; n: number }[],
  ]
}

function levelFromHl(px: string, sz: string, n?: number): NormalizedOrderBookLevel {
  return n !== undefined ? { price: px, size: sz, n } : { price: px, size: sz }
}

/** SDK l2Book response: levels[0] = bids, levels[1] = asks */
export function normalizeL2Book(raw: HyperliquidL2BookWire): NormalizedL2Book {
  const levels = raw.levels
  const bidsRaw = levels[0] ?? []
  const asksRaw = levels[1] ?? []
  return {
    coin: raw.coin,
    time: raw.time,
    bids: bidsRaw.map((l: { px: string; sz: string; n: number }) => levelFromHl(l.px, l.sz, l.n)),
    asks: asksRaw.map((l: { px: string; sz: string; n: number }) => levelFromHl(l.px, l.sz, l.n)),
  }
}

/** Recent trades: side B = bid/buy, A = ask/sell (Hyperliquid convention). */
export function normalizeRecentTrade(t: {
  coin: string
  side: string
  px: string
  sz: string
  time: number
  hash?: string
}): NormalizedPublicTrade {
  return {
    coin: t.coin,
    side: t.side === 'B' ? 'buy' : 'sell',
    px: t.px,
    sz: t.sz,
    time: t.time,
    hash: t.hash,
  }
}
