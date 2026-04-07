import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'

const Wrap = styled.div`
  background-color: #121316;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 12px;
`

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 16px;
  background: none;
  border: none;
  color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.5)')};
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => (active ? 'rgba(230, 57, 70, 0.6)' : 'transparent')};
  margin-bottom: -1px;
`

const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  padding: 8px 12px;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  gap: 4px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  position: relative;
  gap: 4px;

  &:hover {
    background: rgba(255,255,255,0.04);
  }
`

const DepthBar = styled.div<{ width: number; isAsk?: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: ${({ width }) => width}%;
  background: ${({ isAsk }) => (isAsk ? 'rgba(165,91,91,0.18)' : 'rgba(0,180,42,0.15)')};
`

const MidPrice = styled.div`
  padding: 12px 16px;
  font-size: 20px;
  font-weight: 700;
  color: #00B42A;
  text-align: center;
  background: rgba(0,0,0,0.3);
`

const ObToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 12px;
`

const DepthBarRow = styled.div`
  display: flex;
  padding: 8px 16px;
  gap: 12px;
  font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
`
const DepthBarItem = styled.span<{ color: string }>`
  color: ${({ color }) => color};
`

const DepthSelect = styled.select`
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  color: rgba(255,255,255,0.9);
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
`

interface OrderBookProps {
  midPrice: string
  pairLabel: string
  symbol?: string
}

function genBids(mid: number): { price: string; amount: string; total: string }[] {
  const out: { price: string; amount: string; total: string }[] = []
  let tot = 0
  for (let i = 0; i < 12; i++) {
    const p = mid * (1 - (i + 1) * 0.0003)
    const a = 0.01 + Math.random() * 1.5
    tot += a
    out.push({ price: p.toFixed(2), amount: a.toFixed(4), total: tot.toFixed(4) })
  }
  return out
}

function genAsks(mid: number): { price: string; amount: string; total: string }[] {
  const out: { price: string; amount: string; total: string }[] = []
  let tot = 0
  for (let i = 0; i < 12; i++) {
    const p = mid * (1 + (i + 1) * 0.0003)
    const a = 0.01 + Math.random() * 1.5
    tot += a
    out.push({ price: p.toFixed(2), amount: a.toFixed(4), total: tot.toFixed(4) })
  }
  return out
}

type BookRow = { price: string; amount: string; total: string }

const toBookRows = (levels: [string, string][]): BookRow[] => {
  let running = 0
  return levels.map(([p, q]) => {
    const qty = parseFloat(q) || 0
    running += qty
    return {
      price: (parseFloat(p) || 0).toFixed(2),
      amount: qty.toFixed(4),
      total: running.toFixed(4),
    }
  })
}

export default function OrderBook({ midPrice, pairLabel, symbol }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook')
  const [book, setBook] = useState<{ bids: BookRow[]; asks: BookRow[] } | null>(null)
  const [bookError, setBookError] = useState<string | null>(null)
  const [fallbackOnly, setFallbackOnly] = useState(false)

  const fallbackBook = useMemo(() => {
    const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : 1
    return { bids: genBids(mid), asks: genAsks(mid) }
  }, [midPrice])
  const bids = book?.bids?.length ? book.bids : fallbackBook.bids
  const asks = book?.asks?.length ? book.asks : fallbackBook.asks

  useEffect(() => {
    if (fallbackOnly) return
    const base = (symbol || pairLabel.split('/')[0] || '').toUpperCase().trim()
    if (!base) return
    const market = `${base}USDT`
    const controller = new AbortController()
    let failures = 0
    let stopPolling = false

    const loadDepth = async () => {
      if (stopPolling) return
      try {
        setBookError(null)
        const response = await fetch(
          `https://api.binance.com/api/v3/depth?symbol=${market}&limit=12`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error(`Depth unavailable for ${market}`)
        const data = await response.json()
        const asksRaw = (data?.asks || []).slice(0, 12) as [string, string][]
        const bidsRaw = (data?.bids || []).slice(0, 12) as [string, string][]
        setBook({
          asks: toBookRows(asksRaw),
          bids: toBookRows(bidsRaw),
        })
        failures = 0
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return
        setBook(null)
        setBookError((e as Error)?.message || 'Orderbook unavailable')
        failures += 1
        // If external feed keeps failing, switch to stable local fallback depth.
        if (failures >= 3) {
          stopPolling = true
          setFallbackOnly(true)
        }
      }
    }

    loadDepth()
    const id = window.setInterval(loadDepth, 6000)
    return () => {
      controller.abort()
      window.clearInterval(id)
    }
  }, [fallbackOnly, pairLabel, symbol])

  const maxBid = Math.max(...bids.map((b) => parseFloat(b.total)), 0.01)
  const maxAsk = Math.max(...asks.map((a) => parseFloat(a.total)), 0.01)
  const safeWidth = (v: number) => {
    if (!Number.isFinite(v)) return 0
    if (v < 0) return 0
    if (v > 100) return 100
    return v
  }
  const safeDepthTotal = maxBid + maxAsk > 0 ? maxBid + maxAsk : 1

  return (
    <Wrap>
      <Tabs>
        <Tab active={activeTab === 'orderbook'} onClick={() => setActiveTab('orderbook')}>
          Order book
        </Tab>
        <Tab active={activeTab === 'trades'} onClick={() => setActiveTab('trades')}>
          Market trades
        </Tab>
      </Tabs>

      {activeTab === 'orderbook' && (
        <Flex flexDirection="column" flex={1} minHeight={0} style={{ overflow: 'hidden' }}>
          <ObToolbar style={{ flexShrink: 0 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} title="Settings">⚙</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} title="Grid">⊞</span>
            <DepthSelect defaultValue="0.1">
              <option value="0.01">0.01</option>
              <option value="0.1">0.1</option>
              <option value="1">1</option>
            </DepthSelect>
          </ObToolbar>
          <Header style={{ flexShrink: 0 }}>
            <span>Price</span>
            <span style={{ textAlign: 'right' }}>Quantity ({pairLabel.split('/')[0] || 'BTC'})</span>
            <span style={{ textAlign: 'right' }}>Total ({pairLabel.split('/')[0] || 'BTC'})</span>
          </Header>
          {bookError && (
            <Text fontSize="11px" color="textSubtle" px="12px" py="4px">
              Live book unavailable, showing fallback depth.
            </Text>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', maxHeight: 200 }}>
            {[...asks].reverse().map((a, i) => (
              <Row key={'a' + i}>
                <DepthBar width={safeWidth((parseFloat(a.total) / maxAsk) * 100)} isAsk />
                <span style={{ color: '#a55b5b' }}>{a.price}</span>
                <span style={{ textAlign: 'right' }}>{a.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{a.total}</span>
              </Row>
            ))}
          </div>
          <MidPrice style={{ flexShrink: 0 }}>{midPrice || '—'}</MidPrice>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', maxHeight: 200 }}>
            {bids.map((b, i) => (
              <Row key={'b' + i}>
                <DepthBar width={safeWidth((parseFloat(b.total) / maxBid) * 100)} />
                <span style={{ color: '#00B42A' }}>{b.price}</span>
                <span style={{ textAlign: 'right' }}>{b.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{b.total}</span>
              </Row>
            ))}
          </div>
          <DepthBarRow style={{ flexShrink: 0 }}>
            <DepthBarItem color="#00B42A">B {((maxBid / safeDepthTotal) * 100).toFixed(1)}%</DepthBarItem>
            <DepthBarItem color="#a55b5b">S {((maxAsk / safeDepthTotal) * 100).toFixed(1)}%</DepthBarItem>
          </DepthBarRow>
        </Flex>
      )}

      {activeTab === 'trades' && (
        <Flex flex={1} p="16px" alignItems="center" justifyContent="center" flexDirection="column">
          <Text color="textSubtle" fontSize="14px">Recent trades</Text>
          <Text color="textSubtle" fontSize="12px" mt="8px">Connect wallet for live trades</Text>
        </Flex>
      )}
    </Wrap>
  )
}
