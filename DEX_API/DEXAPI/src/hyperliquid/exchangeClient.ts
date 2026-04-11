/**
 * Hyperliquid Exchange API — L1 signed actions (orders, cancels, leverage, etc.).
 * Uses `@nktkas/hyperliquid` ExchangeClient + viem LocalAccount from agent wallet.
 * No routes call this in Phase 2; Phase 4 will invoke from authenticated backend handlers only.
 */
import { ExchangeClient, HttpTransport } from '@nktkas/hyperliquid'
import type { HyperliquidResolvedConfig } from './types'
import type { ResolvedAgentWallet } from './agentWallet'
import { hlLog } from './logger'

export function createHyperliquidExchangeClient(
  config: HyperliquidResolvedConfig,
  agent: ResolvedAgentWallet | null,
): ExchangeClient | null {
  if (!agent) {
    hlLog.info('Exchange client not created: missing valid HYPERLIQUID_AGENT_PRIVATE_KEY')
    return null
  }

  const transport = new HttpTransport({
    isTestnet: config.isTestnet,
    apiUrl: config.apiBaseUrl,
    timeout: config.exchangeTimeoutMs,
  })

  return new ExchangeClient({
    transport,
    wallet: agent.account,
    ...(config.vaultAddress ? { defaultVaultAddress: config.vaultAddress } : {}),
  })
}

export { ExchangeClient }
