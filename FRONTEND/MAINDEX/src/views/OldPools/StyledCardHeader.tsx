import React from 'react'
import { CardHeader, Heading, Text, Flex } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { usePublicClient } from 'wagmi'
import {oldPoolInfo} from './types'

const Wrapper = styled(CardHeader)`
  background: ${({ theme }) => theme.colors.gradients['cardHeader']};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
`

const StyledCardHeader: React.FC<{
  poolInfo: oldPoolInfo
  isFinished?: boolean
}> = ({ poolInfo, isFinished = false }) => {
  const { t } = useTranslation()
  const client = usePublicClient({chainId: poolInfo.chainId})

  const getHeadingPrefix = () => {
    return t('Earn')
  }

  const getSubHeading = () => {
    return t('Stake %symbol%', { symbol: poolInfo.stakingSymbol })
  }

  return (
    <Wrapper >

      <Flex alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <Text fontSize="14px" color="secondary">
            {client.chain.name}
          </Text>
          <Heading color={isFinished ? 'textDisabled' : 'textSubtle'} scale="lg">
            {`${getHeadingPrefix()} ${poolInfo.earningSymbol} ${poolInfo.isDual === true ? ` & ${poolInfo.earning2Symbol}` : ''}`}
          </Heading>
          <Text color={isFinished ? 'textDisabled' : 'textSubtle'}>{getSubHeading()}</Text>
          
        </Flex>
       
      </Flex>
    </Wrapper>
  )
}

export default StyledCardHeader
