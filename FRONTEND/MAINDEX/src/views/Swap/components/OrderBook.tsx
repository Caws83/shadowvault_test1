import React, { useState } from 'react'
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

type BookRow = { price: string; amount: string; total: string }

interface OrderBookProps {
  midPrice: string
  pairLabel: string
  symbol?: string
  /** Live L2 from backend (Hyperliquid). No mock fallback. */
  liveBids?: BookRow[]
  liveAsks?: BookRow[]
  /** Data older than server threshold */
  stale?: boolean
  feedError?: string | null
  /** Public trades from Hyperliquid */
  liveTrades?: { side: 'buy' | 'sell'; px: string; sz: string; time: number }[]
  /** Trades tab: fetch error (distinct from order book feedError) */
  tradesFeedError?: string | null
}

export default function OrderBook({
  midPrice,
  pairLabel,
  symbol,
  liveBids = [],
  liveAsks = [],
  stale,
  feedError,
  liveTrades = [],
  tradesFeedError,
}: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook')

  const bids = liveBids
  const asks = liveAsks

  const maxBid = Math.max(...bids.map((b) => parseFloat(b.total)), 0.01)
  const maxAsk = Math.max(...asks.map((a) => parseFloat(a.total)), 0.01)
  const safeWidth = (v: number) => {
    if (!Number.isFinite(v)) return 0
    if (v < 0) return 0
    if (v > 100) return 100
    return v
  }
  const safeDepthTotal = maxBid + maxAsk > 0 ? maxBid + maxAsk : 1

  const baseLabel = symbol || pairLabel.split('/')[0] || '—'

  const hasBook = bids.length > 0 || asks.length > 0

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
            <span style={{ color: 'rgba(255,255,255,0.5)' }} title="Hyperliquid L2">
              HL
            </span>
            {stale && (
              <Text fontSize="11px" color="warning">
                Stale feed
              </Text>
            )}
            {feedError && (
              <Text fontSize="11px" color="failure">
                {feedError}
              </Text>
            )}
          </ObToolbar>
          <Header style={{ flexShrink: 0 }}>
            <span>Price</span>
            <span style={{ textAlign: 'right' }}>Quantity ({baseLabel})</span>
            <span style={{ textAlign: 'right' }}>Total ({baseLabel})</span>
          </Header>
          {!hasBook && !feedError && (
            <Text fontSize="12px" color="textSubtle" px="12px" py="8px">
              Loading order book…
            </Text>
          )}
          {!hasBook && feedError && (
            <Text fontSize="12px" color="textSubtle" px="12px" py="8px">
              {feedError}
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
        <Flex flex={1} p="12px" flexDirection="column" style={{ overflow: 'auto', maxHeight: 360 }}>
          {tradesFeedError && (
            <Text color="failure" fontSize="12px" mb="8px">
              {tradesFeedError}
            </Text>
          )}
          {!tradesFeedError && liveTrades.length === 0 && (
            <Text color="textSubtle" fontSize="12px">
              No recent trades
            </Text>
          )}
          {liveTrades.length > 0 &&
            liveTrades.map((t, i) => (
              <Flex key={`${t.time}-${i}`} justifyContent="space-between" py="4px" fontSize="12px">
                <Text color={t.side === 'buy' ? 'success' : 'failure'}>{t.side.toUpperCase()}</Text>
                <Text>{t.px}</Text>
                <Text color="textSubtle">{t.sz}</Text>
                <Text color="textSubtle" fontSize="11px">
                  {new Date(t.time).toLocaleTimeString()}
                </Text>
              </Flex>
            ))}
        </Flex>
      )}
    </Wrap>
  )
}
