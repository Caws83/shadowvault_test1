import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { LinkExternal, Text, Button, useModal, TimerIcon, Flex, Skeleton } from 'uikit'
import BigNumber from 'bignumber.js'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getAddress } from 'utils/addressHelpers'
import { getBscScanLink } from 'utils'
import { CommunityTag, CoreTag, DualTag } from 'components/Tags'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import contracts from 'config/constants/contracts'
// import GraphIndex, { showGraph } from 'views/graphs'
// import Wrapper from 'views/graphs/Wrapper'
import { dateTimeOptions } from 'views/Lottery/helpers'
import Balance from 'components/Balance'
import HarvestAction from './HarvestAction'
import StakedAction from './StakedAction'
import ExtendAction from './ExtendLockAction'
import Apr, { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import Liquidity, { LiquidityProps } from '../Liquidity'
// import CompoundAction from './CompundAction'
import LiquidityPrice from '../LiquidityPrice'
import ManagerModal from '../../../Modals/FarmManagerModal'
import { useAccount } from 'wagmi'
import { isMobile } from 'components/isMobile'
// import { useGetLockInfo } from '../../../hooks/useFarmManage'

export interface ActionPanelProps {
  apr: AprProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  isLocker: boolean
  expanded: boolean
}

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 1200px;
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

const Container = styled.div<{ expanded }>`
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
  width: 100%;
  flex-direction: column-reverse;
  padding: 24px;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    padding: 16px 32px;
  }
`

const StyledLinkExternal = styled(LinkExternal)`
  font-weight: 400;
`
const TagsContainer = styled.div`
  display: flex;
  align-items: center;

  > div {
    height: 18px;
    padding: 0 6px;
    font-size: 14px;
    margin-right: 4px;

    svg {
      width: 14px;
    }
  }
`

const BorderContainer = styled.div`
  padding: 16px;
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.backgroundAlt2};
`

const InfoContainer = styled.div`
  min-width: 30%;
  justify-content: space-between;
  flex-direction: column;

`

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0px;
`

const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
  details,
  apr,
  liquidity,
  userDataReady,
  isLocker,
  expanded,
}) => {
  const farm = details
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const isActive = farm.multiplier !== '0X' || (farm.host.isLocker && farm.isLocked)
  const { quoteToken, token, dual, unLockTime, lockTime, lockLength } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
  })
  const lpAddress = getAddress(farm.lpAddresses, farm.chainId)
  const bsc = getBscScanLink(lpAddress, 'address', farm.chainId)
  const swap = `/#/swap?inputCurrency=${getAddress(token.address)}&dex=${farm.dex.id}`

  const showSub = account === getAddress(contracts.farmWallet, farm.chainId)

  const [onPresentManage] = useModal(<ManagerModal farm={farm} />)

  const ValueContainer = styled.div`
    display: block;

    ${({ theme }) => theme.mediaQueries.lg} {
      display: none;
    }
  `
  const hideEarnings = !isActive && isLocker && new BigNumber(farm.userData.earnings).eq(0)

  const utString = new Date(new BigNumber(unLockTime).multipliedBy(1000).toNumber())
  const ltString = new Date(new BigNumber(lockTime).multipliedBy(1000).toNumber())
  const left = new BigNumber(unLockTime).minus(Date.now() / 1000).toNumber()

  const lockerLengthView = (
    <Flex justifyContent="space-between">
      <Text> {t('Lock Length')}:</Text>
      {lockLength ? (
        <Flex>
          <Balance
            fontSize="16px"
            value={new BigNumber(lockLength.toString()).dividedBy(86400).toNumber()}
            decimals={2}
          />
          <Text ml="4px" textTransform="lowercase">
            {t('Days')}
          </Text>
          <TimerIcon ml="4px" color="secondary" />
        </Flex>
      ) : (
        <Skeleton width="56px" height="16px" />
      )}
    </Flex>
  )
  const lockerInfoView = (
    <>
      <Flex justifyContent="space-between">
        <Text> {t(`Unlock Date`)}:</Text>
        {unLockTime ? (
          <Flex>
            <Text >
              {utString.toLocaleString(undefined, dateTimeOptions)}
            </Text>
            <TimerIcon ml="4px" color="secondary" />
          </Flex>
        ) : (
          <Skeleton width="56px" height="16px" />
        )}
      </Flex>

      <Flex justifyContent="space-between">
        <Text> {t(`Lock Started`)}:</Text>
        {unLockTime ? (
          <Flex>
             <Text >
              {ltString.toLocaleString(undefined, dateTimeOptions)}
            </Text>
            <TimerIcon ml="4px" color="secondary" />
          </Flex>
        ) : (
          <Skeleton width="56px" height="16px" />
        )}
      </Flex>
    </>
  )

  const blocksRow = (
    <Flex justifyContent="space-between">
      <Text>{t('Unlocks In')}:</Text>
      {unLockTime ? (
        <Flex>
          <Balance fontSize="16px" value={left / 86400} decimals={2} />
          <Text ml="4px"  textTransform="lowercase">
            {t('Days')}
          </Text>
          <TimerIcon ml="4px" color="secondary" />
        </Flex>
      ) : (
        <Skeleton width="56px" height="16px" />
      )}
    </Flex>
  )

  return (
    <>
  
      {isLocker && (
      
          <InfoContainer>
            <BorderContainer>
              {lockerLengthView}
              {blocksRow}
              {lockerInfoView}

              {!hideEarnings && apr.originalValue > 0 && (
                <ValueWrapper>
                  <Text>{t('APR')}</Text>
                  <Apr {...apr} />
                </ValueWrapper>
              )}
            </BorderContainer>
          </InfoContainer>
        
      )}

      <Container expanded={expanded}>
        <InfoContainer>
          {/* <StyledLinkExternal href={chart}>{t(`Bogged Chart for ${token.symbol}`)}</StyledLinkExternal> */}
          
          <ValueWrapper>
            <Text>{t('Price per Token')}</Text>
            <LiquidityPrice {...liquidity} />
          </ValueWrapper>
          <Flex alignItems="flex-end" flexDirection="column">
          {isActive && (
            <StyledLinkExternal href={`/#/add/${liquidityUrlPathParts}`}>
              {t('Get %symbol%', { symbol: lpLabel })}
            </StyledLinkExternal>
          )}
          <StyledLinkExternal href={bsc}>{t('View Contract')}</StyledLinkExternal>
          
          </Flex>
          <AddToWalletButton tokenAddress={lpAddress} tokenSymbol={lpLabel} tokenDecimals={18} variant="text" />

          <TagsContainer>
            {farm.isCommunity ? <CommunityTag /> : <CoreTag />}
            {dual ? <DualTag /> : null}
            {showSub && (
            
            <Button maxHeight="18px" onClick={onPresentManage} variant="secondary">
              Managment
            </Button>
          
            )}
          </TagsContainer>
          
        </InfoContainer>

        <ValueContainer>
          <ValueWrapper>
            <Text>{t('APR')}</Text>
            <Apr {...apr} />
          </ValueWrapper>
          <ValueWrapper>
            <Text>{t('Liquidity')}</Text>
            <Liquidity {...liquidity} />
          </ValueWrapper>
        </ValueContainer>

        <Flex flexDirection="column" width="100%" alignItems={isMobile ? "center" : "flex-end"}>
  <Flex flexDirection={isMobile ? "column" : "row"} width="100%">
    {new BigNumber(farm.userData.earnings.toString()).gt(0) && (
      <HarvestAction {...farm} userDataReady={userDataReady} farm={farm} />
    )}

    <StakedAction {...farm} userDataReady={userDataReady} lpLabel={lpLabel} displayApr={apr.value} farm={farm} />
  </Flex>
  {farm.admin === account && <ExtendAction farm={farm} />}
</Flex>

   
      </Container>
     
    </>
  )
}

export default ActionPanel
