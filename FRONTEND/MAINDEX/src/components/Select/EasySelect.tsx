import React, { useState, useRef, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { ArrowDropDownIcon, Flex, Text } from 'uikit'
import { TokenImage } from 'components/TokenImage'
import { Token } from 'config/constants/types'
import hosts from 'config/constants/hosts'

const DropDownHeader = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
  border: 1px solid ${({ theme }) => theme.colors.input};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.input};
  transition: border-radius 0.10s;
`

const DropDownListContainer = styled.div`
  min-width: 136px;
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

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 168px;
  }
`

const DropDownContainer = styled.div<{ isOpen: boolean }>`
  cursor: pointer;
  width: 100%;
  position: relative;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 4px;
  height: 40px;
  min-width: 136px;
  user-select: none;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 168px;
  }

  ${(props) =>
    props.isOpen &&
    css`
      ${DropDownHeader} {
        border-bottom: 1px solid ${({ theme }) => theme.colors.input};
        box-shadow: ${({ theme }) => theme.tooltip.boxShadow};
        border-radius: 4px 4px 0 0;
      }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border: 1px solid ${({ theme }) => theme.colors.input};
        border-top-width: 0;
        border-radius: 0 0 4px 4px;
        box-shadow: ${({ theme }) => theme.tooltip.boxShadow};
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

export interface EasySelectProps {
  options: Token[]
  startIndex?: number
  selectedId?: number
  onChange?: (option: Token) => void
}

const EasySelect: React.FunctionComponent<EasySelectProps> = ({ options, startIndex, selectedId, onChange }) => {
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(startIndex === undefined ? 0 : startIndex)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const toggling = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsOpen(!isOpen)
    event.stopPropagation()
  }

  const onOptionClicked = (selectedIndex: number) => () => {
    setSelectedOptionIndex(selectedIndex)
    setIsOpen(false)

    if (onChange) {
      onChange(options[selectedIndex])
    }
  }

  useEffect(() => {
    if (selectedId !== undefined && selectedOptionIndex !== selectedId) {
      setSelectedOptionIndex(selectedId)
    }
  }, [selectedId, selectedOptionIndex])

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
              host={hosts.marswap}
              width={24}
              height={24}
              style={{ marginRight: '18px' }}
            />
            <Text>{options[selectedOptionIndex]?.name}</Text>
          </Flex>
        </DropDownHeader>
      )}
      <ArrowDropDownIcon color="text" onClick={toggling} />
      <DropDownListContainer>
        <DropDownList ref={dropdownRef}>
          {options.map((option, index) =>
            index !== selectedOptionIndex ? (
              <ListItem onClick={onOptionClicked(index)} key={option?.name}>
                <Flex>
                  <TokenImage
                    token={option}
                    host={hosts.marswap}
                    width={24}
                    height={24}
                    style={{ marginRight: '18px' }}
                  />
                  <Text>{option?.name}</Text>
                </Flex>
              </ListItem>
            ) : null,
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  )
}

export default EasySelect
