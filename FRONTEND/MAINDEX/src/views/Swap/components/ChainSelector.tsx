/**
 * Chain selector - ETH, BSC, etc.
 */
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Text } from 'uikit'
import { useSwitchChain } from 'wagmi'
import { dexList } from 'config/constants/dex'

const Wrap = styled.div`
  position: relative;
`

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.input};
  border: 2px solid rgba(220, 20, 60, 0.4);
  border-radius: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  min-width: 120px;

  &:hover {
    border-color: #9c4545;
  }
`

const Menu = styled.div<{ open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid rgba(220, 20, 60, 0.4);
  border-radius: 10px;
  overflow: hidden;
  z-index: 100;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
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
  97: 'tBNB BSC Testnet',
  11155111: 'Sepolia ETH Testnet',
  245022926: 'Neon Devnet',
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

  const chains = [...new Set(dexList.map((d) => d.chainId))].sort((a, b) => {
    const testnets = [97, 11155111]
    const aTest = testnets.includes(a) ? 0 : 1
    const bTest = testnets.includes(b) ? 0 : 1
    if (aTest !== bTest) return aTest - bTest
    return a - b
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
    <Wrap ref={ref}>
      <Trigger onClick={() => setOpen(!open)} type="button">
        <Text bold fontSize="14px">{label}</Text>
        <Text color="primary">{open ? '▲' : '▼'}</Text>
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
