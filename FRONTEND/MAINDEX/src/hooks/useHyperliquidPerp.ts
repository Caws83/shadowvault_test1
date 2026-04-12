import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_URL } from 'config'

export type HlUniverseEntry = {
  name: string
  index: number
  maxLeverage: number
  szDecimals: number
  onlyIsolated?: boolean
}

export type HlPosition = {
  coin: string
  szi: string
  side: 'long' | 'short' | 'flat'
  entryPx: string
  positionValue: string
  unrealizedPnl: string
  leverage: { type: string; value: number; rawUsd?: string }
  marginUsed: string
  liquidationPx: string | null
}

export type HlOpenOrder = {
  coin: string
  oid: number
  side: string
  limitPx: string
  sz: string
  origSz: string
  orderType: string
  reduceOnly: boolean
  timestamp: number
}

export type HlFill = {
  coin: string
  px: string
  sz: string
  side: string
  time: number
  dir: string
  oid: number
  hash?: string
  fee?: string
}

export function useHyperliquidPerp(
  coin: string,
  wallet: string | undefined,
  enabled: boolean,
) {
  const [universe, setUniverse] = useState<HlUniverseEntry[]>([])
  const [metaError, setMetaError] = useState<string | null>(null)
  const [orderbook, setOrderbook] = useState<{
    bids: { price: string; amount: string; total: string }[]
    asks: { price: string; amount: string; total: string }[]
    stale: boolean
    lastUpdate: number | null
    error: string | null
  } | null>(null)
  const [trades, setTrades] = useState<{ side: 'buy' | 'sell'; px: string; sz: string; time: number }[]>([])
  const [userState, setUserState] = useState<{
    marginSummary: { accountValue: string; totalMarginUsed: string; totalNtlPos: string }
    withdrawable: string
    positions: HlPosition[]
    openOrders: HlOpenOrder[]
    fills: HlFill[]
  } | null>(null)
  const [userError, setUserError] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const base = API_URL.replace(/\/$/, '')

  const coinUpper = useMemo(() => coin.trim().toUpperCase(), [coin])

  useEffect(() => {
    if (!enabled) return
    if (import.meta.env.PROD && !VITE_API_URL_CONFIGURED) {
      setMetaError(NETLIFY_VITE_API_HINT)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch(`${base}/api/hyperliquid/meta`)
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'meta')
        if (!cancelled) {
          setUniverse(j.universe || [])
          setMetaError(null)
        }
      } catch (e) {
        if (!cancelled) setMetaError((e as Error).message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [base, enabled])

  useEffect(() => {
    if (!enabled || !coinUpper) return
    let stop = false
    const tick = async () => {
      try {
        const r = await fetch(`${base}/api/hyperliquid/orderbook?coin=${encodeURIComponent(coinUpper)}`)
        const j = await r.json()
        if (stop) return
        setOrderbook({
          bids: j.bids || [],
          asks: j.asks || [],
          stale: !!j.stale,
          lastUpdate: j.lastUpdate ?? null,
          error: j.error || null,
        })
      } catch {
        if (!stop) {
          setOrderbook((prev) =>
            prev
              ? { ...prev, stale: true, error: 'Network error' }
              : { bids: [], asks: [], stale: true, lastUpdate: null, error: 'Network error' },
          )
        }
      }
    }
    tick()
    const id = window.setInterval(tick, 2000)
    return () => {
      stop = true
      window.clearInterval(id)
    }
  }, [base, coinUpper, enabled])

  useEffect(() => {
    if (!enabled || !coinUpper) return
    let stop = false
    const tick = async () => {
      try {
        const r = await fetch(`${base}/api/hyperliquid/trades?coin=${encodeURIComponent(coinUpper)}`)
        const j = await r.json()
        if (stop || !r.ok) return
        setTrades((j.trades || []).slice(0, 40))
      } catch {
        setTrades([])
      }
    }
    tick()
    const id = window.setInterval(tick, 4000)
    return () => {
      stop = true
      window.clearInterval(id)
    }
  }, [base, coinUpper, enabled])

  useEffect(() => {
    if (!enabled || !wallet) {
      setUserState(null)
      return
    }
    let stop = false
    const tick = async () => {
      setLoadingUser(true)
      try {
        const r = await fetch(`${base}/api/hyperliquid/user?address=${encodeURIComponent(wallet)}`, {
          headers: { 'X-Wallet-Address': wallet },
        })
        const j = await r.json()
        if (stop) return
        if (!r.ok) {
          setUserError(j.error || 'user')
          setUserState(null)
          return
        }
        setUserError(null)
        setUserState({
          marginSummary: j.marginSummary,
          withdrawable: j.withdrawable,
          positions: j.positions || [],
          openOrders: j.openOrders || [],
          fills: j.fills || [],
        })
      } catch (e) {
        if (!stop) {
          setUserError((e as Error).message)
          setUserState(null)
        }
      } finally {
        if (!stop) setLoadingUser(false)
      }
    }
    tick()
    const id = window.setInterval(tick, 3500)
    return () => {
      stop = true
      window.clearInterval(id)
    }
  }, [base, enabled, wallet])

  const coinSupported = useMemo(() => {
    if (!coinUpper) return false
    return universe.some((u) => u.name === coinUpper)
  }, [universe, coinUpper])

  const maxLevForCoin = useMemo(() => {
    const u = universe.find((x) => x.name === coinUpper)
    return u?.maxLeverage ?? 50
  }, [universe, coinUpper])

  const placeOrder = useCallback(
    async (body: {
      coin: string
      side: 'long' | 'short'
      orderType: 'market' | 'limit'
      size: number
      limitPrice?: string
      reduceOnly?: boolean
      postOnly?: boolean
      leverage?: number
      marginMode: 'cross' | 'isolated'
    }) => {
      const r = await fetch(`${base}/api/hyperliquid/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      if (!r.ok || j.ok === false) {
        throw new Error(j.error || 'Order failed')
      }
      return j
    },
    [base],
  )

  const cancelOrder = useCallback(
    async (c: string, oid: number) => {
      const r = await fetch(`${base}/api/hyperliquid/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: c, oid }),
      })
      const j = await r.json()
      if (!r.ok || j.ok === false) {
        throw new Error(j.error || 'Cancel failed')
      }
      return j
    },
    [base],
  )

  const setLeverageOnly = useCallback(
    async (c: string, leverage: number, marginMode: 'cross' | 'isolated') => {
      const r = await fetch(`${base}/api/hyperliquid/leverage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: c, leverage, marginMode }),
      })
      const j = await r.json()
      if (!r.ok || j.ok === false) {
        throw new Error(j.error || 'Leverage update failed')
      }
      return j
    },
    [base],
  )

  return {
    universe,
    metaError,
    orderbook,
    trades,
    userState,
    userError,
    loadingUser,
    coinSupported,
    maxLevForCoin,
    placeOrder,
    cancelOrder,
    setLeverageOnly,
  }
}
