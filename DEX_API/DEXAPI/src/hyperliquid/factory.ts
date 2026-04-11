/**
 * One-shot wiring of config + clients for upcoming routes/workers.
 * TODO Phase 3: hold Info + WS as process singletons; avoid creating multiple WebSocket transports per request.
 */
import { getHyperliquidConfig } from './config'
import { createAgentWallet } from './agentWallet'
import { createHyperliquidInfoClient } from './infoClient'
import { createHyperliquidExchangeClient } from './exchangeClient'
import { createHyperliquidSubscriptionClient } from './wsClient'
import type { HyperliquidResolvedConfig } from './types'
import type { ResolvedAgentWallet } from './agentWallet'
import type { ExchangeClient, InfoClient, SubscriptionClient } from '@nktkas/hyperliquid'

export interface HyperliquidRuntime {
  config: HyperliquidResolvedConfig
  agent: ResolvedAgentWallet | null
  info: InfoClient
  exchange: ExchangeClient | null
  subscription: SubscriptionClient
}

export function createHyperliquidRuntime(): HyperliquidRuntime {
  const config = getHyperliquidConfig()
  const agent = createAgentWallet(config)
  const info = createHyperliquidInfoClient(config)
  const exchange = createHyperliquidExchangeClient(config, agent)
  const subscription = createHyperliquidSubscriptionClient(config)
  return { config, agent, info, exchange, subscription }
}
