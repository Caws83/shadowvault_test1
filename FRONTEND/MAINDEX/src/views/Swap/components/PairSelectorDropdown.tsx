/**
 * Pair selector dropdown - select top pairs like Bitget/MEXC
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Text } from 'uikit'

const Wrap = styled.div<{ open: boolean }>`
  position: relative;
  z-index: ${({ open }) => (open ? 1000 : 100)};
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: rgba(30, 31, 34, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 0 80px rgba(225, 29, 46, 0.04);
  border-radius: 22px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  min-width: 180px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
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
  background-color: rgba(30, 31, 34, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 0 80px rgba(225, 29, 46, 0.04);
  border-radius: 22px;
  z-index: 1000;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
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
    background: rgba(230, 57, 70, 0.12);
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
    <Wrap ref={ref} open={open}>
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
