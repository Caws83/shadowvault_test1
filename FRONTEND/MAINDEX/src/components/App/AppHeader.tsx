import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon, NotificationDot } from 'uikit'
import { Link } from 'react-router-dom'
import { useExpertModeManager } from 'state/user/hooks'
import GlobalSettings from 'components/Menu/GlobalSettings'
import Transactions from './Transactions'
import QuestionHelper from '../QuestionHelper'

interface Props {
  title: string
  subtitle: string
  helper?: string
  backTo?: string
  noConfig?: boolean
  second?: string
  image?: string
}

const AppHeaderContainer = styled(Flex)<{ image: string }>`
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: ${({ image }) => `url('/images/dexs/${image}.png')`};
`

const AppHeader: React.FC<Props> = ({ title, subtitle, helper, backTo, noConfig = false, second, image }) => {
  const [expertMode] = useExpertModeManager()

  return (
    <AppHeaderContainer image={image}>
      <Flex alignItems="center" mr={noConfig ? 0 : '10px'}>
        {backTo && (
          <IconButton as={Link} to={backTo}>
            <ArrowBackIcon width="32px" />
          </IconButton>
        )}
        <Flex flexDirection="column">
          <Heading as="h2" mb="8px">
            {title}
          </Heading>
          <Flex alignItems="center">
            {helper && <QuestionHelper text={helper} mr="4px" />}
            <Text bold color="textSubtle" fontSize="16px">
              {subtitle}
            </Text>
            <Text color="secondary" fontSize="16px">
              {second}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      {!noConfig && (
        <Flex alignItems="center">
          <NotificationDot show={expertMode}>
            <GlobalSettings />
          </NotificationDot>
          <Transactions />
        </Flex>
      )}
    </AppHeaderContainer>
  )
}

export default AppHeader
