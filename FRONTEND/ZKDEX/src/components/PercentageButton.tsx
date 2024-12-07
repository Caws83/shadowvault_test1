import React from 'react'
import styled from 'styled-components'
import { Button } from '../uikit'

interface PercentageButtonProps {
  onClick: () => void
  children: React.ReactNode
}

const StyledButton = styled(Button)`
  flex-grow: 1;
`

const PercentageButton: React.FC<PercentageButtonProps> = ({ children, onClick }) => {
  return (
    <StyledButton mx="3px" p="4px 16px" variant="tertiary" onClick={onClick}>
      {children}
    </StyledButton>
  )
}

export default PercentageButton
