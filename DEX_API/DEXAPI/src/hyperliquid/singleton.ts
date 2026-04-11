import { getHyperliquidConfig } from './config'
import type { HyperliquidResolvedConfig } from './types'
import { createHyperliquidInfoClient } from './infoClient'
import { createHyperliquidExchangeClient } from './exchangeClient'
import { createAgentWallet } from './agentWallet'
import type { InfoClient, ExchangeClient } from '@nktkas/hyperliquid'

let cfg: HyperliquidResolvedConfig | null = null
let info: InfoClient | null = null
let exchange: ExchangeClient | null = null
let agentChecked = false

export function getConfig(): HyperliquidResolvedConfig {
  if (!cfg) {
    cfg = getHyperliquidConfig()
  }
  return cfg
}

export function getInfoClient(): InfoClient {
  if (!info) {
    info = createHyperliquidInfoClient(getConfig())
  }
  return info
}

export function getExchangeClient(): ExchangeClient | null {
  if (!agentChecked) {
    agentChecked = true
    const c = getConfig()
    const agent = createAgentWallet(c)
    exchange = createHyperliquidExchangeClient(c, agent)
  }
  return exchange
}
