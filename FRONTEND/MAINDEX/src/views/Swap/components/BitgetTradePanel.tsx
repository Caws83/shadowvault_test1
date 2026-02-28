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
  border-bottom: 2px solid ${({ active }) => (active ? '#9c4545' : 'transparent')};
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
  border: 1px solid ${({ active }) => (active ? '#9c4545' : 'rgba(255,255,255,0.2)')};
  background: ${({ active }) => (active ? 'rgba(156,69,69,0.2)' : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: #9c4545;
    background: rgba(156,69,69,0.1);
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

const QtySlider = styled.input`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  outline: none;
  margin: 8px 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #9c4545;
    cursor: pointer;
  }
`

const AssetsSection = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
`

const AssetsTitle = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12px;
`

const AssetBtns = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const AssetBtn = styled.button`
  flex: 1;
  min-width: 80px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.1);
  }
`

const QtyMarks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  margin-top: -4px;
`

const AvailableRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 8px;
`

const ActionBtn = styled.button<{ variant: 'long' | 'short'; disabled?: boolean }>`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: opacity 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  ${({ variant }) =>
    variant === 'long'
      ? `
    background: #00B42A;
    color: #fff;
    &:hover:not(:disabled) { background: #00d632; }
  `
      : `
    background: #9c4545;
    color: #fff;
    &:hover:not(:disabled) { background: #b35454; }
  `}
`

const LEVERAGE_OPTIONS = [2, 5, 10, 20, 50, 100]

interface BitgetTradePanelProps {
  onOpenLong?: () => void
  onOpenShort?: () => void
  isLongDisabled?: boolean
  isShortDisabled?: boolean
  onDeposit?: () => void
  onTransfer?: () => void
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
  quantityPercent?: number
  onQuantityPercentChange?: (p: number) => void
  inputSymbol?: string
  midPrice: string
  onBBO: () => void
  availableBalance?: string
  children?: React.ReactNode
}

export default function BitgetTradePanel({
  onOpenLong,
  onOpenShort,
  isLongDisabled,
  isShortDisabled,
  onDeposit = () => {},
  onTransfer = () => {},
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
  quantityPercent = 0,
  onQuantityPercentChange,
  inputSymbol = 'BTC',
  midPrice,
  onBBO,
  availableBalance = '0.00',
  children,
}: BitgetTradePanelProps) {
  return (
    <Panel>
      <Tabs>
        <Tab active>Trade</Tab>
        <Tab>Bots</Tab>
      </Tabs>

      {children && <Section style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</Section>}

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
          <Btn style={{ opacity: 0.7 }} title="Coming soon">
            Post only ▾
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

        <AvailableRow>
          <span>Available</span>
          <span>{availableBalance} {inputSymbol || 'USDT'}</span>
        </AvailableRow>
        <InputWrap>
          <Label>
            Quantity
            <span style={{ float: 'right', color: 'rgba(255,255,255,0.5)' }}>{inputSymbol}</span>
          </Label>
          <InputRow>
            <Input
              type="text"
              placeholder="0.0"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              style={{ flex: 1 }}
            />
          </InputRow>
          <QtySlider
            type="range"
            min={0}
            max={100}
            value={quantityPercent}
            onChange={(e) => onQuantityPercentChange?.(Number(e.target.value))}
          />
          <QtyMarks>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </QtyMarks>
        </InputWrap>

        <ActionButtons>
          <ActionBtn
            type="button"
            variant="long"
            disabled={isLongDisabled}
            onClick={onOpenLong}
          >
            Open Long
          </ActionBtn>
          <ActionBtn
            type="button"
            variant="short"
            disabled={isShortDisabled}
            onClick={onOpenShort}
          >
            Open Short
          </ActionBtn>
        </ActionButtons>
      </Section>

      <Section style={{ borderBottom: 'none' }}>
        <AssetsTitle style={{ marginBottom: 8 }}>Account</AssetsTitle>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <div style={{ marginBottom: 4 }}>Maintenance margin rate (MMR) 0.00%</div>
          <div style={{ marginBottom: 4 }}>Maintenance margin 0.00</div>
          <div><a href="#" style={{ color: '#9c4545' }}>Position tier guide</a> <span style={{ marginLeft: 4 }}>More</span></div>
        </div>
      </Section>

      <AssetsSection>
        <AssetsTitle>Assets USDT</AssetsTitle>
        <AssetBtns>
          <AssetBtn onClick={() => window.open('https://www.binance.com/en/buy-BTC', '_blank')}>Buy crypto</AssetBtn>
          <AssetBtn onClick={onDeposit}>Deposit</AssetBtn>
          <AssetBtn onClick={onTransfer}>Transfer</AssetBtn>
        </AssetBtns>
      </AssetsSection>
    </Panel>
  )
}
