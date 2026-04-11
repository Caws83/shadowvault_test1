/**
 * Hyperliquid Info API (read-only) with safe retry for transient failures.
 * Uses official `@nktkas/hyperliquid` InfoClient → POST /info.
 */
import { HttpTransport, HttpRequestError, InfoClient, TransportError } from '@nktkas/hyperliquid'
import type { HyperliquidResolvedConfig } from './types'
import { hlLog } from './logger'
import { normalizeL2Book } from './normalize'

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

function isRetryableInfoError(e: unknown): boolean {
  if (e instanceof HttpRequestError || e instanceof TransportError) {
    return true
  }
  if (e instanceof Error) {
    return /fetch|network|timeout|ECONNRESET|ETIMEDOUT|502|503|504/i.test(e.message)
  }
  return false
}

/** Retry only for network/5xx — not for validation errors. */
export async function withInfoRetry<T>(
  config: HyperliquidResolvedConfig,
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  let attempt = 0
  let delay = config.infoRetryInitialMs
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn()
    } catch (e) {
      attempt += 1
      const retryable = isRetryableInfoError(e)
      if (!retryable || attempt > config.infoMaxRetries) {
        hlLog.error(`Info ${label} failed`, e, { attempt })
        throw e
      }
      hlLog.warn(`Info ${label} retry`, { attempt, delayMs: delay })
      await sleep(delay)
      delay = Math.min(delay * 2, 10_000)
    }
  }
}

export function createHyperliquidInfoClient(config: HyperliquidResolvedConfig): InfoClient {
  const transport = new HttpTransport({
    isTestnet: config.isTestnet,
    apiUrl: config.apiBaseUrl,
    timeout: config.infoTimeoutMs,
  })
  return new InfoClient({ transport })
}

/** Convenience: meta + asset contexts (perps). */
export async function fetchMetaAndAssetCtxs(client: InfoClient, config: HyperliquidResolvedConfig) {
  return withInfoRetry(config, 'metaAndAssetCtxs', () => client.metaAndAssetCtxs({ dex: '' }))
}

export async function fetchL2Book(
  client: InfoClient,
  config: HyperliquidResolvedConfig,
  coin: string,
  opts?: { nSigFigs?: 2 | 3 | 4 | 5 | null; mantissa?: 2 | 5 },
) {
  const raw = await withInfoRetry(config, 'l2Book', () =>
    client.l2Book({
      coin,
      nSigFigs: opts?.nSigFigs ?? null,
      mantissa: opts?.mantissa,
    }),
  )
  if (raw == null) {
    throw new Error(`l2Book returned null for coin=${coin}`)
  }
  return normalizeL2Book(raw)
}

export { InfoClient }
