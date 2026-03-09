/**
 * Chain selector - ETH, BSC, etc.
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'
import { useSwitchChain } from 'wagmi'
import { dexList } from 'config/constants/dex'

const Wrap = styled.div<{ open: boolean }>`
  position: relative;
  z-index: ${({ open }) => (open ? 1000 : 100)};
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  background-color: #1a1b1f;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  height: 52px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background-color: #1e1f24;
  }
`

const Menu = styled.div<{ open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  min-width: 160px;
  width: 100%;
  background-color: #121316;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
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
  color: ${({ theme }) => theme.colors.text};
  text-align: left;

  &:hover {
    background: rgba(220, 20, 60, 0.1);
  }
`

const chainLabels: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  97: 'tBNB Testnet',
  11155111: 'Sepolia',
}

interface ChainSelectorProps {
  currentChainId: number
  onChainChange?: (chainId: number) => void
  onDexChange?: (dexId: string) => void
}

export default function ChainSelector({ currentChainId, onChainChange }: ChainSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { switchChainAsync } = useSwitchChain()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Order: tBNB, BSC, Ethereum, Sepolia (dexList only; no Neon)
  const chains = [...new Set(dexList.map((d) => d.chainId))].sort((a, b) => {
    const order = [97, 56, 1, 11155111]
    return order.indexOf(a) - order.indexOf(b)
  })
  const label = chainLabels[currentChainId] ?? `Chain ${currentChainId}`

  const handleSelect = async (chainId: number) => {
    setOpen(false)
    if (chainId === currentChainId) return
    try {
      await switchChainAsync?.({ chainId })
      onChainChange?.(chainId)
    } catch (e) {
      console.error('Chain switch failed:', e)
    }
  }

  return (
    <Wrap ref={ref} open={open}>
      <Trigger onClick={() => setOpen(!open)} type="button">
        <Flex flexDirection="column" alignItems="flex-start" gap="2px" style={{ minWidth: 0, overflow: 'hidden' }}>
          <Text bold fontSize="13px" color="text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {label}
          </Text>
        </Flex>
        <Text color="primary" fontSize="14px" style={{ flexShrink: 0, marginLeft: '4px' }}>{open ? '▲' : '▼'}</Text>
      </Trigger>
      <Menu open={open}>
        {chains.map((c) => (
          <Item key={c} onClick={() => handleSelect(c)}>
            <Text fontSize="14px">{chainLabels[c] ?? `Chain ${c}`}</Text>
            {c === currentChainId && <Text color="primary" fontSize="12px">✓</Text>}
          </Item>
        ))}
      </Menu>
    </Wrap>
  )
}
