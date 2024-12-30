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
  background: rgba(20, 20, 22, 0.95);
  border-bottom: 1px solid #3c3f44;
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
`

const GradientText = styled(Text)`
  color: transparent !important;
  background: linear-gradient(9deg, rgb(255, 255, 255) 0%, rgb(138, 212, 249) 100%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  font-size: 24px !important;
  font-weight: 600 !important;
  line-height: 1.6 !important;
  padding: 4px 0 !important;
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
    <Wrapper>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <GradientText>
            {getSubHeading()}
          </GradientText>
        </Flex>
        {isAutoVault ? (
          <CakeVaultTokenPairImage width={45} height={45} />
        ) : isCakePool ? (
          <TokenImage 
            token={earningToken}
            host={pool.host}
            chainId={pool.chainId}
            width={45}
            height={45}
          />
         ) : (
          <TokenPairImage
            primaryToken={earningToken}
            host={pool.host}
            chainId={pool.chainId}
            secondaryToken={stakingToken}
            width={45}
            height={45}
          />
        )}
      </Flex>
    </Wrapper>
  )
}

export default StyledCardHeader
