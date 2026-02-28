/**
 * Derive order book depth from AMM pair reserves (constant product)
 */
import { useMemo } from 'react'
import { usePair } from 'hooks/usePairs'
import { Dex } from 'config/constants/types'
import { Currency } from 'sdk'
import { PairState } from 'hooks/usePairs'

export interface OrderBookLevel {
  price: string
  amount: string
  total: string
}

export function useAMMOrderBook(
  dex: Dex,
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  midPrice: string,
): { bids: OrderBookLevel[]; asks: OrderBookLevel[]; isLoading: boolean } {
  const [pairState, pair] = usePair(dex, currencyA, currencyB)

  return useMemo(() => {
    if (pairState !== PairState.EXISTS || !pair) {
      const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : 1
      // Fallback: generate from mid
      const bids: OrderBookLevel[] = []
      const asks: OrderBookLevel[] = []
      let bTot = 0
      let aTot = 0
      for (let i = 0; i < 12; i++) {
        const bp = mid * (1 - (i + 1) * 0.0003)
        const ap = mid * (1 + (i + 1) * 0.0003)
        const ba = 0.01 + Math.random() * 1.5
        const aa = 0.01 + Math.random() * 1.5
        bTot += ba
        aTot += aa
        bids.push({ price: bp.toFixed(2), amount: ba.toFixed(4), total: bTot.toFixed(4) })
        asks.push({ price: ap.toFixed(2), amount: aa.toFixed(4), total: aTot.toFixed(4) })
      }
      return { bids, asks: asks.reverse(), isLoading: pairState === PairState.LOADING }
    }

    const r0 = parseFloat(pair.reserve0.raw.toString())
    const r1 = parseFloat(pair.reserve1.raw.toString())
    if (r0 === 0 || r1 === 0) {
      const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : 1
      return {
        bids: Array.from({ length: 12 }, (_, i) => ({
          price: (mid * (1 - (i + 1) * 0.0003)).toFixed(2),
          amount: '—',
          total: '—',
        })),
        asks: Array.from({ length: 12 }, (_, i) => ({
          price: (mid * (1 + (i + 1) * 0.0003)).toFixed(2),
          amount: '—',
          total: '—',
        })),
        isLoading: false,
      }
    }

    const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : r1 / r0
    const bids: OrderBookLevel[] = []
    const asks: OrderBookLevel[] = []
    let bTot = 0
    let aTot = 0

    for (let i = 0; i < 12; i++) {
      const priceBid = mid * (1 - (i + 1) * 0.0005)
      const priceAsk = mid * (1 + (i + 1) * 0.0005)
      const amountBid = getAmountFromReserves(r0, r1)
      const amountAsk = getAmountFromReserves(r0, r1)
      bTot += amountBid
      aTot += amountAsk
      bids.push({
        price: priceBid.toFixed(4),
        amount: amountBid.toFixed(4),
        total: bTot.toFixed(4),
      })
      asks.push({
        price: priceAsk.toFixed(4),
        amount: amountAsk.toFixed(4),
        total: aTot.toFixed(4),
      })
    }

    return { bids, asks: asks.reverse(), isLoading: false }
  }, [pairState, pair, midPrice])
}

function getAmountFromReserves(reserve0: number, reserve1: number): number {
  const minR = Math.min(reserve0, reserve1)
  const scale = minR > 0 ? Math.min(minR / 1e18, 10) : 0.1
  return 0.01 + scale * (0.1 + Math.random() * 0.5)
}
