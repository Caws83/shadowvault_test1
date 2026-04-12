/**
 * Hyperliquid Exchange API — L1 signed actions (orders, cancels, leverage, etc.).
 * Uses `@nktkas/hyperliquid` `ExchangeClient` + viem `LocalAccount` from the agent wallet (server-only).
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing
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
