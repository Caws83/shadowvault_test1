/**
 * Bitget-style Trade Panel - Limit/Market, Leverage, Margin mode
 */
import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Button } from 'uikit'

const Panel = styled.div`
  background: #141414;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  min-height: 500px;
`

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`

const Tab = styled.button<{ active?: boolean }>`
  padding: 14px 20px;
  background: none;
  border: none;
  color: ${({ active }) => (active ? '#fff' : 'rgba(255,255,255,0.5)')};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => (active ? '#DC143C' : 'transparent')};
  margin-bottom: -1px;
`

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
`

const Row = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const Btn = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${({ active }) => (active ? '#DC143C' : 'rgba(255,255,255,0.2)')};
  background: ${({ active }) => (active ? 'rgba(220,20,60,0.2)' : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: #DC143C;
    background: rgba(220,20,60,0.1);
  }
`

const InputWrap = styled.div`
  margin-bottom: 12px;
`

const Label = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 6px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255,255,255,0.3);
  }
`

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  input {
    flex: 1;
  }
`

const LeverageSelect = styled.select`
  padding: 8px 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
`

const LEVERAGE_OPTIONS = [2, 5, 10, 20, 50, 100]

interface BitgetTradePanelProps {
  orderType: 'limit' | 'market'
  onOrderTypeChange: (t: 'limit' | 'market') => void
  marginMode: 'isolated' | 'cross'
  onMarginModeChange: (m: 'isolated' | 'cross') => void
  leverage: number
  onLeverageChange: (l: number) => void
  mode: 'open' | 'close'
  onModeChange: (m: 'open' | 'close') => void
  price: string
  onPriceChange: (v: string) => void
  quantity: string
  onQuantityChange: (v: string) => void
  midPrice: string
  onBBO: () => void
  children: React.ReactNode
}

export default function BitgetTradePanel({
  orderType,
  onOrderTypeChange,
  marginMode,
  onMarginModeChange,
  leverage,
  onLeverageChange,
  mode,
  onModeChange,
  price,
  onPriceChange,
  quantity,
  onQuantityChange,
  midPrice,
  onBBO,
  children,
}: BitgetTradePanelProps) {
  return (
    <Panel>
      <Tabs>
        <Tab active>Trade</Tab>
        <Tab>Bots</Tab>
      </Tabs>

      <Section>
        <Row>
          <Btn active={marginMode === 'isolated'} onClick={() => onMarginModeChange('isolated')}>
            Isolated
          </Btn>
          <Btn active={marginMode === 'cross'} onClick={() => onMarginModeChange('cross')}>
            Cross
          </Btn>
          <LeverageSelect value={leverage} onChange={(e) => onLeverageChange(Number(e.target.value))}>
            {LEVERAGE_OPTIONS.map((x) => (
              <option key={x} value={x}>{x}x</option>
            ))}
          </LeverageSelect>
          <Btn active={mode === 'open'} onClick={() => onModeChange('open')}>
            Open
          </Btn>
          <Btn active={mode === 'close'} onClick={() => onModeChange('close')}>
            Close
          </Btn>
        </Row>

        <Row>
          <Btn active={orderType === 'limit'} onClick={() => onOrderTypeChange('limit')}>
            Limit
          </Btn>
          <Btn active={orderType === 'market'} onClick={() => onOrderTypeChange('market')}>
            Market
          </Btn>
        </Row>

        {orderType === 'limit' && (
          <InputWrap>
            <Label>Price</Label>
            <InputRow>
              <Input
                type="text"
                placeholder="0.0"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
              />
              <Button scale="sm" variant="secondary" onClick={onBBO}>
                BBO
              </Button>
            </InputRow>
          </InputWrap>
        )}

        <InputWrap>
          <Label>Quantity</Label>
          <Input
            type="text"
            placeholder="0.0"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
          />
        </InputWrap>
      </Section>

      {children}
    </Panel>
  )
}
