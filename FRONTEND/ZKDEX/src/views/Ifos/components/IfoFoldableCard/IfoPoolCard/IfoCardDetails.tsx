import React, { useState } from 'react'
import { Text, Flex, Box, Skeleton, Progress, LinkExternal, useModal, Button, Image, Link } from 'uikit'
import BigNumber from 'bignumber.js'
import { PublicIfoData, WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { Ifo, PoolIds } from 'config/constants/types'
import { getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { useAccount, usePublicClient } from 'wagmi'
import ManagerModal from '../managerModal'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import CopyAddress from './CopyAddress'

export interface IfoCardDetailsProps {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
}

export interface FooterEntryProps {
  label: string
  value: string | number
}

const FooterEntry: React.FC<FooterEntryProps> = ({ label, value }) => {
  return (
    <Flex justifyContent='space-between' alignItems='center' mb='5px'>
      <Text fontSize='10px' color='textSubtle' mr='10px' bold>
        {label}
      </Text>
      {value ? (
        <Text fontSize='10px' textAlign='right'>
          {value}
        </Text>
      ) : (
        <Skeleton height={21} width={80} />
      )}
    </Flex>
  )
}

const IfoCardDetails: React.FC<IfoCardDetailsProps> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const { t } = useTranslation()
  const { softCap, hardCap } = publicIfoData
  const poolCharacteristic = publicIfoData[poolId]
  const client = usePublicClient({ chainId: ifo.dex.chainId })
  const { address: account } = useAccount()

  const pool2 = publicIfoData[poolId === 'poolUnlimited' ? 'poolBasic' : 'poolUnlimited']
  const overAllCommitted = pool2 ? poolCharacteristic.totalAmountPool.plus(pool2.totalAmountPool) : 0

  const dexName = `${ifo.dex.info.name}`
  const label = `${ifo.token.symbol}/${client.chain.nativeCurrency.symbol}`
  const isAdmin = account === publicIfoData.admin || account === getAddress(contracts.farmWallet, ifo.dex.chainId)
  const autoLiquify = new BigNumber(publicIfoData.percentToLiquidy).gt(0)
    ? `${new BigNumber(publicIfoData.percentToLiquidy).toString()} %`
    : 'Manual'
    const autoBurn = publicIfoData.autoBurn
    ? `Yes`
    : 'No'
  const lockLength = new BigNumber(publicIfoData.lockLength).gt(0)
    ? `${new BigNumber(publicIfoData.lockLength).toString()} Days`
    : 'Manual'
  const listingPrice = new BigNumber(publicIfoData.percentToLiquidy).gt(0)
    ? `${new BigNumber(publicIfoData.listingPrice).shiftedBy(-ifo.token.decimals).toFixed(2)} ${label}`
    : 'Manual'
  const salePrice = `${poolCharacteristic.offeringAmountPool.dividedBy(publicIfoData.hardCap).toFixed(2)} ${label}`
  const userCountString = `${ifo.userCount ? ifo.userCount.toString() : 'n/a'} Users Entered`

  const [onPresentManageModal] = useModal(
    <ManagerModal account={account} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />,
  )

  const maxLpTokensString = `${getBalanceNumber(poolCharacteristic.limitPerUserInLP, 18)} ${
    client.chain.nativeCurrency.symbol
  }`
  const softString = `${getBalanceNumber(softCap, 18)} ${client.chain.nativeCurrency.symbol}`
  const hardString = `${getBalanceNumber(hardCap, 18)} ${client.chain.nativeCurrency.symbol}`
  const overAllStaked = `${getBalanceNumber(new BigNumber(overAllCommitted), 18).toFixed(4)}
  ${client.chain.nativeCurrency.symbol}
  `
  const softCapPercent = new BigNumber(overAllCommitted).div(softCap).times(100).toNumber()
  const hitSoft = softCapPercent >= 100
  const hardCapPercent = new BigNumber(overAllCommitted).div(hardCap).times(100).toNumber()

  const [showMore, setShowMore] = useState(false)
  const url = new URL(window.location.href);

   const directLink = `${url.origin}/#/presale?filter=${ifo.token.name}`

  const toggleShowMore = () => {
    setShowMore((prev) => !prev)
  }

  const renderBasedOnIfoStatus = () => {
    return (
      <>
      <Flex mt="20px" >
        <Text fontSize='12px'>
          {hitSoft
            ? `Progress to Hard Cap: ${new BigNumber(hardCapPercent).toFixed(2)}%`
            : `Progress to Soft Cap: ${new BigNumber(softCapPercent).toFixed(2)}%`}
        </Text>
        </Flex>
        <Progress variant='flat' primaryStep={hitSoft ? hardCapPercent : softCapPercent} />
        <Flex mb="20px" justifyContent='space-between'>
          <Text fontSize='10px'>{overAllStaked}</Text>
          <Text fontSize='10px'>{hitSoft ? hardString : softString}</Text>
        </Flex>

        {showMore && (
          <>
            <FooterEntry label={t('Max %symbol% token entry', { symbol: client.chain.nativeCurrency.symbol })} value={maxLpTokensString} />
            <FooterEntry label={t('Rate:')} value={salePrice.toString()} />
            {new BigNumber(publicIfoData.percentToLiquidy).gt(0) && (
              <>
              <FooterEntry label={t('Listing Rate:')} value={listingPrice} />
              <FooterEntry label={t('Dex:')} value={dexName} />
              </>
            )}
            <FooterEntry label={t('AutoLiquify:')} value={autoLiquify} />
            <FooterEntry label={t('AutoBurn:')} value={autoBurn} />
            <FooterEntry label={t('Lock:')} value={lockLength} />
            <FooterEntry label={t('Investors:')} value={userCountString} />
            <Flex mt='20px' mb='20px' flexDirection='row' justifyContent='center'>
              <Link external href={publicIfoData.telegram} mr={"20px"}>
                <img src={`/images/home/icons/telegram.png`} alt={`TG`} className="desktop-icon" style={{ width: `32px` }} />
              </Link>
              <Link external href={publicIfoData.twitter} mr={"20px"}>
                <img src={`/images/home/icons/x.png`} alt={`X`} className="desktop-icon" style={{ width: `32px` }} />
              </Link>
              <Link external href={publicIfoData.website} mr={"20px"}>
                <img src={`/images/home/icons/web.png`} alt={`Web`} className="desktop-icon" style={{ width: `32px` }} />
              </Link>
              
           
              <Flex flexDirection='column' justifyContent='flex-start'></Flex>

              {isAdmin && (
                <Flex justifyContent='center'>
                  <Button variant='primary' onClick={onPresentManageModal}>
                    Manager Menu
                  </Button>
                </Flex>
              )}
            </Flex>
            <CopyAddress  account={directLink} />
            {ifo.address && (
          <Flex mb="2px" justifyContent="flex-end">
            <LinkExternal href={`${client?.chain?.blockExplorers?.default?.url}/address/${getAddress(ifo.address, ifo.dex.chainId)}`} bold={false} small>
              {t('View Contract')}
            </LinkExternal>
          </Flex>
        )}
          </>
        )}
  <Flex justifyContent='center'>
        <Link onClick={toggleShowMore} mt="10px" style={{cursor:"pointer", textDecoration: 'none' }}>
          {showMore ? t('Show Less') : t('Show More')}
        </Link>
        </Flex>
      </>
    )
  }

  return <Box>{renderBasedOnIfoStatus()}</Box>
}

export default IfoCardDetails
