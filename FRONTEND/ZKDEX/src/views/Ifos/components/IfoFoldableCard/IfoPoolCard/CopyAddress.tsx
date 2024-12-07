import React, { useState } from 'react'
import { Box, CopyIcon, Flex, FlexProps, IconButton } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'

interface CopyAddressProps extends FlexProps {
  account: string
  logoOnly?: boolean
}

const Wrapper = styled(Flex)`
  align-items: center;
  background-color: transparent;
  position: relative; /* Ensure the tooltip is positioned relative to this wrapper */
`

const Address = styled.div`
  flex: 1;
  position: relative;
  padding-left: 16px;

  & > input {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 0;
    color: ${({ theme }) => theme.colors.text};
    display: block;
    font-weight: 600;
    font-size: 14px;
    padding: 0;
    width: 100%;

    &:focus {
      outline: 0;
    }
  }

  &:after {
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colors.background}00,
      ${({ theme }) => theme.colors.background}E6
    );
    content: '';
    height: 100%;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
  }
`

const Tooltip = styled.div<{ isTooltipDisplayed: boolean }>`
  display: ${({ isTooltipDisplayed }) => (isTooltipDisplayed ? 'inline-block' : 'none')};
  position: absolute;
  padding: 4px;
  bottom: 90%; 
  right: 0;
  margin-bottom: 8px; /* Space between the button and the tooltip */
  text-align: center;
  background: ${({ theme }) => theme.colors.textSubtle};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  opacity: 0.7; /* Slightly increase opacity for better visibility */
  width: 100px;
  z-index: 9999;
`

const CopyAddress: React.FC<CopyAddressProps> = ({ account, logoOnly, ...props }) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)
  const { t } = useTranslation()

  const copyAddress = () => {
    if (navigator.clipboard && navigator.permissions) {
      navigator.clipboard.writeText(account).then(() => displayTooltip())
    } else if (document.queryCommandSupported('copy')) {
      const ele = document.createElement('textarea')
      ele.value = account
      document.body.appendChild(ele)
      ele.select()
      document.execCommand('copy')
      document.body.removeChild(ele)
      displayTooltip()
    }
  }

  function displayTooltip() {
    setIsTooltipDisplayed(true)
    setTimeout(() => {
      setIsTooltipDisplayed(false)
    }, 1000)
  }

  return (
    <Box {...props}>
      <>
        <Wrapper>
          {!logoOnly &&
          <Address title={account}>
            <input type="text" readOnly value={account} />
          </Address>
          }
          <IconButton variant="text" onClick={copyAddress}>
            <CopyIcon color="primary" width="24px" />
          </IconButton>
          <Tooltip isTooltipDisplayed={isTooltipDisplayed}>{t('Copied')}</Tooltip>
        </Wrapper>
      </>
    </Box>
  )
}

export default CopyAddress
