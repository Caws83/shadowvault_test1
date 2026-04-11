/**
 * Hyperliquid REST API for ShadowVault backend — all perp data and execution go through these routes.
 */
import type { Express, Request, Response } from 'express'
import { getAddress, isAddress } from 'viem'
import { getConfig, getInfoClient, getExchangeClient } from './singleton'
import { getMetaCached, getAssetIndex, getSzDecimals } from './metaCache'
import { withInfoRetry } from './infoClient'
import { normalizeRecentTrade } from './normalize'
import { hlLog } from './logger'
import {
  startOrderbookService,
  getOrderbookPayload,
  primeOrderbook,
} from './orderbookService'

function parseUser(req: Request): `0x${string}` | null {
  const q = (req.query.address as string) || (req.body?.user as string) || (req.headers['x-wallet-address'] as string)
  if (!q || typeof q !== 'string') return null
  try {
    return getAddress(q.trim()) as `0x${string}`
  } catch {
    return null
  }
}

function errMsg(e: unknown): string {
  if (e instanceof Error) {
    return e.message
  }
  return 'Request failed'
}

function formatSize(n: number, szDecimals: number): string {
  const s = n.toFixed(szDecimals)
  const trimmed = s.replace(/\.?0+$/, '')
  return trimmed === '' ? '0' : trimmed
}

export function mountHyperliquidApi(app: Express): void {
  const cfg = getConfig()
  const info = getInfoClient()
  startOrderbookService(info, cfg)

  app.get('/api/hyperliquid/health', async (_req: Request, res: Response) => {
    try {
      await withInfoRetry(cfg, 'health_meta', () => info.meta({ dex: '' }))
      res.json({ ok: true, network: cfg.network })
    } catch (e) {
      res.status(503).json({ ok: false, error: errMsg(e) })
    }
  })

  app.get('/api/hyperliquid/meta', async (_req: Request, res: Response) => {
    try {
      const meta = await getMetaCached(info, cfg)
      const universe = meta.universe
        .filter((u) => !u.isDelisted)
        .map((u, index) => ({
          name: u.name,
          index,
          maxLeverage: u.maxLeverage,
          szDecimals: u.szDecimals,
          onlyIsolated: !!u.onlyIsolated,
        }))
      res.json({ universe })
    } catch (e) {
      hlLog.error('meta failed', e)
      res.status(500).json({ error: errMsg(e) })
    }
  })

  app.get('/api/hyperliquid/orderbook', async (req: Request, res: Response) => {
    const coin = String(req.query.coin || '').trim()
    if (!coin) {
      return res.status(400).json({ error: 'coin query required' })
    }
    try {
      await primeOrderbook(info, cfg, coin)
      const payload = getOrderbookPayload(coin)
      res.json(payload)
    } catch (e) {
      hlLog.error('orderbook failed', e)
      const payload = getOrderbookPayload(coin)
      res.status(500).json({ ...payload, error: errMsg(e) })
    }
  })

  app.get('/api/hyperliquid/trades', async (req: Request, res: Response) => {
    const coin = String(req.query.coin || '').trim()
    if (!coin) {
      return res.status(400).json({ error: 'coin query required' })
    }
    try {
      const raw = await withInfoRetry(cfg, 'recentTrades', () => info.recentTrades({ coin }))
      const trades = raw.map((t) => normalizeRecentTrade(t))
      res.json({ coin: coin.toUpperCase(), trades })
    } catch (e) {
      res.status(500).json({ error: errMsg(e) })
    }
  })

  app.get('/api/hyperliquid/user', async (req: Request, res: Response) => {
    const user = parseUser(req)
    if (!user || !isAddress(user)) {
      return res.status(400).json({ error: 'address query (or X-Wallet-Address) required' })
    }
    try {
      const [clearinghouse, openOrders, fills] = await Promise.all([
        withInfoRetry(cfg, 'clearinghouseState', () => info.clearinghouseState({ user, dex: '' })),
        withInfoRetry(cfg, 'frontendOpenOrders', () => info.frontendOpenOrders({ user, dex: '' })),
        withInfoRetry(cfg, 'userFills', () => info.userFills({ user })),
      ])
      const positions = clearinghouse.assetPositions.map((ap) => {
        const p = ap.position
        const szi = parseFloat(p.szi)
        return {
          coin: p.coin,
          szi: p.szi,
          side: szi > 0 ? 'long' : szi < 0 ? 'short' : 'flat',
          entryPx: p.entryPx,
          positionValue: p.positionValue,
          unrealizedPnl: p.unrealizedPnl,
          leverage: p.leverage,
          marginUsed: p.marginUsed,
          liquidationPx: p.liquidationPx,
        }
      })
      const orders = openOrders.map((o) => ({
        coin: o.coin,
        oid: o.oid,
        side: o.side,
        limitPx: o.limitPx,
        sz: o.sz,
        origSz: o.origSz,
        orderType: o.orderType,
        reduceOnly: o.reduceOnly,
        timestamp: o.timestamp,
      }))
      const fillsOut = fills.slice(0, 200).map((f) => ({
        coin: f.coin,
        px: f.px,
        sz: f.sz,
        side: f.side,
        time: f.time,
        dir: f.dir,
        oid: f.oid,
        hash: f.hash,
        fee: f.fee,
      }))
      res.json({
        user,
        marginSummary: clearinghouse.marginSummary,
        crossMarginSummary: clearinghouse.crossMarginSummary,
        withdrawable: clearinghouse.withdrawable,
        crossMaintenanceMarginUsed: clearinghouse.crossMaintenanceMarginUsed,
        positions,
        openOrders: orders,
        fills: fillsOut,
        time: clearinghouse.time,
      })
    } catch (e) {
      hlLog.error('user state failed', e)
      res.status(500).json({ error: errMsg(e) })
    }
  })

  app.post('/api/hyperliquid/order', async (req: Request, res: Response) => {
    const ex = getExchangeClient()
    if (!ex) {
      return res.status(503).json({ error: 'Hyperliquid agent wallet not configured' })
    }
    const body = req.body || {}
    const coin = String(body.coin || '').trim().toUpperCase()
    const side = body.side === 'short' || body.side === 'sell' ? 'short' : 'long'
    const orderKind = body.orderType === 'limit' ? 'limit' : 'market'
    const sizeIn = Number(body.size)
    const limitPx = body.limitPrice != null ? String(body.limitPrice) : ''
    const reduceOnly = Boolean(body.reduceOnly)
    const postOnly = Boolean(body.postOnly)
    const lev = body.leverage != null ? Number(body.leverage) : null
    const marginMode = body.marginMode === 'cross' ? 'cross' : 'isolated'

    if (!coin || !Number.isFinite(sizeIn) || sizeIn <= 0) {
      return res.status(400).json({ error: 'coin and positive size required' })
    }
    if (orderKind === 'limit' && (!limitPx || parseFloat(limitPx) <= 0)) {
      return res.status(400).json({ error: 'limitPrice required for limit orders' })
    }

    try {
      const meta = await getMetaCached(info, cfg)
      const asset = getAssetIndex(meta, coin)
      if (asset == null) {
        return res.status(400).json({ error: `Unknown perp coin: ${coin}` })
      }
      const szDec = getSzDecimals(meta, asset)
      const sizeStr = formatSize(sizeIn, szDec)
      const isBuy = side === 'long'

      if (lev != null && Number.isFinite(lev) && lev >= 1) {
        await ex.updateLeverage(
          {
            asset,
            isCross: marginMode === 'cross',
            leverage: Math.floor(lev),
          },
          {},
        )
      }

      let priceStr: string
      let tif: 'Gtc' | 'Ioc' | 'Alo' | 'FrontendMarket'

      if (orderKind === 'market') {
        const mids = await withInfoRetry(cfg, 'allMids', () => info.allMids({ dex: '' }))
        const mid = mids[coin]
        if (!mid) {
          return res.status(400).json({ error: 'No mid price for market order' })
        }
        const m = parseFloat(mid)
        const slip = 0.008
        const px = isBuy ? m * (1 + slip) : m * (1 - slip)
        priceStr = px.toFixed(6)
        tif = 'FrontendMarket'
      } else {
        priceStr = limitPx
        tif = postOnly ? 'Alo' : 'Gtc'
      }

      const result = await ex.order(
        {
          orders: [
            {
              a: asset,
              b: isBuy,
              p: priceStr,
              s: sizeStr,
              r: reduceOnly,
              t: { limit: { tif } },
            },
          ],
          grouping: 'na',
        },
        {},
      )

      res.json({ ok: true, response: result })
    } catch (e) {
      hlLog.error('order failed', e)
      res.status(400).json({ ok: false, error: errMsg(e) })
    }
  })

  app.post('/api/hyperliquid/cancel', async (req: Request, res: Response) => {
    const ex = getExchangeClient()
    if (!ex) {
      return res.status(503).json({ error: 'Hyperliquid agent wallet not configured' })
    }
    const body = req.body || {}
    const coin = String(body.coin || '').trim().toUpperCase()
    const oid = Number(body.oid)
    if (!coin || !Number.isFinite(oid)) {
      return res.status(400).json({ error: 'coin and oid required' })
    }
    try {
      const meta = await getMetaCached(info, cfg)
      const asset = getAssetIndex(meta, coin)
      if (asset == null) {
        return res.status(400).json({ error: `Unknown coin ${coin}` })
      }
      const result = await ex.cancel({ cancels: [{ a: asset, o: oid }] }, {})
      res.json({ ok: true, response: result })
    } catch (e) {
      hlLog.error('cancel failed', e)
      res.status(400).json({ ok: false, error: errMsg(e) })
    }
  })

  app.post('/api/hyperliquid/leverage', async (req: Request, res: Response) => {
    const ex = getExchangeClient()
    if (!ex) {
      return res.status(503).json({ error: 'Hyperliquid agent wallet not configured' })
    }
    const body = req.body || {}
    const coin = String(body.coin || '').trim().toUpperCase()
    const leverage = Number(body.leverage)
    const marginMode = body.marginMode === 'cross' ? 'cross' : 'isolated'
    if (!coin || !Number.isFinite(leverage) || leverage < 1) {
      return res.status(400).json({ error: 'coin and leverage required' })
    }
    try {
      const meta = await getMetaCached(info, cfg)
      const asset = getAssetIndex(meta, coin)
      if (asset == null) {
        return res.status(400).json({ error: `Unknown coin ${coin}` })
      }
      const result = await ex.updateLeverage(
        {
          asset,
          isCross: marginMode === 'cross',
          leverage: Math.floor(leverage),
        },
        {},
      )
      res.json({ ok: true, response: result })
    } catch (e) {
      hlLog.error('leverage failed', e)
      res.status(400).json({ ok: false, error: errMsg(e) })
    }
  })
}
