/**
 * Trade Mode Dropdown - Select Public, Private (ZK), or Perpetual
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'

const DropdownWrap = styled.div<{ isOpen: boolean }>`
  position: relative;
  width: 100%;
  z-index: ${({ isOpen }) => (isOpen ? 1000 : 100)};
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  background-color: #1a1b1f;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ theme }) => theme.colors.text};
  height: 52px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #1e1f24;
  }
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: #121316;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
`

const Option = styled.button<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 14px 16px;
  background: ${({ active }) => (active ? 'rgba(220, 20, 60, 0.15)' : 'transparent')};
  border: none;
  cursor: pointer;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: rgba(220, 20, 60, 0.1);
  }
`

export type TradeMode = 'PUBLIC' | 'PRIVATE' | 'PERPETUAL'

const MODES: { value: TradeMode; label: string; desc: string }[] = [
  { value: 'PUBLIC', label: 'Public', desc: 'Standard swap, visible on-chain' },
  { value: 'PRIVATE', label: 'Private (ZK)', desc: 'Zero-knowledge, no trace' },
  { value: 'PERPETUAL', label: 'Perpetual', desc: 'Leverage trading mode' },
]

interface TradeModeDropdownProps {
  value: TradeMode
  onChange: (mode: TradeMode) => void
}

export default function TradeModeDropdown({ value, onChange }: TradeModeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = MODES.find((m) => m.value === value) ?? MODES[0]

  return (
    <DropdownWrap ref={ref} isOpen={isOpen}>
      <Trigger onClick={() => setIsOpen(!isOpen)} type="button">
        <Flex flexDirection="column" alignItems="flex-start" gap="2px" style={{ minWidth: 0, overflow: 'hidden' }}>
          <Text bold fontSize="13px" color="text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            Trade Mode
          </Text>
          <Text fontSize="11px" color="textSubtle" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {current.label}
          </Text>
        </Flex>
        <Text fontSize="14px" color="primary" style={{ flexShrink: 0, marginLeft: '4px' }}>{isOpen ? '▲' : '▼'}</Text>
      </Trigger>
      <DropdownMenu isOpen={isOpen}>
        {MODES.map((m) => (
          <Option
            key={m.value}
            active={value === m.value}
            onClick={() => {
              onChange(m.value)
              setIsOpen(false)
            }}
          >
            <Text bold fontSize="14px">{m.label}</Text>
            <Text fontSize="12px" color="textSubtle">{m.desc}</Text>
          </Option>
        ))}
      </DropdownMenu>
    </DropdownWrap>
  )
}
