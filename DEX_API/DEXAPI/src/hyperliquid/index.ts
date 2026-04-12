/**
 * Hyperliquid backend integration (ShadowVault DEX API).
 * — Info: read-only + retry
 * — Exchange: agent wallet signing (enable with env)
 * — WebSocket: subscriptions with reconnect + resubscribe
 * — Order book cache: HTTP snapshot + poll (WS fan-out is Phase 3+)
 */
export * from './types'
export * from './config'
export * from './logger'
export * from './validators'
export * from './normalize'
export * from './agentWallet'
export * from './infoClient'
export * from './exchangeClient'
export * from './wsClient'
export * from './factory'
export * from './singleton'
export * from './metaCache'
export { mountHyperliquidApi } from './routes'
export {
  startOrderbookService,
  getOrderbookPayload,
  primeOrderbook,
} from './orderbookService'
