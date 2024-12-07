import React from 'react'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { Text, Flex, LinkExternal, Skeleton, TimerIcon, useModal, Button } from 'uikit'
import { Farm } from 'state/types'
import { BigNumber } from 'bignumber.js'
import Balance from 'components/Balance'
import { dateTimeOptions } from 'views/Lottery/helpers'
import { getAddress } from 'utils/addressHelpers'
import ManagerModal from 'views/Farms/Modals/FarmManagerModal'
import contracts from 'config/constants/contracts'


export interface ExpandableSectionProps {
  bscScanAddress?: string
  removed?: boolean
  totalValueFormatted?: string
  lpLabel?: string
  addLiquidityUrl?: string
  removeLiquidityUrl?: string
  pricePerToken?: string
  farm: Farm
  account?: `0x${string}` 
}

const Wrapper = styled.div`
  margin-top: 20px;
`

const StyledLinkExternal = styled(LinkExternal)`
  font-weight: 400;
`

const DetailsSection: React.FC<ExpandableSectionProps> = ({
  bscScanAddress,
  removed,
  totalValueFormatted,
  lpLabel,
  addLiquidityUrl,
  removeLiquidityUrl,
  pricePerToken,
  farm,
  account
}) => {
  const { t } = useTranslation()
  const { unLockTime, lockTime, lockLength } = farm
  const { isLocker } = farm.host
  const utString = new Date(new BigNumber(unLockTime).multipliedBy(1000).toNumber())
  const ltString = new Date(new BigNumber(lockTime).multipliedBy(1000).toNumber())
  const left = new BigNumber(unLockTime).minus(Date.now() / 1000).toNumber()

  const showSub = account === getAddress(contracts.farmWallet, farm.chainId)
  const [onPresentManage] = useModal(<ManagerModal farm={farm} />)


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
            {utString.toLocaleString(undefined, dateTimeOptions)}
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
            {ltString.toLocaleString(undefined, dateTimeOptions)}
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

  return (
    <Wrapper>
       {isLocker && ( 
        <Flex flexDirection="column" mb="8px" >
            {lockerLengthView}
            {blocksRow}
            {lockerInfoView}
        </Flex>
        )}
      <Flex justifyContent="space-between">
        <Text>{t('Total Liquidity')}:</Text>
        {totalValueFormatted ? <Text>{totalValueFormatted}</Text> : <Skeleton width={75} height={25} />}
      </Flex>
      <Flex justifyContent="space-between">
        <Text>{t('Price Per Token')}:</Text>
        {pricePerToken ? <Text>{pricePerToken}</Text> : <Skeleton width={75} height={25} />}
      </Flex>
      <Flex alignItems="flex-end" flexDirection="column">
        {!removed && (
          <StyledLinkExternal href={addLiquidityUrl}>{t('Get %symbol%', { symbol: lpLabel })}</StyledLinkExternal>
        )}
        <StyledLinkExternal href={removeLiquidityUrl}>{t('Remove %symbol%', { symbol: lpLabel })}</StyledLinkExternal>
        <StyledLinkExternal href={bscScanAddress}>{t('View Contract')}</StyledLinkExternal>
        {showSub && (
          
          <Button width="100%" maxHeight="30px" onClick={onPresentManage} variant="secondary">
            Managment
          </Button>
    
    )}
      </Flex>
      
    </Wrapper>
  )
}

export default DetailsSection
