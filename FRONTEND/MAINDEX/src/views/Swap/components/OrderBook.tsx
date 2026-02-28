import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'

const Wrap = styled.div`
  background: #141414;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  min-height: 400px;
  display: flex;
  flex-direction: column;
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
  border-bottom: 2px solid ${({ active }) => (active ? '#DC143C' : 'transparent')};
  margin-bottom: -1px;
`

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 4px 16px;
  font-size: 13px;
  cursor: pointer;
  position: relative;

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
  background: ${({ isAsk }) => (isAsk ? 'rgba(255,82,82,0.15)' : 'rgba(0,180,42,0.15)')};
`

const MidPrice = styled.div`
  padding: 12px 16px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  background: rgba(0,0,0,0.3);
`

interface OrderBookProps {
  midPrice: string
  pairLabel: string
}

function genBids(mid: number, n: number): { price: string; amount: string; total: string }[] {
  const out = []
  let tot = 0
  for (let i = 0; i < n; i++) {
    const p = mid * (1 - (i + 1) * 0.0003)
    const a = 0.01 + Math.random() * 1.5
    tot += a
    out.push({ price: p.toFixed(2), amount: a.toFixed(4), total: tot.toFixed(4) })
  }
  return out
}

function genAsks(mid: number, n: number): { price: string; amount: string; total: string }[] {
  const out = []
  let tot = 0
  for (let i = 0; i < n; i++) {
    const p = mid * (1 + (i + 1) * 0.0003)
    const a = 0.01 + Math.random() * 1.5
    tot += a
    out.push({ price: p.toFixed(2), amount: a.toFixed(4), total: tot.toFixed(4) })
  }
  return out
}

export default function OrderBook({ midPrice, pairLabel }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook')

  const { bids, asks } = useMemo(() => {
    const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : 1
    return { bids: genBids(mid, 12), asks: genAsks(mid, 12) }
  }, [midPrice])

  const maxBid = Math.max(...bids.map((b) => parseFloat(b.total)), 0.01)
  const maxAsk = Math.max(...asks.map((a) => parseFloat(a.total)), 0.01)

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
        <>
          <Header>
            <span>Price ({pairLabel})</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </Header>
          <div style={{ maxHeight: 180, overflow: 'auto' }}>
            {[...asks].reverse().map((a, i) => (
              <Row key={'a' + i}>
                <DepthBar width={(parseFloat(a.total) / maxAsk) * 100} isAsk />
                <span style={{ color: '#FF5252' }}>{a.price}</span>
                <span style={{ textAlign: 'right' }}>{a.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{a.total}</span>
              </Row>
            ))}
          </div>
          <MidPrice>{midPrice || '—'}</MidPrice>
          <div style={{ maxHeight: 180, overflow: 'auto' }}>
            {bids.map((b, i) => (
              <Row key={'b' + i}>
                <DepthBar width={(parseFloat(b.total) / maxBid) * 100} />
                <span style={{ color: '#00B42A' }}>{b.price}</span>
                <span style={{ textAlign: 'right' }}>{b.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{b.total}</span>
              </Row>
            ))}
          </div>
        </>
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
