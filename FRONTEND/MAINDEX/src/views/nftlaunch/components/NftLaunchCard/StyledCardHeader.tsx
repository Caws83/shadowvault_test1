import React, { useEffect, useState } from 'react'
import { CardHeader, Heading, Text, Flex } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Token } from 'config/constants/types'
import { NFTLaunch } from 'state/types'
import BigNumber from 'bignumber.js'
import { usePublicClient } from 'wagmi'

const Wrapper = styled(CardHeader)<{ isFinished?: boolean; background?: string }>`
  background: ${({ isFinished, background, theme }) =>
    isFinished ? theme.colors.disabled : theme.colors.gradients[background]};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
`

const StyledCardHeader: React.FC<{
  payToken: Token
  nftCollectionName: string
  launch: NFTLaunch
}> = ({ payToken, nftCollectionName, launch }) => {
  const { t } = useTranslation()
  const background = 'cardHeader'
  const client = usePublicClient({chainId: launch.chainId})

  const getHeadingPrefix = () => {
    // all other pools
    return t('Mint')
  }
  const isBoth =
    new BigNumber(launch.costToken.toString()).gt(new BigNumber(0)) &&
    new BigNumber(launch.costBNB.toString()).gt(new BigNumber(0))
  const isJustToken = !isBoth && new BigNumber(launch.costToken.toString()).gt(new BigNumber(0))

  const getSubHeading = () => {
    if (isBoth) {
      return t('Spending %symbol% and %native%!!', { symbol: payToken.symbol, native: client.chain.nativeCurrency.symbol })
    }
    if (isJustToken) {
      return t('Spending %symbol%', { symbol: payToken.symbol })
    }
    return t('Spending %native% !!', {native: client.chain.nativeCurrency.symbol})
  }

 

  return (
    <Wrapper isFinished={false} background={background}>
   
        <Flex flexDirection="column">
          <Heading color="body" scale="lg">
            {`${getHeadingPrefix()} ${nftCollectionName}`}
          </Heading>
          <Text color="textSubtle">{getSubHeading()}</Text>
        </Flex>
        
 
    </Wrapper>
  )
}

export default StyledCardHeader
