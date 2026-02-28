import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'

const Wrap = styled.div`
  background: #141414;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  min-height: 520px;
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
  border-bottom: 2px solid ${({ active }) => (active ? '#9c4545' : 'transparent')};
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

export default function OrderBook({ midPrice, pairLabel }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook')
  const { bids, asks } = useMemo(() => {
    const mid = parseFloat(midPrice) > 0 ? parseFloat(midPrice) : 1
    return { bids: genBids(mid), asks: genAsks(mid) }
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
          <ObToolbar>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} title="Settings">⚙</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} title="Grid">⊞</span>
            <DepthSelect defaultValue="0.1">
              <option value="0.01">0.01</option>
              <option value="0.1">0.1</option>
              <option value="1">1</option>
            </DepthSelect>
          </ObToolbar>
          <Header>
            <span>Price</span>
            <span style={{ textAlign: 'right' }}>Quantity ({pairLabel.split('/')[0] || 'BTC'})</span>
            <span style={{ textAlign: 'right' }}>Total ({pairLabel.split('/')[0] || 'BTC'})</span>
          </Header>
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {[...asks].reverse().map((a, i) => (
              <Row key={'a' + i}>
                <DepthBar width={(parseFloat(a.total) / maxAsk) * 100} isAsk />
                <span style={{ color: '#a55b5b' }}>{a.price}</span>
                <span style={{ textAlign: 'right' }}>{a.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{a.total}</span>
              </Row>
            ))}
          </div>
          <MidPrice>{midPrice || '—'}</MidPrice>
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            {bids.map((b, i) => (
              <Row key={'b' + i}>
                <DepthBar width={(parseFloat(b.total) / maxBid) * 100} />
                <span style={{ color: '#00B42A' }}>{b.price}</span>
                <span style={{ textAlign: 'right' }}>{b.amount}</span>
                <span style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)' }}>{b.total}</span>
              </Row>
            ))}
          </div>
          <DepthBarRow>
            <DepthBarItem color="#00B42A">B {((maxBid / (maxBid + maxAsk)) * 100).toFixed(1)}%</DepthBarItem>
            <DepthBarItem color="#a55b5b">S {((maxAsk / (maxBid + maxAsk)) * 100).toFixed(1)}%</DepthBarItem>
          </DepthBarRow>
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
