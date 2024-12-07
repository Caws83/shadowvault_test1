import React from 'react'
// import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useTranslation } from 'contexts/Localization'
import { Flex, Text, TooltipText, LinkExternal, TimerIcon, Skeleton, useTooltip, Link, HelpIcon, useModal, Button } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
// import { useBlock } from 'state/block/hooks'
import { PoolCategory } from 'config/constants/types'
import { useCakeVault } from 'state/pools/hooks'
import { Pool } from 'state/types'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
import { getBscScanLink } from 'utils'
import Balance from 'components/Balance'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import BigNumber from 'bignumber.js'
import { dexs } from 'config/constants/dex'
import SubAdminModal from '../../Modals/SubAdminModal'
import SubAdminModalV3 from '../../Modals/SubAdminModalV3'
import ManagerModal from '../../Modals/singleManagerModal'
import { useSubAdmin } from '../../Modals/hooks/SubCalls'
import contracts from 'config/constants/contracts'
import { ActionContent } from '../../PoolsTable/ActionPanel/styles'
import ExtraCollectModal from '../../Modals/ExtraCollectModal'

interface ExpandedFooterProps {
  pool: Pool
  account: string
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`




const ExpandedFooter: React.FC<ExpandedFooterProps> = ({ pool, account }) => {
  const { t } = useTranslation()
  // const { currentBlock } = useBlock()
  const currentBlock = Date.now() / 1000
  const {
    totalCakeInVault,
    fees: { performanceFee },
  } = useCakeVault()

  const {
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    contractAddress,
    /* sousId, */
    isAutoVault,
    poolCategory,
  } = pool
  
  const getDexKey = () => {
    for (const key in dexs) {
      if (dexs[key] === pool.dex) {
        return key;
  }}}
  let operator = ''
  const { onOp } = useSubAdmin(pool)
  if (getAddress(pool.contractAddress, pool.chainId) !== getAddress(pool.host.masterChef, pool.chainId)) {
    operator = onOp()
  }

  const isSingle = poolCategory === PoolCategory.SINGLE
  const [onPresentWithdrawl] = useModal(<ExtraCollectModal pool={pool} />)
  const [onPresentSub] = useModal(<SubAdminModal pool={pool} currentBlock={currentBlock} />)
  const [onPresentSubV3] = useModal(<SubAdminModalV3 pool={pool} currentBlock={currentBlock} />)
  const [onPresentSingle] = useModal(<ManagerModal pool={pool} />)

  const showSub = account === getAddress(contracts.farmWallet, pool.chainId) || account === operator
  const showAdmin = account === getAddress(contracts.farmWallet, pool.chainId)

  const tokenAddress = earningToken.address ? getAddress(earningToken.address) : ''
  const poolContractAddress = getAddress(contractAddress, pool.chainId)
  const cakeVaultContractAddress = getCakeVaultAddress()

  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(t('Subtracted automatically from each yield harvest.'), {
    placement: 'bottom-start',
  })

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

  return (
    <ExpandedWrapper flexDirection="column">
      <Flex mb="2px" justifyContent="space-between" alignItems="center">
      
      <Text fontSize="12px" maxWidth={['50px', '100%']}>{t('TOTAL STAKED')}:</Text>
        <Flex alignItems="flex-start">
          {totalStaked && new BigNumber(totalStaked).gt(0) ? (
            <>
              <Balance small value={getTotalStakedBalance()} decimals={0} unit={` ${stakingToken.symbol}`} />
              <span ref={totalStakedTargetRef}>
                <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
              </span>
            </>
          ) : (
            <Skeleton width="90px" height="21px" />
          )}
          {totalStakedTooltipVisible && totalStakedTooltip}
        </Flex>
      </Flex>
      {stakingLimit && new BigNumber(stakingLimit).gt(0) && (
        <Flex mb="2px" justifyContent="space-between">
          <Text small>{t('Max. stake per user')}:</Text>
          <Text small>{`${getFullDisplayBalance(new BigNumber(stakingLimit.toString()), stakingToken.decimals, 0)} ${
            stakingToken.symbol
          }`}</Text>
        </Flex>
      )}

      {shouldShowBlockCountdown && (
        <Flex mb="2px" justifyContent="space-between" alignItems="center">
          <Text small>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</Text>
          {blocksRemaining || blocksUntilStart ? (
            <Flex alignItems="center">
                <Balance small value={blocksToDisplay / 86400} decimals={2} color="primary" />
                <Text small ml="4px" color="primary" textTransform="lowercase">
                  {t('Days')}
                </Text>
            </Flex>
          ) : (
            <Skeleton width="54px" height="21px" />
          )}
        </Flex>
      )}
      {isAutoVault && (
        <Flex mb="2px" justifyContent="space-between" alignItems="center">
          {tooltipVisible && tooltip}
          <TooltipText ref={targetRef} small>
            {t('Performance Fee')}
          </TooltipText>
          <Flex alignItems="center">
            <Text ml="4px" small>
              {performanceFee / 100}%
            </Text>
          </Flex>
        </Flex>
      )}
    
         

            <Flex mt='20px' mb='20px' flexDirection='row' justifyContent='space-between' alignItems="centre">
          
           

            <Link href={`/#/swap?outputCurrency=${getAddress(stakingToken.address, pool.chainId)}&dex=${getDexKey()}`} mr={"20px"}>
              <Button variant="text">{`Buy ${stakingToken.symbol}`}</Button>
            </Link>

            <Link external href={earningToken.projectLink} mr={"20px"}>
              <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `32px` }} />
            </Link>

            <Link href={`/#/swap?inputCurrency=${getAddress(earningToken.address, pool.chainId)}&dex=${getDexKey()}`} mr={"20px"}>
            <Button variant="text">{`Sell ${earningToken.symbol}`}</Button>
            </Link>
           
        
  
       
       </Flex>
      {account && tokenAddress && (
      <Flex alignItems={'center'} justifyItems={'center'} mt="20px" mb="20px">
        <AddToWalletButton
          tokenAddress={tokenAddress}
          tokenSymbol={earningToken.symbol}
          tokenDecimals={earningToken.decimals}
          variant="text"
        />
        </Flex>
      )}

          {showAdmin && !isSingle && (
            <Flex alignItems={'center'} justifyItems={'center'} mt="10px" mb="10px">
            <Button onClick={onPresentWithdrawl}>
              {t('Farm Wallet')}
            </Button>
            </Flex>
          )}

          {showSub && !isSingle && (
            <Flex alignItems={'center'} justifyItems={'center'} mt="10px" mb="10px">
            <Button onClick={pool.isV3 ? onPresentSubV3 : onPresentSub} >
              {t('Manage')}
            </Button>
            </Flex>
          )}

          {showAdmin && isSingle && (
            <Flex alignItems={'center'} justifyItems={'center'} mt="10px" mb="10px">
            <Button onClick={onPresentSingle} maxHeight="30px" variant="secondary" width="50%">
              {t('Manage')}
            </Button>
            </Flex>
          )}
    
    </ExpandedWrapper>
  )
}

export default React.memo(ExpandedFooter)
