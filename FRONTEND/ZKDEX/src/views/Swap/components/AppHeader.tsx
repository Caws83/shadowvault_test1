import React from 'react'
import styled from 'styled-components'
import { ArrowBackIcon, Flex, IconButton } from 'uikit'
import { Link } from 'react-router-dom'
import { isMobile } from 'components/isMobile'

interface Props {
  children?: any
  backTo?: string
}

const AppHeaderContainer = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  width: 100%;
  min-height: 50px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.gradients.cardHeader};
`

const AppHeader: React.FC<Props> = (props) => {
  const { backTo, children } = props

  return (
    <AppHeaderContainer>
      <Flex alignItems="center" mr='16px'>
        {backTo && (
          <IconButton as={Link} to={backTo}>
            <ArrowBackIcon width="25px" />
          </IconButton>
        )}
      </Flex>
      {children} 
    </AppHeaderContainer>
  )
}

export default AppHeader
