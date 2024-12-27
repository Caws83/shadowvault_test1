import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon, NotificationDot } from 'uikit'
import { Link } from 'react-router-dom'
import { useExpertModeManager } from 'state/user/hooks'
import GlobalSettings from 'components/Menu/GlobalSettings'
import Transactions from 'components/App/Transactions'

interface Props {
  title?: string
  subtitle?: string
  helper?: string
  backTo?: string
  noConfig?: boolean
  children?: React.ReactNode
}

const StyledAppHeader = styled.div`
  background: #1b1b1f;
  border-bottom: 1px solid #3c3f44;
  padding: 24px;
`

const AppHeader: React.FC<Props> = ({
  title,
  subtitle,
  helper,
  backTo,
  noConfig = false,
  children,
}) => {
  const [expertMode] = useExpertModeManager()

  return (
    <StyledAppHeader>
      <Flex alignItems="center" width="100%" style={{ gap: '16px' }}>
        {backTo && (
          <IconButton as={Link} to={backTo}>
            <ArrowBackIcon width="32px" />
          </IconButton>
        )}
        <Flex flex="1" flexDirection="column">
          {title && (
            <Heading as="h2" mb="8px">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Flex alignItems="center">
              {helper && <Text mr="8px">{helper}</Text>}
              <Text>{subtitle}</Text>
            </Flex>
          )}
        </Flex>
        {children}
        {!noConfig && (
          <Flex alignItems="center">
            <NotificationDot show={expertMode}>
              <GlobalSettings />
            </NotificationDot>
            <Transactions />
          </Flex>
        )}
      </Flex>
    </StyledAppHeader>
  )
}

export default AppHeader
