import React from 'react'
// import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Flex, Skeleton, Text, LinkExternal, Button, useModal } from 'uikit'
import { BASE_BSC_SCAN_URLS } from 'config'
import { NFTLaunch } from 'state/types'
import useTokenBalance, { FetchStatus, useGetBnbBalance } from 'hooks/useTokenBalance'
import { getAddress } from 'utils/addressHelpers'
import Balance from 'components/Balance'
import { getBalanceNumber } from 'utils/formatBalance'
import contracts from 'config/constants/contracts'
import { BigNumber } from 'bignumber.js'
import ManagerModal from '../../../modals/NFTManagerModal'
import { useAccount, usePublicClient } from 'wagmi'

interface ExpandedFooterProps {
  launch: NFTLaunch
  account: string
}

const ExpandedWrapper = styled(Flex)`
  svg {
    height: 14px;
    width: 14px;
  }
`

const ExpandedFooter: React.FC<ExpandedFooterProps> = ({ launch, account }) => {
  const { t } = useTranslation()
  const { maxSupply, currentSupply, payToken, costToken, costBNB, contractAddress, owner, subOp } = launch
  const tokenBalance = useTokenBalance(getAddress(payToken.address), launch.chainId)
  const bnbBalance = useGetBnbBalance(launch.chainId)
  const ContractAddress = getAddress(contractAddress, launch.chainId)
  const client = usePublicClient({chainId: launch.chainId})
  const symbol = client.chain.nativeCurrency.symbol
  const showSub =
    account === getAddress(contracts.farmWallet, launch.chainId) || account === owner.toString() || account === subOp.toString()

  const [onPresentManage] = useModal(<ManagerModal launch={launch} account={account} />)

  return (
    <ExpandedWrapper flexDirection="column">
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text>Total Minted:</Text>
        {currentSupply === undefined || maxSupply === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Text>
            {currentSupply} / {maxSupply}
          </Text>
        )}
      </Flex>
      {new BigNumber(costToken.toString()).gt(0) && (
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text>Token Balance:</Text>
          {tokenBalance.fetchStatus !== FetchStatus.SUCCESS ? (
            <Skeleton width="80px" height="16px" />
          ) : (
            <Balance
              small
              value={getBalanceNumber(new BigNumber(tokenBalance.balance.toString()), payToken.decimals)}
              decimals={4}
              unit={` ${payToken.symbol}`}
            />
          )}
        </Flex>
      )}
      {new BigNumber(costBNB.toString()).gt(0) && (
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text>{`${symbol} Balance:`}</Text>
          {bnbBalance.fetchStatus !== FetchStatus.SUCCESS ? (
            <Skeleton width="80px" height="16px" />
          ) : (
            <Balance
              small
              value={getBalanceNumber(new BigNumber(bnbBalance.balance.toString()))}
              decimals={4}
              unit={` ${symbol}`}
            />
          )}
        </Flex>
      )}
      {ContractAddress && (
        <Flex mb="2px" justifyContent="flex-end">
          <LinkExternal href={`${BASE_BSC_SCAN_URLS[launch.chainId]}/address/${ContractAddress}`} bold={false} small>
            {t('View Contract')}
          </LinkExternal>
        </Flex>
      )}
      {showSub && (
        <Button width="100%" onClick={onPresentManage} variant="secondary">
          Managment
        </Button>
      )}
    </ExpandedWrapper>
  )
}

export default React.memo(ExpandedFooter)
