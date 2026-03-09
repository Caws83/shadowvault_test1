/**
 * Bitget-style Trade Panel - Limit/Market, Leverage, Margin mode
 */
import React, { useState } from 'react'
import styled from 'styled-components'
import { Flex, Text, Button } from 'uikit'
import type { MarginPosition } from 'hooks/useMarginContract'

const Panel = styled.div`
  background-color: #121316;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
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
  border-bottom: 2px solid ${({ active }) => (active ? 'rgba(230, 57, 70, 0.6)' : 'transparent')};
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
  border: 1px solid ${({ active }) => (active ? 'rgba(230, 57, 70, 0.5)' : 'rgba(255,255,255,0.2)')};
  background: ${({ active }) => (active ? 'rgba(230, 57, 70, 0.1)' : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: rgba(230, 57, 70, 0.5);
    background: rgba(230, 57, 70, 0.08);
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

const QtySlider = styled.input<{ percent?: number }>`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: ${({ percent = 0 }) => `linear-gradient(to right, #E11D2E ${percent}%, rgba(255,255,255,0.1) ${percent}%)`};
  border-radius: 3px;
  outline: none;
  margin: 16px 0 12px 0;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #E11D2E;
    border: 3px solid #fff;
    box-shadow: 0 0 10px rgba(225, 29, 46, 0.4);
    cursor: pointer;
    transition: transform 0.1s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
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
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
  padding: 0 4px;
  
  span {
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: #fff;
    }
  }
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
    background: rgba(100, 50, 50, 0.9);
    color: rgba(255, 255, 255, 0.95);
    &:hover:not(:disabled) { background: rgba(120, 60, 60, 0.95); }
  `}
`

const PositionsWrap = styled.div`
  margin-top: 12px;
`
const PositionsTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
`
const PositionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
  gap: 8px;
`
const PositionCol = styled.span<{ type?: 'long' | 'short' }>`
  color: ${({ type }) => (type === 'long' ? '#00B42A' : type === 'short' ? 'rgba(230, 57, 70, 0.95)' : 'rgba(255,255,255,0.8)')};
`
const CloseBtn = styled.button`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid rgba(230, 57, 70, 0.5);
  background: rgba(230, 57, 70, 0.15);
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  white-space: nowrap;
  &:hover:not(:disabled) {
    background: rgba(230, 57, 70, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  chainSelector?: React.ReactNode
  tradeModeSelector?: React.ReactNode
  pmTokenSelector?: React.ReactNode
  feeBadge?: React.ReactNode
  leverageModeSelector?: React.ReactNode
  positions?: MarginPosition[]
  onClosePosition?: (positionId: number) => void
  isClosePending?: boolean
  positionsLoading?: boolean
  nativeSymbol?: string
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
  chainSelector,
  tradeModeSelector,
  pmTokenSelector,
  feeBadge,
  leverageModeSelector,
  positions = [],
  onClosePosition,
  isClosePending = false,
  positionsLoading = false,
  nativeSymbol = 'BNB',
}: BitgetTradePanelProps) {
  const [activeTab, setActiveTab] = useState<'swap' | 'margin' | 'bots'>('margin')

  const formatCollateral = (wei: bigint) => {
    const str = wei.toString()
    if (str.length <= 18) return `0.${str.padStart(18, '0').slice(-18).replace(/0+$/, '') || '0'}`
    return `${str.slice(0, -18)}.${str.slice(-18).slice(0, 6)}`
  }

  return (
    <Panel>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {chainSelector}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {tradeModeSelector}
          </div>
        </div>
        <Row style={{ marginBottom: 0, alignItems: 'center', justifyContent: 'space-between' }}>
          {pmTokenSelector}
          {feeBadge}
        </Row>
      </div>

      <Tabs>
        <Tab active={activeTab === 'margin'} onClick={() => setActiveTab('margin')}>Margin</Tab>
        <Tab active={activeTab === 'swap'} onClick={() => setActiveTab('swap')}>Swap</Tab>
        <Tab active={activeTab === 'bots'} onClick={() => setActiveTab('bots')}>Bots</Tab>
      </Tabs>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'swap' && children && (
          <Section style={{ padding: 0, borderBottom: 'none' }}>{children}</Section>
        )}

        {activeTab === 'margin' && (
          <>
            <Section>
              {leverageModeSelector && (
                <div style={{ marginBottom: '24px' }}>
                  {leverageModeSelector}
                </div>
              )}
              <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn active={marginMode === 'isolated'} onClick={() => onMarginModeChange('isolated')}>
                    Isolated
                  </Btn>
                  <Btn active={marginMode === 'cross'} onClick={() => onMarginModeChange('cross')}>
                    Cross
                  </Btn>
                </div>
                <LeverageSelect value={leverage} onChange={(e) => onLeverageChange(Number(e.target.value))}>
                  {LEVERAGE_OPTIONS.map((x) => (
                    <option key={x} value={x}>{x}x</option>
                  ))}
                </LeverageSelect>
              </Row>

              <Row style={{ flexWrap: 'nowrap', marginBottom: '16px' }}>
                <Btn style={{ flex: 1 }} active={mode === 'open'} onClick={() => onModeChange('open')}>
                  Open
                </Btn>
                <Btn style={{ flex: 1 }} active={mode === 'close'} onClick={() => onModeChange('close')}>
                  Close
                </Btn>
              </Row>

              <Row style={{ flexWrap: 'nowrap' }}>
                <Btn style={{ flex: 1 }} active={orderType === 'limit'} onClick={() => onOrderTypeChange('limit')}>
                  Limit
                </Btn>
                <Btn style={{ flex: 1 }} active={orderType === 'market'} onClick={() => onOrderTypeChange('market')}>
                  Market
                </Btn>
                <Btn style={{ flex: 1, opacity: 0.7 }} title="Coming soon">
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
                  percent={quantityPercent}
                  onChange={(e) => onQuantityPercentChange?.(Number(e.target.value))}
                />
                <QtyMarks>
                  <span onClick={() => onQuantityPercentChange?.(25)}>25%</span>
                  <span onClick={() => onQuantityPercentChange?.(50)}>50%</span>
                  <span onClick={() => onQuantityPercentChange?.(75)}>75%</span>
                  <span onClick={() => onQuantityPercentChange?.(100)}>100%</span>
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
                <div><a href="#" style={{ color: 'rgba(230, 57, 70, 0.95)' }}>Position tier guide</a> <span style={{ marginLeft: 4 }}>More</span></div>
              </div>
            </Section>

            <Section style={{ borderBottom: 'none' }}>
              <PositionsTitle>Positions ({positions.length})</PositionsTitle>
              {positionsLoading ? (
                <Text fontSize="12px" color="textSubtle">Loading positions...</Text>
              ) : positions.length === 0 ? (
                <Text fontSize="12px" color="textSubtle">No open positions</Text>
              ) : (
                <PositionsWrap>
                  {positions.map((p) => (
                    <PositionRow key={p.id}>
                      <PositionCol type={p.isLong ? 'long' : 'short'}>{p.isLong ? 'Long' : 'Short'}</PositionCol>
                      <PositionCol>{formatCollateral(p.collateral)} {nativeSymbol}</PositionCol>
                      <PositionCol>{p.leverage}x</PositionCol>
                      <CloseBtn
                        type="button"
                        disabled={isClosePending}
                        onClick={() => onClosePosition?.(p.id)}
                      >
                        {isClosePending ? 'Closing…' : 'Close'}
                      </CloseBtn>
                    </PositionRow>
                  ))}
                </PositionsWrap>
              )}
            </Section>
          </>
        )}

        {activeTab === 'bots' && (
          <Section style={{ borderBottom: 'none' }}>
            <Flex justifyContent="center" alignItems="center" height="200px">
              <Text color="textSubtle">AI Trading Bots Coming Soon</Text>
            </Flex>
          </Section>
        )}
      </div>

      <AssetsSection style={{ marginTop: 'auto' }}>
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
