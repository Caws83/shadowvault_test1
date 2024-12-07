import useTheme from 'hooks/useTheme'
import React, { useState, useRef, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { ArrowDropDownIcon, Text } from 'uikit'

const DropDownHeader = styled.div<{ color?: string }>`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.shadows.inset};
  border: 2px solid ${({ theme, color }) => color ? `#${color}` : theme.colors.secondary};
  border-radius: 4px;
  transition: border-radius 0.15s;
`

const DropDownListContainer = styled.div`
  min-width: 175px;
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
  max-height: 192px; // Set the maximum height for the dropdown
  overflow-y: auto; // Enable vertical scrolling if needed


  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 190px;
  }
`

const DropDownContainer = styled.div<{ isOpen: boolean; width: number; height: number }>`
  cursor: pointer;
  width: ${({ width }) => width}px;
  position: relative;
  border-radius: 4px;
  height: 40px;
  min-width: 175px;
  user-select: none;
  border: 1px solid transparent;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 190px;
  }

  ${(props) =>
    props.isOpen &&
    css`
      ${DropDownHeader} {
        border: 2px solid ${({ theme }) => theme.colors.primary};
        box-shadow: ${({ theme }) => theme.tooltip.boxShadow};
        border-radius: 4px 4px 0 0;
      }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border: 2px solid ${({ theme }) => theme.colors.primary};
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
  }
`

export interface SelectProps {
  options: OptionProps[]
  startIndex?: number
  selectedId?: number
  onChange?: (option: OptionProps) => void
  color?: string;
}

export interface OptionProps {
  label: string
  value: any
}

const Select: React.FunctionComponent<SelectProps> = ({ options, startIndex, selectedId, onChange, color }) => {
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(startIndex === undefined ? 0 : startIndex)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const { theme } = useTheme()

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
    <DropDownContainer isOpen={isOpen} ref={containerRef} {...containerSize}>
      {containerSize.width !== 0 && (
        <DropDownHeader color={color} onClick={toggling}>
          <Text>{options[selectedOptionIndex]?.label}</Text>
        </DropDownHeader>
      )}
      <ArrowDropDownIcon color="text" onClick={toggling} />
      <DropDownListContainer>
        <DropDownList ref={dropdownRef}>
          {options.map((option, index) =>
            index !== selectedOptionIndex ? (
              <ListItem onClick={onOptionClicked(index)} key={option.label}>
                <Text color={theme.colors.textSubtle}>{option.label}</Text>
              </ListItem>
            ) : null,
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  )
}

export default Select
