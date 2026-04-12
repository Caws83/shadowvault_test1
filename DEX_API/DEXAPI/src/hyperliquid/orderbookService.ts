/**
 * In-memory L2 cache fed by polling Info API `l2Book` + periodic full snapshot reconciliation.
 * This matches documented read-side behavior via `@nktkas/hyperliquid` `InfoClient.l2Book`.
 *
 * TODO: Optional upgrade path — subscribe to WS `l2Book` (see HL WebSocket docs + SDK
 * `SubscriptionClient`) and reconcile against HTTP snapshot; do not invent non-documented channels.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket
 */
import type { InfoClient } from '@nktkas/hyperliquid'
import { fetchL2Book, withInfoRetry } from './infoClient'
import type { HyperliquidResolvedConfig } from './types'
import type { NormalizedL2Book } from './types'
import { hlLog } from './logger'

const POLL_MS = Number(process.env.HYPERLIQUID_ORDERBOOK_POLL_MS || 1500)
const STALE_MS = Number(process.env.HYPERLIQUID_STALE_MS || 12000)
const RECON_MS = Number(process.env.HYPERLIQUID_RECONCILE_MS || 30000)

type Entry = {
  book: NormalizedL2Book
  lastOkAt: number
  lastAttemptAt: number
  lastError?: string
}

const tracked = new Set<string>()
const cache = new Map<string, Entry>()

let pollTimer: ReturnType<typeof setInterval> | null = null
let reconTimer: ReturnType<typeof setInterval> | null = null
let started = false

function coinKey(c: string): string {
  return c.trim().toUpperCase()
}

export function trackCoin(coin: string): void {
  tracked.add(coinKey(coin))
}

function rowsFromLevels(side: { price: string; size: string }[]): { price: string; amount: string; total: string }[] {
  let run = 0
  return side.map((l) => {
    const q = parseFloat(l.size) || 0
    run += q
    return {
      price: l.price,
      amount: l.size,
      total: run.toFixed(6),
    }
  })
}

export function getOrderbookPayload(coin: string): {
  coin: string
  bids: { price: string; amount: string; total: string }[]
  asks: { price: string; amount: string; total: string }[]
  stale: boolean
  lastUpdate: number | null
  error: string | null
} {
  const k = coinKey(coin)
  trackCoin(k)
  const e = cache.get(k)
  if (!e) {
    return {
      coin: k,
      bids: [],
      asks: [],
      stale: true,
      lastUpdate: null,
      error: 'No snapshot yet — waiting for feed',
    }
  }
  const age = Date.now() - e.lastOkAt
  const stale = age > STALE_MS || !!e.lastError
  return {
    coin: k,
    bids: rowsFromLevels(e.book.bids.slice(0, 24)),
    asks: rowsFromLevels(e.book.asks.slice(0, 24)),
    stale,
    lastUpdate: e.lastOkAt,
    error: e.lastError ?? null,
  }
}

export async function primeOrderbook(
  info: InfoClient,
  config: HyperliquidResolvedConfig,
  coin: string,
): Promise<void> {
  await refreshOne(info, config, coin)
}

async function refreshOne(
  info: InfoClient,
  config: HyperliquidResolvedConfig,
  coin: string,
): Promise<void> {
  const k = coinKey(coin)
  const now = Date.now()
  const prev = cache.get(k)
  try {
    const book = await fetchL2Book(info, config, k)
    cache.set(k, { book, lastOkAt: now, lastAttemptAt: now })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'fetch failed'
    hlLog.warn('orderbook refresh failed', { coin: k })
    cache.set(k, {
      book: prev?.book ?? { coin: k, bids: [], asks: [] },
      lastOkAt: prev?.lastOkAt ?? 0,
      lastAttemptAt: now,
      lastError: msg,
    })
  }
}

async function pollAll(info: InfoClient, config: HyperliquidResolvedConfig): Promise<void> {
  const coins = [...tracked]
  await Promise.all(coins.map((c) => refreshOne(info, config, c)))
}

async function reconcileAll(info: InfoClient, config: HyperliquidResolvedConfig): Promise<void> {
  const coins = [...tracked]
  for (const c of coins) {
    try {
      const book = await withInfoRetry(config, 'l2Book_recon', () =>
        fetchL2Book(info, config, coinKey(c)),
      )
      cache.set(coinKey(c), {
        book,
        lastOkAt: Date.now(),
        lastAttemptAt: Date.now(),
      })
    } catch (err) {
      hlLog.warn('reconcile l2Book failed', { coin: c })
    }
  }
}

export function startOrderbookService(info: InfoClient, config: HyperliquidResolvedConfig): void {
  if (started) return
  started = true
  pollTimer = setInterval(() => {
    pollAll(info, config).catch(() => {})
  }, POLL_MS)
  reconTimer = setInterval(() => {
    reconcileAll(info, config).catch(() => {})
  }, RECON_MS)
  hlLog.info('Orderbook service started', { pollMs: POLL_MS, reconMs: RECON_MS })
}
