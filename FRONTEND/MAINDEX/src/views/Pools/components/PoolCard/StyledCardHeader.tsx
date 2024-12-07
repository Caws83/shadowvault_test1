import React from 'react'
import { CardHeader, Heading, Text, Flex } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Token } from 'config/constants/types'
import { Pool } from 'state/types'
import { TokenImage, TokenPairImage } from 'components/TokenImage'
import CakeVaultTokenPairImage from '../CakeVaultCard/CakeVaultTokenPairImage'
import { usePublicClient } from 'wagmi'

const Wrapper = styled(CardHeader)`
  background: ${({ theme }) => theme.colors.gradients['cardHeader']};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
`

const StyledCardHeader: React.FC<{
  earningToken: Token
  stakingToken: Token
  isAutoVault?: boolean
  isFinished?: boolean
  isStaking?: boolean
  pool: Pool
}> = ({ earningToken, stakingToken, isFinished = false, isAutoVault = false, isStaking = false, pool }) => {
  const { t } = useTranslation()
  const isCakePool = earningToken?.symbol === stakingToken?.symbol
  const client = usePublicClient({chainId: pool.chainId})

  const getHeadingPrefix = () => {
    if (isAutoVault) {
      // vault
      return t('Auto')
    }
    if (isCakePool) {
      // manual cake
      return t('Manual')
    }
    // all other pools
    return t('Earn')
  }

  const getSubHeading = () => {
    if (isAutoVault) {
      return t('Automatic restaking')
    }
    if (isCakePool) {
      return t('Stake/Earn %symbol%', { symbol: stakingToken.symbol })
    }
    return t('Stake %symbol%', { symbol: stakingToken.symbol })
  }

  return (
    <Wrapper >

      <Flex alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <Text fontSize="18px" color="text">
            {getSubHeading()}
          </Text>
         
        </Flex>
        {isAutoVault ? (
          <CakeVaultTokenPairImage width={64} height={64} />
        ) : isCakePool ? (
          <TokenImage 
            token={earningToken}
            host={pool.host}
            chainId={pool.chainId}
            width={64}
            height={64}
          />
         ) : (
          <TokenPairImage
            primaryToken={earningToken}
            host={pool.host}
            chainId={pool.chainId}
            secondaryToken={stakingToken}
            width={64}
            height={64}
          />
        )}
      </Flex>
    </Wrapper>
  )
}

export default StyledCardHeader
