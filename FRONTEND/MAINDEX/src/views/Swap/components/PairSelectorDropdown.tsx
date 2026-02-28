/**
 * Pair selector dropdown - select top pairs like Bitget/MEXC
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Text } from 'uikit'

const Wrap = styled.div`
  position: relative;
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  min-width: 180px;

  &:hover {
    border-color: #9c4545;
  }
`

const Dropdown = styled.div<{ open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  min-width: 220px;
  max-height: 360px;
  overflow-y: auto;
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  z-index: 100;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
`

const Item = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.9);
  text-align: left;
  font-size: 13px;

  &:hover {
    background: rgba(156,69,69,0.15);
  }
`

const TOP_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'LINKUSDT',
  'UNIUSDT',
  'ATOMUSDT',
  'LTCUSDT',
  'ARBUSDT',
  'OPUSDT',
  'SUIUSDT',
  'PEPEUSDT',
  'SHIBUSDT',
]

interface PairSelectorDropdownProps {
  value: string
  onChange: (pair: string) => void
}

export default function PairSelectorDropdown({ value, onChange }: PairSelectorDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const displayValue = value ? `${value} Perpetual` : 'Select pair'

  return (
    <Wrap ref={ref}>
      <Trigger onClick={() => setOpen(!open)} type="button">
        <Text bold fontSize="14px">{displayValue}</Text>
        <Text color="primary">{open ? '▲' : '▼'}</Text>
      </Trigger>
      <Dropdown open={open}>
        {TOP_PAIRS.map((pair) => (
          <Item
            key={pair}
            onClick={() => {
              onChange(pair.replace('USDT', ''))
              setOpen(false)
            }}
          >
            <span>{pair} Perpetual</span>
            {value.toUpperCase() === pair.replace('USDT', '') && <Text color="primary" fontSize="12px">✓</Text>}
          </Item>
        ))}
      </Dropdown>
    </Wrap>
  )
}
