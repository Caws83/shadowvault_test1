import React, { useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Box, Button, Card, Flex, HelpIcon, Link, LinkExternal, Skeleton, Text, TimerIcon, useModal, useTooltip } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
import { getBscScanLink } from 'utils'
import { NFTPool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { NFTPoolTag } from 'components/Tags'
import { getAddress } from 'utils/addressHelpers'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { getNftPoolBlockInfo } from 'views/NftPools/helpers'
import BigNumber from 'bignumber.js'
import contracts from 'config/constants/contracts'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import Harvest from './Harvest'
import Stake from './Stake'
import SubAdminModal from '../../NftModals/SubAdminModal'
import SubAdminModalV3 from '../../NftModals/SubAdminModalV3'
import { ActionContent } from './styles'
import { useSubAdmin } from '../../NftModals/hooks/SubCalls'
import { NftImage } from 'components/TokenImage'
import { readContract } from '@wagmi/core'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import { dexs } from 'config/constants/dex'

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 900px;
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 900px;
  }
  to {
    max-height: 0px;
  }
`
const StyledCard = styled(Card)`
  width: 90%;
  margin: auto;
  p: 5px;
`

const StyledActionPanel = styled.div<{ expanded: boolean }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundAlt2};
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  padding: 12px;
  

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    padding: 16px 32px;
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
  }
`

type MediaBreakpoints = {
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  isXxl: boolean
}

interface NftActionPanelProps {
  account: string
  nftpool: NFTPool
  userDataLoaded: boolean
  expanded: boolean
  breakpoints: MediaBreakpoints
}

const InfoSection = styled(Box)`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  padding: 8px 8px;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0;
    flex-basis: 230px;
  }
`

const NftActionPanel: React.FC<NftActionPanelProps> = ({ account, nftpool, userDataLoaded, expanded, breakpoints }) => {
  const {
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    contractAddress,
    rewardPerDayPerToken,
    dex,
    currentRound,
  } = nftpool
  const { t } = useTranslation()
  const poolContractAddress = getAddress(contractAddress, nftpool.chainId)
  // const { currentBlock } = useBlock()
  const currentBlock = Date.now() / 1000
  const { isXs, isSm, isMd } = breakpoints
  const showSubtitle = isXs || isSm
  const round = new BigNumber(currentRound).toNumber()
  const currentRToken = earningToken[round]

  // const earningTokenPrice = useBusdPriceFromId(priceId)
  const earningTokenPriceRaw = useGetTokenPrice(dex, currentRToken)
  const earningTokenPrice = new BigNumber(earningTokenPriceRaw)

  const { onOp } = useSubAdmin(nftpool)
  const operator = onOp()
  const showSub = account === getAddress(contracts.farmWallet, nftpool.chainId) || account === operator

  const [onPresentSub] = useModal(
    <SubAdminModal pool={nftpool} earningTokenPrice={earningTokenPrice} currentBlock={currentBlock} />,
  )
  const [onPresentSubV3] = useModal(
    <SubAdminModalV3 pool={nftpool} earningTokenPrice={earningTokenPrice} currentBlock={currentBlock} />,
  )

  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getNftPoolBlockInfo(nftpool, currentBlock)

  const tokenAddress = currentRToken.address ? getAddress(currentRToken.address, nftpool.chainId) : ''

  const getTotalStakedBalance = () => {
    return getBalanceNumber(new BigNumber(totalStaked), stakingToken.decimals)
  }

  const getRewardPerDayBalance = () => {
    if (rewardPerDayPerToken) {
      return getBalanceNumber(new BigNumber(rewardPerDayPerToken), currentRToken.decimals)
    }
    return 0
  }

  const getRewardsPerDayBalanceBusd = () => {
    if (rewardPerDayPerToken) {
      const rpd = new BigNumber(rewardPerDayPerToken).multipliedBy(earningTokenPrice)
      return getBalanceNumber(rpd, currentRToken.decimals)
    }
    return 0
  }
  const {
    targetRef: totalStakedTargetRef,
    tooltip: totalStakedTooltip,
    tooltipVisible: totalStakedTooltipVisible,
  } = useTooltip(t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.name }), {
    placement: 'bottom',
  })

  const manualTooltipText = t('You must harvest and compound your earnings from this pool manually.')

  const {
    targetRef: tagTargetRef,
    tooltip: tagTooltip,
    tooltipVisible: tagTooltipVisible,
  } = useTooltip(manualTooltipText, {
    placement: 'bottom-start',
  })

  const maxStakeRow =
    new BigNumber(stakingLimit).gt(0) ? (
      <Flex mb="8px" justifyContent="space-between">
        <Text>{t('Max. stake per user')}:</Text>
        <Text>{`${getFullDisplayBalance(new BigNumber(stakingLimit), stakingToken.decimals, 0)} ${
          stakingToken.symbol
        }`}</Text>
      </Flex>
    ) : null

  const blocksRow =
    blocksRemaining || blocksUntilStart ? (
      <Flex mb="8px" justifyContent="space-between">
        <Text>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</Text>
        <Flex>
          <Link external href={getBscScanLink(hasPoolStarted ? endBlock : startBlock, 'countdown', nftpool.chainId)}>
            <Balance fontSize="16px" value={blocksToDisplay / 86400} decimals={2} color="textDisabled" />
            <Text ml="4px" color="textDisabled" textTransform="lowercase">
              {t('Days')}
            </Text>
            <TimerIcon ml="4px" color="textDisabled" />
          </Link>
        </Flex>
      </Flex>
    ) : (
      <Skeleton width="56px" height="16px" />
    )

  const totalStakedRow = (
    <Flex justifyContent="space-between" alignItems="center" mb="8px">
    
    <Text fontSize="14px" maxWidth={['50px', '100%']}>{t('TOTAL STAKED')}:</Text>
      <Flex alignItems="center">
        {totalStaked && new BigNumber(totalStaked).gte(0) ? (
          <>
            <Balance
              color="textDisabled"
              fontSize="16px"
              value={getTotalStakedBalance()}
              decimals={0}
              unit={` ${stakingToken.name}`}
            />
            <span ref={totalStakedTargetRef}>
              <HelpIcon color="textSubtle" width="20px" ml="4px" />
            </span>
          </>
        ) : (
          <Skeleton width="56px" height="16px" />
        )}
        {totalStakedTooltipVisible && totalStakedTooltip}
      </Flex>
    </Flex>
  )

  const getDexKey = () => {

    for (const key in dexs) {
      if (dexs[key] === dex) {
        return key;
        
      }
      
    }

  }

  return (
    <StyledActionPanel expanded={expanded}>

      <Flex flexDirection={(isXs || isSm || isMd) ? "column" : "row"}>
    
      <InfoSection>
        <Flex mb="8px" justifyContent="space-between">
          <Text>Rewards per Token/Day: </Text>
          <Flex alignItems="center" flexDirection="column">
            <Balance color="textDisabled" fontSize="16px" value={getRewardPerDayBalance()} decimals={4} />
            <Balance color="textDisabled" fontSize="16px" prefix="~$" value={getRewardsPerDayBalanceBusd()} decimals={4} />
          </Flex>
        </Flex>
        {maxStakeRow}
        {(isXs || isSm || isMd) && totalStakedRow}
        {shouldShowBlockCountdown && blocksRow}
        <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
          <LinkExternal href={`/#/swap?inputCurrency=${getAddress(currentRToken.address, nftpool.chainId)}&dex=${getDexKey()}`} bold={false}>
            {t('Swap/Trade Reward Token')}
          </LinkExternal>
        </Flex>
    
        {poolContractAddress && (
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={`${BASE_BSC_SCAN_URLS[nftpool.chainId]}/address/${poolContractAddress}`} bold={false}>
              {t('View Contract')}
            </LinkExternal>
          </Flex>
        )}
        {account && tokenAddress && (
          <AddToWalletButton
            tokenAddress={tokenAddress}
            tokenSymbol={currentRToken.symbol}
            tokenDecimals={currentRToken.decimals}
            variant="text"
          />
        )}
        <NFTPoolTag />
        {tagTooltipVisible && tagTooltip}
        <span ref={tagTargetRef}>
          <HelpIcon ml="4px" width="20px" height="20px" color="textSubtle" />
        </span>
      </InfoSection>
      
      </Flex>
      <ActionContainer>
        {showSubtitle && (
          <Text mt="4px" mb="16px" color="textSubtle">
            {`${t('Earn')} ${currentRToken.symbol} ${t('Stake').toLocaleLowerCase()} ${stakingToken.name}`}
          </Text>
        )}
        <Harvest {...nftpool} nftpool={nftpool} userDataLoaded={userDataLoaded} earningTokenPrice={earningTokenPrice} />
        <Stake nftpool={nftpool} userDataLoaded={userDataLoaded} />
      </ActionContainer>

      <ActionContent>
       
        {showSub && (
          <Button onClick={nftpool.isV3 ? onPresentSubV3 : onPresentSub} variant="secondary">
            {t('Manage')}
          </Button>
        )}
      </ActionContent>
    </StyledActionPanel>
  )
}

export default NftActionPanel
