import React, { useEffect, useState, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useGasTokenManager } from 'state/user/hooks'
import { getETHER } from 'sdk'
import tokens from 'config/constants/tokens'
import { Token } from 'config/constants/types'
import { defaultChainId } from 'config/constants/chains'
import styled, { css } from 'styled-components'
import { ArrowDropDownIcon, Flex, Text } from 'uikit'
import { TokenImage } from 'components/TokenImage'
import hosts from 'config/constants/hosts'

const DropDownHeader = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 8px;
  transition: border-radius 0.10s;
`

const DropDownListContainer = styled.div`
  height: 0;
  position: absolute;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.input};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  transition:
    transform 0.15s,
    opacity 0.15s;
  transform: scaleY(0);
  transform-origin: top;
  opacity: 0;
  width: 100%;
`

const DropDownContainer = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  width: 135px;
  position: relative;
  height: 30px;
  user-select: none;

  ${(props) =>
    props.isOpen &&
    css`
      ${DropDownHeader} {
        border: 1px solid ${({ theme }) => theme.colors.input};
      }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border: 1px solid ${({ theme }) => theme.colors.input};
        border-top-width: 0;
        border-radius: 0 0 4px 4px;
      }
    `}

  svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
`

const DropDownList = styled.ul`
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  z-index: ${({ theme }) => theme.zIndices.dropdown};
`

const ListItem = styled.li`
  list-style: none;
  padding: 8px 16px;
  &:hover {
    background: ${({ theme }) => theme.colors.input};
  }
`

const PMTokenSelector = () => {
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const ETHER = getETHER(chainId) as Token
  const [payWithPM, setUsePaymaster, payToken, setPaytoken] = useGasTokenManager()
  const payTokenOptions: Record<number, Token[]> = {
    56: [getETHER(56) as Token],
    97: [getETHER(97) as Token],
    11155111: [getETHER(11155111) as Token],
    245022926: [getETHER(245022926) as Token],
  }
  const options = payTokenOptions[chainId] ?? [getETHER(chainId) as Token]
  const startIndex = options.findIndex(token => token.symbol === payToken?.symbol)

  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(startIndex === undefined ? 0 : startIndex)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const onChangeOutToken = (token: Token) => {
    if (token === ETHER) {
      setPaytoken(token)
      setUsePaymaster(false)
    } else {
      setPaytoken(token)
      setUsePaymaster(true)
    }
  }

  const toggling = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsOpen(!isOpen)
    event.stopPropagation()
  }

  const onOptionClicked = (selectedIndex: number) => () => {
    setSelectedOptionIndex(selectedIndex)
    setIsOpen(false)
    onChangeOutToken(options[selectedIndex])
  }

  useEffect(() => {
    setContainerSize({
      width: dropdownRef.current.offsetWidth, // Consider border
      height: dropdownRef.current.offsetHeight,
    })

    const handleClickOutside = () => {
      setIsOpen(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

 
  return (
    <DropDownContainer isOpen={isOpen} ref={containerRef}>
      {containerSize.width !== 0 && (
        <DropDownHeader onClick={toggling}>
          <Flex flexDirection="row" style={{ width: '100%' }}>
            <TokenImage
              token={options[selectedOptionIndex]}
              host={hosts.forgeTest}
              width={24}
              height={24}
              style={{ marginRight: '6px' }}
            />
            <p style={{ position: 'absolute', bottom: '3px', left: '22px', fontSize: '12px' }}>⛽️</p>
            <Text>{options[selectedOptionIndex]?.symbol}</Text>
          </Flex>
        </DropDownHeader>
      )}
      <ArrowDropDownIcon color="text" onClick={toggling} />
      <DropDownListContainer>
        <DropDownList ref={dropdownRef}>
          {options.map((option, index) =>
            index !== selectedOptionIndex ? (
              <ListItem onClick={onOptionClicked(index)} key={option?.symbol}>
                <Flex>
                  <TokenImage
                    token={option}
                    host={hosts.forgeTest}
                    width={24}
                    height={24}
                    style={{ marginRight: '6px' }}
                  />
                  <Text>{option?.symbol}</Text>
                </Flex>
              </ListItem>
            ) : null,
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  )
}

export default PMTokenSelector
