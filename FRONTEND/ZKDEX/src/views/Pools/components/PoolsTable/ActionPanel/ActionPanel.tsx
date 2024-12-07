import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Box, Button, Flex, Link, HelpIcon, LinkExternal, Skeleton, Text, TimerIcon, useModal, useTooltip } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
import { useCakeVault } from 'state/pools/hooks'
import BigNumber from 'bignumber.js'
import { Pool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { CompoundingPoolTag, ManualPoolTag, RenewPoolTag } from 'components/Tags'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { PoolCategory } from 'config/constants/types'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { convertSharesToCake, getPoolBlockInfo } from 'views/Pools/helpers'
// import GraphIndex, { showGraph } from 'views/graphs'
import contracts from 'config/constants/contracts'
// import Wrapper from 'views/graphs/Wrapper'
import Harvest from './Harvest'
import Stake from './Stake'
import Apr from '../Apr'
import AutoHarvest from './AutoHarvest'
import ExtraCollectModal from '../../Modals/ExtraCollectModal'
import SubAdminModal from '../../Modals/SubAdminModal'
import SubAdminModalV3 from '../../Modals/SubAdminModalV3'
import ManagerModal from '../../Modals/singleManagerModal'
import { ActionContent } from './styles'
import { useSubAdmin } from '../../Modals/hooks/SubCalls'
import { dexs } from 'config/constants/dex'

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 1200px;
  }
`
const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 25px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-top: 16px;
  }

  > div {
    height: 24px;
    padding: 0 6px;
    font-size: 14px;
    margin-right: 4px;

    svg {
      width: 14px;
    }
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 1200px;
  }
  to {
    max-height: 0px;
  }
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
    padding: 12px 26px;
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

interface ActionPanelProps {
  account: string
  pool: Pool
  userDataLoaded: boolean
  expanded: boolean
  breakpoints: MediaBreakpoints
  currentBlock: number
}

const InfoSection = styled(Box)`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  padding: 8px 8px;
  min-width: 35%;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding: 0;
    flex-basis: 230px;
  }
`

const ActionPanel: React.FC<ActionPanelProps> = ({
  account,
  pool,
  userDataLoaded,
  expanded,
  breakpoints,
  currentBlock,
}) => {
  const {
    poolCategory,
    stakingToken,
    earningToken,
    totalStaked,
    stakingLimit,
    contractAddress,
    userData,
    isAutoVault,
    isRenew,
  } = pool
  const { t } = useTranslation()
  const poolContractAddress = getAddress(contractAddress, pool.chainId)
  const cakeVaultContractAddress = getCakeVaultAddress()
  // const { currentBlock } = useBlock()
  const { isXs, isSm, isMd } = breakpoints
  const showSubtitle = (isXs || isSm) && poolCategory === PoolCategory.SINGLE
  let operator = ''
  const { onOp } = useSubAdmin(pool)
  if (getAddress(pool.contractAddress, pool.chainId) !== getAddress(pool.host.masterChef, pool.chainId)) {
    operator = onOp()
  }

  const [onPresentWithdrawl] = useModal(<ExtraCollectModal pool={pool} />)

  const isSingle = poolCategory === PoolCategory.SINGLE
  const [onPresentSub] = useModal(<SubAdminModal pool={pool} currentBlock={currentBlock} />)
  const [onPresentSubV3] = useModal(<SubAdminModalV3 pool={pool} currentBlock={currentBlock} />)
  const [onPresentSingle] = useModal(<ManagerModal pool={pool} />)

  const showSub = account === getAddress(contracts.farmWallet, pool.chainId) || account === operator
  const showAdmin = account === getAddress(contracts.farmWallet, pool.chainId)

  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  const tokenAddress = earningToken.address ? getAddress(earningToken.address, pool.chainId) : ''

  const {
    totalCakeInVault,
    userData: { userShares },
    fees: { performanceFee },
    pricePerFullShare,
  } = useCakeVault()

  const stakingTokenBalance = userData?.stakingTokenBalance
    ? new BigNumber(userData.stakingTokenBalance.toString())
    : BIG_ZERO
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance.toString()) : BIG_ZERO
  const { cakeAsBigNumber } = convertSharesToCake(new BigNumber(userShares), new BigNumber(pricePerFullShare))
  const poolStakingTokenBalance = isAutoVault
    ? cakeAsBigNumber.plus(stakingTokenBalance)
    : stakedBalance.plus(stakingTokenBalance)

  const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  const getTotalStakedBalance = () => {
    if (isAutoVault) {
      return getBalanceNumber(new BigNumber(totalCakeInVault.toString()), stakingToken.decimals)
    }
    return getBalanceNumber(new BigNumber(totalStaked.toString()), stakingToken.decimals)
  }

  const {
    targetRef: totalStakedTargetRef,
    tooltip: totalStakedTooltip,
    tooltipVisible: totalStakedTooltipVisible,
  } = useTooltip(t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.symbol }), {
    placement: 'bottom',
  })

  const manualTooltipText = t('You must harvest and compound your earnings from this pool manually.')
  const autoTooltipText = t(
    'Any funds you stake in this pool will be automagically harvested and restaked (compounded) for you.',
  )
  
  const {
    targetRef: tagTargetRef,
    tooltip: tagTooltip,
    tooltipVisible: tagTooltipVisible,
  } = useTooltip(isAutoVault ? autoTooltipText : manualTooltipText, {
    placement: 'bottom-start',
  })

  const maxStakeRow =
  new BigNumber(stakingLimit).gt(0) ? (
      <Flex mb="8px" justifyContent="space-between">
        <Text>{t('Max. stake per user')}:</Text>
        <Text>{`${getFullDisplayBalance(new BigNumber(stakingLimit.toString()), stakingToken.decimals, 0)} ${
          stakingToken.symbol
        }`}</Text>
      </Flex>
    ) : null

  const blocksRow =
    blocksRemaining || blocksUntilStart ? (
      <Flex mb="8px" justifyContent="space-between">
        <Text>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</Text>
        <Flex>
          <Balance fontSize="16px" value={blocksToDisplay / 86400} decimals={2} color="primary" />
          <Text ml="4px" color="primary" textTransform="lowercase">
            {t('Days')}
          </Text>
          <TimerIcon ml="4px" color="primary" />
        </Flex>
      </Flex>
    ) : (
      <Skeleton width="56px" height="16px" />
    )

  const aprRow = (
    <Flex justifyContent="space-between" alignItems="center" mb="8px">
      <Text>{isAutoVault ? t('APY') : t('APR')}:</Text>
      <Apr
        pool={pool}
        showIcon
        stakedBalance={poolStakingTokenBalance}
        performanceFee={isAutoVault ? performanceFeeAsDecimal : 0}
      />
    </Flex>
  )

  const totalStakedRow = (
    <Flex justifyContent="space-between" alignItems="center" mb="8px">
      <Text fontSize="12px" maxWidth={['50px', '100%']}>{t('TOTAL STAKED')}:</Text>
      <Flex alignItems="center">
        {totalStaked && new BigNumber(totalStaked).gte(0) ? (
          <>
            <Balance fontSize="16px" value={getTotalStakedBalance()} decimals={0} unit={` ${stakingToken.symbol}`} />
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
      if (dexs[key] === pool.dex) {
        return key;
  }}}

  /*
  const t0 = pool.earningToken.baseAddress
    ? getAddress(pool.earningToken.baseAddress)
    : getAddress(pool.earningToken.address)
  const t1 = pool.stakingToken.baseAddress
    ? getAddress(pool.stakingToken.baseAddress)
    : getAddress(pool.stakingToken.address)
*/

  return (
    <>
      {/*
      <Wrapper>
        {(showGraph(t0) || showGraph(t1)) && (
          <GraphIndex
            t0={showGraph(t0) ? t0 : null}
            s0={pool.earningToken.symbol}
            t02={showGraph(t1) ? t1 : null}
            s02={pool.stakingToken.symbol}
            dex={pool.dex}
            height="200px"
            width="100%"
          />
        )}
      </Wrapper>
        */}
      <StyledActionPanel expanded={expanded}>
        <InfoSection>
          {maxStakeRow}
          {(isXs || isSm) && aprRow}
          {(isXs || isSm || isMd) && totalStakedRow}
          {shouldShowBlockCountdown && blocksRow}

          <Flex flexDirection="column">
           <Flex alignItems="flex-end" flexDirection="column">
              <LinkExternal href={`/#/swap?inputCurrency=${getAddress(earningToken.address, pool.chainId)}&dex=${getDexKey()}`} bold={false}>
                {t('Swap Reward Token')}
              </LinkExternal>
          
            {pool.earningToken.projectLink !== "" &&
<>
            <Flex mt='20px' mb='20px' flexDirection='row' justifyContent='center'>
            <Link external href={"publicIfoData.telegram"} mr={"20px"}>
              <img src={`/images/home/icons/telegram.png`} alt={`TG`} className="desktop-icon" style={{ width: `32px` }} />
            </Link>
            <Link external href={"publicIfoData.twitter"} mr={"20px"}>
              <img src={`/images/home/icons/x.png`} alt={`X`} className="desktop-icon" style={{ width: `32px` }} />
            </Link>
            <Link external href={pool.earningToken.projectLink} mr={"20px"}>
              <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `32px` }} />
            </Link>
           
            </Flex>
            </>
            }
            </Flex>
            {showAdmin && !isSingle && (
              <Flex alignItems={'center'} justifyItems={'center'}>
    <Button onClick={onPresentWithdrawl} maxHeight="30px" variant="secondary">
      {t('Farm Wallet')}
    </Button>

    </Flex>
  )}
  {showSub && !isSingle && (
    <Flex alignItems={'center'} justifyItems={'center'}>
    <Button onClick={pool.isV3 ? onPresentSubV3 : onPresentSub} maxHeight="30px" variant="secondary">
      {t('Manage')}
    </Button>
    </Flex>
  )}
  {showAdmin && isSingle && (
    <Flex alignItems={'center'} justifyItems={'center'}>
    <Button onClick={onPresentSingle} maxHeight="30px" variant="secondary">
      {t('Manage')}
    </Button>
    </Flex>

  )}
            {account && tokenAddress && (
              <Flex alignItems={'center'} justifyItems={'center'}>
              <AddToWalletButton
                tokenAddress={tokenAddress}
                tokenSymbol={earningToken.symbol}
                tokenDecimals={earningToken.decimals}
                variant="text"
              />
    </Flex>

            )}
          </Flex>

          {isAutoVault ? <CompoundingPoolTag /> : <ManualPoolTag />}
          {tagTooltipVisible && tagTooltip}
          <span ref={tagTargetRef}>
            <HelpIcon ml="4px" width="20px" height="20px" color="textSubtle" />
          </span>

          {isRenew ? <RenewPoolTag /> : <></>}
     
        </InfoSection>
        
        <ActionContainer>
          {showSubtitle && (
            <Text mt="4px" mb="16px" color="textSubtle">
              {isAutoVault
                ? t('Automatic restaking')
                : `${t('Earn')} ${earningToken.symbol} ${t('Stake').toLocaleLowerCase()} ${stakingToken.symbol}`}
            </Text>
          )}
          {pool.isAutoVault ? (
            <AutoHarvest {...pool} userDataLoaded={userDataLoaded} />
          ) : (
            <Harvest {...pool} pool={pool} userDataLoaded={userDataLoaded} />
          )}
          <Stake pool={pool} userDataLoaded={userDataLoaded} />
        </ActionContainer>

       

      </StyledActionPanel>
    </>
  )
}

export default ActionPanel
