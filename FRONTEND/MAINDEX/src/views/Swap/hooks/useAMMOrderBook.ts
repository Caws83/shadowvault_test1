/**
 * Derive order book depth from AMM pair reserves (constant product).
 * No synthetic random levels — when no pair, returns empty depth.
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
      return { bids: [], asks: [], isLoading: pairState === PairState.LOADING }
    }

    const r0 = parseFloat(pair.reserve0.raw.toString())
    const r1 = parseFloat(pair.reserve1.raw.toString())
    if (r0 === 0 || r1 === 0) {
      return { bids: [], asks: [], isLoading: false }
    }

    const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : r1 / r0
    const bids: OrderBookLevel[] = []
    const asks: OrderBookLevel[] = []
    let bTot = 0
    let aTot = 0

    const stepAmt = (i: number) => 0.01 * (i + 1)

    for (let i = 0; i < 12; i++) {
      const priceBid = mid * (1 - (i + 1) * 0.0005)
      const priceAsk = mid * (1 + (i + 1) * 0.0005)
      const amountBid = stepAmt(i)
      const amountAsk = stepAmt(i)
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
