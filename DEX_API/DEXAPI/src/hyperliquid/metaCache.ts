import type { InfoClient } from '@nktkas/hyperliquid'
import { withInfoRetry } from './infoClient'
import type { HyperliquidResolvedConfig } from './types'

export type MetaWire = Awaited<ReturnType<InfoClient['meta']>>

let cached: { meta: MetaWire; at: number } | null = null
const TTL_MS = 5 * 60 * 1000

export async function getMetaCached(
  client: InfoClient,
  config: HyperliquidResolvedConfig,
): Promise<MetaWire> {
  const now = Date.now()
  if (cached && now - cached.at < TTL_MS) {
    return cached.meta
  }
  const meta = await withInfoRetry(config, 'meta', () => client.meta({ dex: '' }))
  cached = { meta, at: now }
  return meta
}

export function getAssetIndex(meta: MetaWire, coin: string): number | null {
  const u = meta.universe
  const idx = u.findIndex((x) => x.name === coin)
  return idx >= 0 ? idx : null
}

export function getSzDecimals(meta: MetaWire, assetIndex: number): number {
  return meta.universe[assetIndex]?.szDecimals ?? 4
}
