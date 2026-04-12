import {
  MAINNET_API_URL,
  TESTNET_API_URL,
  MAINNET_API_WS_URL,
  TESTNET_API_WS_URL,
} from '@nktkas/hyperliquid'
import type { HyperliquidNetwork, HyperliquidResolvedConfig } from './types'
import { hlLog } from './logger'
import { hyperliquidNetworkSchema, optionalAddress, hexPrivateKeySchema, normalizeHexPrivateKey } from './validators'

function parseNetwork(): { network: HyperliquidNetwork; isTestnet: boolean } {
  const raw = (process.env.HYPERLIQUID_NETWORK || 'mainnet').trim().toLowerCase()
  const parsed = hyperliquidNetworkSchema.safeParse(raw)
  if (!parsed.success) {
    hlLog.warn('Invalid HYPERLIQUID_NETWORK, defaulting to mainnet', { raw })
    return { network: 'mainnet', isTestnet: false }
  }
  return { network: parsed.data, isTestnet: parsed.data === 'testnet' }
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Default true when unset; used for HYPERLIQUID_MAINNET_ENABLED. */
function parseEnvBool(raw: string | undefined, defaultVal: boolean): boolean {
  if (raw == null || String(raw).trim() === '') return defaultVal
  const s = String(raw).trim().toLowerCase()
  if (['false', '0', 'no', 'off'].includes(s)) return false
  if (['true', '1', 'yes', 'on'].includes(s)) return true
  return defaultVal
}

/**
 * Load Hyperliquid settings from env.
 * Safe to call at module load: does not throw if agent key is missing (exchange client stays disabled).
 */
export function loadHyperliquidConfig(): HyperliquidResolvedConfig {
  const { network, isTestnet } = parseNetwork()

  const apiBase =
    (process.env.HYPERLIQUID_API_URL || '').replace(/\/$/, '') ||
    (isTestnet ? TESTNET_API_URL : MAINNET_API_URL)

  const wsUrl =
    (process.env.HYPERLIQUID_WS_URL || '').replace(/\/$/, '') ||
    (isTestnet ? TESTNET_API_WS_URL : MAINNET_API_WS_URL)

  const pkRaw = normalizeHexPrivateKey(process.env.HYPERLIQUID_AGENT_PRIVATE_KEY)
  let agentPrivateKeyConfigured = false
  if (pkRaw) {
    const v = hexPrivateKeySchema.safeParse(pkRaw)
    if (!v.success) {
      hlLog.warn('HYPERLIQUID_AGENT_PRIVATE_KEY set but invalid; exchange signing disabled')
    } else {
      agentPrivateKeyConfigured = true
    }
  }

  let vaultAddress: `0x${string}` | null = null
  try {
    vaultAddress = optionalAddress(process.env.HYPERLIQUID_VAULT_ADDRESS)
  } catch (e) {
    hlLog.warn('Invalid HYPERLIQUID_VAULT_ADDRESS ignored', { err: (e as Error).message })
  }

  let agentAddressExpected: `0x${string}` | null = null
  try {
    agentAddressExpected = optionalAddress(process.env.HYPERLIQUID_AGENT_ADDRESS)
  } catch (e) {
    hlLog.warn('Invalid HYPERLIQUID_AGENT_ADDRESS ignored', { err: (e as Error).message })
  }

  const mainnetExchangeEnabled = isTestnet
    ? true
    : parseEnvBool(process.env.HYPERLIQUID_MAINNET_ENABLED, true)

  return {
    network,
    isTestnet,
    apiBaseUrl: apiBase,
    wsUrl,
    infoTimeoutMs: parsePositiveInt(process.env.HYPERLIQUID_INFO_TIMEOUT_MS, 15_000),
    exchangeTimeoutMs: parsePositiveInt(process.env.HYPERLIQUID_EXCHANGE_TIMEOUT_MS, 20_000),
    agentPrivateKeyConfigured,
    agentAddressExpected,
    vaultAddress,
    mainnetExchangeEnabled,
    infoMaxRetries: parsePositiveInt(process.env.HYPERLIQUID_INFO_MAX_RETRIES, 3),
    infoRetryInitialMs: parsePositiveInt(process.env.HYPERLIQUID_INFO_RETRY_INITIAL_MS, 300),
  }
}

let cached: HyperliquidResolvedConfig | null = null

export function getHyperliquidConfig(): HyperliquidResolvedConfig {
  if (!cached) {
    cached = loadHyperliquidConfig()
  }
  return cached
}

/** Tests or hot reload */
export function resetHyperliquidConfigCache(): void {
  cached = null
}
