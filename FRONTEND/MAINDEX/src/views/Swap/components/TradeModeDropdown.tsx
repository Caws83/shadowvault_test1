/**
 * Trade Mode Dropdown - Select Public, Private (ZK), or Perpetual
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'

const DropdownWrap = styled.div`
  position: relative;
  width: 100%;
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.input};
  border: 2px solid rgba(220, 20, 60, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: #9c4545;
    box-shadow: 0 0 12px rgba(220, 20, 60, 0.2);
  }
`

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid rgba(220, 20, 60, 0.5);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
    <DropdownWrap ref={ref}>
      <Trigger onClick={() => setIsOpen(!isOpen)} type="button">
        <Flex flexDirection="column" alignItems="flex-start" gap="2px">
          <Text bold fontSize="14px" color="text">
            Trade Mode
          </Text>
          <Text fontSize="12px" color="textSubtle">
            {current.label} – {current.desc}
          </Text>
        </Flex>
        <Text fontSize="18px" color="primary">{isOpen ? '▲' : '▼'}</Text>
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
