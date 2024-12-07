import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, Text, useMatchBreakpoints } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useCakeVault } from 'state/pools/hooks'
import { Pool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { TokenPairImage } from 'components/TokenImage'
import CakeVaultTokenPairImage from '../../CakeVaultCard/CakeVaultTokenPairImage'
import BaseCell, { CellContent } from './BaseCell'
import { usePublicClient } from 'wagmi'

interface NameCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 5;
  flex-direction: row;
  padding-left: 6px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding-left: 16px;
  }
`

const NameCell: React.FC<NameCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { stakingToken, earningToken, userData, isFinished, isAutoVault } = pool
  const {
    userData: { userShares },
  } = useCakeVault()
  const hasVaultShares = userShares && new BigNumber(userShares).gt(0)
  const client = usePublicClient({chainId: pool.chainId})
  const stakingTokenSymbol = stakingToken.symbol
  const earningTokenSymbol = earningToken.symbol

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance.toString()) : BIG_ZERO
  const isStaked = stakedBalance.gt(0)

  const showStakedTag = isAutoVault ? hasVaultShares : isStaked

  let title = `${t('Earn')} ${earningTokenSymbol}`
  let subtitle = `${t('Stake')} ${stakingTokenSymbol}`

  if (isAutoVault) {
    title = t('Auto MSWAPF')
    subtitle = t('Auto Restaking')
  }

  return (
  
    <StyledCell role="cell">
      {isAutoVault ? (
        <CakeVaultTokenPairImage mr="4px" width={isMobile ? 50 : 64} height={isMobile ? 50 : 64} />
      ) : (
        <TokenPairImage
          primaryToken={earningToken}
          secondaryToken={stakingToken}
          host={pool.host}
          chainId={pool.chainId}
          mr="4px"
          width={isMobile ? 50 : 64}
          height={isMobile ? 50 : 64}
        />
      )}
      <CellContent>

        <Text fontSize="14px" color="secondary">
          {client.chain.name}
        </Text>

        {showStakedTag && (
          <Text fontSize="10px" bold color={isFinished ? 'failure' : 'primary'} textTransform="uppercase">
            {t('Staked')}
          </Text>
        )}

        <Text bold={!isMobile} small={isMobile} color="textSubtle">
          {title}
        </Text>

        <Text fontSize="14px" color="textSubtle">
          {subtitle}
        </Text>

        
        
      </CellContent>
      
    </StyledCell>
    

  )
}

export default NameCell
