/**
 * WebSocket transport + SubscriptionClient for Hyperliquid streams (L2, trades, user events).
 * Default reconnect uses exponential backoff (via `@nktkas/rews` inside WebSocketTransport).
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket
 */
import { WebSocketTransport, SubscriptionClient } from '@nktkas/hyperliquid'
import type { HyperliquidResolvedConfig } from './types'

export function createHyperliquidWebSocketTransport(config: HyperliquidResolvedConfig): WebSocketTransport {
  return new WebSocketTransport({
    isTestnet: config.isTestnet,
    url: config.wsUrl,
    timeout: config.infoTimeoutMs,
    resubscribe: true,
    reconnect: {
      maxRetries: 10_000,
      reconnectionDelay: (attempt: number) => Math.min(2 ** attempt * 150, 10_000),
    },
  })
}

export function createHyperliquidSubscriptionClient(config: HyperliquidResolvedConfig): SubscriptionClient {
  const transport = createHyperliquidWebSocketTransport(config)
  return new SubscriptionClient({ transport })
}

export { SubscriptionClient, WebSocketTransport }
