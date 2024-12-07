import React from 'react'
import { Text, Flex, Box, Skeleton, Progress, LinkExternal } from 'uikit'
import BigNumber from 'bignumber.js'
import { PublicIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { Ifo, PoolIds } from 'config/constants/types'
import { getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { SkeletonCardDetails } from './Skeletons'
import { usePublicClient } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import CopyAddress from '../../CopyAddress'

export interface IfoCardDetailsProps {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
}

export interface FooterEntryProps {
  label: string
  value: string | number
}

const FooterEntry: React.FC<FooterEntryProps> = ({ label, value }) => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text small color="textSubtle">
        {label}
      </Text>
      {value ? (
        <Text small textAlign="right">
          {value}
        </Text>
      ) : (
        <Skeleton height={21} width={80} />
      )}
    </Flex>
  )
}

const IfoCardDetails: React.FC<IfoCardDetailsProps> = ({ poolId, ifo, publicIfoData }) => {
  const { t } = useTranslation()
  const { status, currencyPriceInUSD, softCap, hardCap, fgFee } = publicIfoData
  const poolCharacteristic = publicIfoData[poolId]
  const client = usePublicClient({chainId: ifo.dex.chainId})

  const pool2 = publicIfoData[poolId === 'poolUnlimited' ? 'poolBasic' : 'poolUnlimited']
  const overAllCommitted = pool2 ? poolCharacteristic.totalAmountPool.plus(pool2.totalAmountPool) : 0
  const totalOffering = pool2 ? poolCharacteristic.offeringAmountPool.plus(pool2.offeringAmountPool).toFixed(4) : 0

  const label = `${ifo.token.symbol} per ${client.chain.nativeCurrency.symbol}`

  const autoLiquify = new BigNumber(publicIfoData.percentToLiquidy).gt(0)
  const percentToLiquifyString = `${new BigNumber(publicIfoData.percentToLiquidy).toString()} %`
  const lockLength = `${new BigNumber(publicIfoData.lockLength).toString()} Days`
  const listingPrice = `${new BigNumber(publicIfoData.listingPrice).shiftedBy(-ifo.token.decimals).toFixed(2)} ${label}`
  const salePrice = `${poolCharacteristic.offeringAmountPool.dividedBy(publicIfoData.hardCap).toFixed(2)} ${label}`
  const userCountString = `${ifo.userCount? ifo.userCount.toString() : "n/a"} Users Entered`
  const claimCountString = `${ifo.claimCount ? ifo.claimCount.toString() : "n/a"} Users Claimed`
 
 
  /* Format start */
  const maxLpTokens = poolCharacteristic.limitPerUserInLP
  const maxLpTokensString = `${getBalanceNumber(poolCharacteristic.limitPerUserInLP, 18)} ${client.chain.nativeCurrency.symbol}`
  const taxRate = `${poolCharacteristic.taxRate}%`

  // actually raised info
  const offeringAmount = getBalanceNumber(poolCharacteristic.offeringAmountPool, ifo.token.decimals)

  // numbers to reach
  const totalToRaise = getBalanceNumber(poolCharacteristic.raisingAmountPool, 18)

  // hard and softcap displays

  const feeString = `${fgFee.dividedBy(10)}%`

  const CapsString = `${getBalanceNumber(softCap, 18)} ${client.chain.nativeCurrency.symbol} / ${getBalanceNumber(hardCap, 18)} ${client.chain.nativeCurrency.symbol}`
  const overAllStaked = `${getBalanceNumber(new BigNumber(overAllCommitted), 18).toFixed(4)}
  ${client.chain.nativeCurrency.symbol}
  `
  const totalOfferinngString = `${getBalanceNumber(new BigNumber(totalOffering), ifo.token.decimals)} ${
    ifo.token.symbol
  }`

  // currecnt token price
  const TargetTokenPriceUSD = `$${formatNumber(
    currencyPriceInUSD.times(totalToRaise / offeringAmount).toNumber(),
    ifo.priceDecimals,
    ifo.priceDecimals,
  )}`
  const TargetTokenListPriceUSD = `$${formatNumber(
    currencyPriceInUSD.dividedBy(new BigNumber(publicIfoData.listingPrice).shiftedBy(-ifo.token.decimals)).toNumber(),
    ifo.priceDecimals,
    ifo.priceDecimals,
  )}`
  const softCapPercent = new BigNumber(overAllCommitted).div(softCap).times(100).toNumber()

  const hitSoft = softCapPercent >= 100

  const hardCapPercent = new BigNumber(overAllCommitted).div(hardCap).times(100).toNumber()
  /* Format end */


  const renderBasedOnIfoStatus = () => {
    if (status === 'coming_soon') {
      return (
        <>
         
          {maxLpTokens.gt(0) && <FooterEntry label={t('Max %symbol%: ', {symbol: client.chain.nativeCurrency.symbol})} value={maxLpTokensString} />}

          <Text bold fontSize="12px">
            {hitSoft
              ? `Progress to Hard Cap: ${new BigNumber(hardCapPercent).toFixed(4)}%`
              : `Progress to Soft Cap: ${new BigNumber(softCapPercent).toFixed(4)}%`}
          </Text>
          <Progress variant="flat" primaryStep={hitSoft ? hardCapPercent : softCapPercent} />

          <FooterEntry label={t('Soft/Hard:')} value={CapsString} />
          <FooterEntry label={t('Staked:')} value={overAllStaked} />
          <FooterEntry label={t('Offering:')} value={totalOfferinngString} />
          <FooterEntry label={t('Sale Price:')} value={salePrice.toString()} />
          <FooterEntry label={t('Sale $:')} value={TargetTokenPriceUSD} />

          {autoLiquify &&
          <>
            <FooterEntry label={t('listing Price:')} value={listingPrice} />
            <FooterEntry label={t('Listing $:')} value={TargetTokenListPriceUSD} />
            <FooterEntry label={t('lockLength:')} value={lockLength} />
            <FooterEntry label={t('Percent to Liquify:')} value={percentToLiquifyString} />
 
          </>
          }
          <FooterEntry label={t('AutoLiquify:')} value={autoLiquify.toString()} />
          <FooterEntry label={t('Fee:')} value={feeString} />
          <CopyAddress account={getAddress(ifo.address, ifo.dex.chainId)} mb="8px" />
          {ifo.token.projectLink !== "" &&
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={ifo.token.projectLink} bold={false}>
              {t('View Project Site')}
            </LinkExternal>
          </Flex>
            }
        </>
      )
    }
    if (status === 'live') {
      return (
        <>
          
          {maxLpTokens.gt(0) && <FooterEntry label={t('Max %symbol% token entry', { symbol: client.chain.nativeCurrency.symbol})} value={maxLpTokensString} />}
          {poolCharacteristic.taxRate > 0 && <FooterEntry label={t('Additional fee:')} value={taxRate} />}
          <Text bold fontSize="12px">
            {hitSoft
              ? `Progress to Hard Cap: ${new BigNumber(hardCapPercent).toFixed(4)}%`
              : `Progress to Soft Cap: ${new BigNumber(softCapPercent).toFixed(4)}%`}
          </Text>
          <Progress variant="flat" primaryStep={hitSoft ? hardCapPercent : softCapPercent} />

          <FooterEntry label={t('Soft/Hard:')} value={CapsString} />
          <FooterEntry label={t('Staked:')} value={overAllStaked} />
          <FooterEntry label={t('Offering:')} value={totalOfferinngString} />
          <FooterEntry label={t('Sale Price:')} value={salePrice.toString()} />
          <FooterEntry label={t('Sale $:')} value={TargetTokenPriceUSD} />

          {autoLiquify &&
          <>
            <FooterEntry label={t('listing Price:')} value={listingPrice} />
            <FooterEntry label={t('Listing $:')} value={TargetTokenListPriceUSD} />
            <FooterEntry label={t('lockLength:')} value={lockLength} />
            <FooterEntry label={t('Percent to Liquify:')} value={percentToLiquifyString} />
           
          </>
          }
          <FooterEntry label={t('AutoLiquify:')} value={autoLiquify.toString()} />
          <FooterEntry label={t('Fee:')} value={feeString} />
          <FooterEntry label={t('Investors:')} value={userCountString} />
          <CopyAddress account={getAddress(ifo.address, ifo.dex.chainId)} mb="8px" />
          {ifo.token.projectLink !== "" &&
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={ifo.token.projectLink} bold={false}>
              {t('View Project Site')}
            </LinkExternal>
          </Flex>
            }
        </>
      )
    }
    if (status === 'finished') {
      return (
        <>
          
          {maxLpTokens.gt(0) && <FooterEntry label={t('Max %symbol% token entry', {symbol: client.chain.nativeCurrency.symbol})} value={maxLpTokensString} />}
          {poolCharacteristic.taxRate > 0 && <FooterEntry label={t('Additional fee:')} value={taxRate} />}

          <Text bold fontSize="12px">
            {hitSoft
              ? `Progress to Hard Cap: ${new BigNumber(hardCapPercent).toFixed(4)}%`
              : `Progress to Soft Cap: ${new BigNumber(softCapPercent).toFixed(4)}%`}
          </Text>
          <Progress variant="flat" primaryStep={hitSoft ? hardCapPercent : softCapPercent} />

          <FooterEntry label={t('Soft/Hard:')} value={CapsString} />
          <FooterEntry label={t('Staked:')} value={overAllStaked} />
          <FooterEntry label={t('Offering:')} value={totalOfferinngString} />
          <FooterEntry label={t('Sale Price:')} value={salePrice.toString()} />
          <FooterEntry label={t('Sale $:')} value={TargetTokenPriceUSD} />

          {autoLiquify &&
          <>
            <FooterEntry label={t('listing Price:')} value={listingPrice} />
            <FooterEntry label={t('Listing $:')} value={TargetTokenListPriceUSD} />
            <FooterEntry label={t('lockLength:')} value={lockLength} />
            <FooterEntry label={t('Percent to Liquify:')} value={percentToLiquifyString} />
 
          </>
          }
          <FooterEntry label={t('AutoLiquify:')} value={autoLiquify.toString()} />
          <FooterEntry label={t('Fee:')} value={feeString} />
          <FooterEntry label={t('Investors:')} value={userCountString} />
          <FooterEntry label={t('Investors:')} value={claimCountString} />
          <CopyAddress account={getAddress(ifo.address, ifo.dex.chainId)} mb="8px" />
          {ifo.token.projectLink !== "" &&
          <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <LinkExternal href={ifo.token.projectLink} bold={false}>
              {t('View Project Site')}
            </LinkExternal>
          </Flex>
            }
        </>
      )
    }
    return <SkeletonCardDetails />
  }

  return <Box paddingTop="24px">{renderBasedOnIfoStatus()}</Box>
}

export default IfoCardDetails
