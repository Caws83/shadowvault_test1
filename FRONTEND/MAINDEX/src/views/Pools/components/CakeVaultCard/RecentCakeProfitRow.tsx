import React from 'react'
import { Flex, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useHostPricesBusd } from 'state/farms/hooks'
import { useCakeVault } from 'state/pools/hooks'
import { getCakeVaultEarnings } from 'views/Pools/helpers'
import tokens from 'config/constants/tokens'
import RecentCakeProfitBalance from './RecentCakeProfitBalance'
import { useAccount } from 'wagmi'
import { BigNumber } from 'bignumber.js'

const RecentCakeProfitCountdownRow = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const {
    pricePerFullShare,
    userData: { cakeAtLastUserAction, userShares, lastUserActionTime },
  } = useCakeVault()
  const frtprice = useHostPricesBusd()[tokens.mswap.symbol]
  const { hasAutoEarnings, autoCakeToDisplay, autoUsdToDisplay } = getCakeVaultEarnings(
    account,
    new BigNumber(cakeAtLastUserAction),
    new BigNumber(userShares),
    new BigNumber(pricePerFullShare),
    frtprice.toNumber(),
  )

  const lastActionInMs = lastUserActionTime && parseInt(lastUserActionTime.toString()) * 1000
  const dateTimeLastAction = new Date(lastActionInMs)
  const dateStringToDisplay = dateTimeLastAction.toLocaleString()

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Text fontSize="14px">{`${t('Recent MSWAPF profit')}:`}</Text>
      {hasAutoEarnings && (
        <RecentCakeProfitBalance
          cakeToDisplay={autoCakeToDisplay}
          dollarValueToDisplay={autoUsdToDisplay}
          dateStringToDisplay={dateStringToDisplay}
        />
      )}
    </Flex>
  )
}

export default RecentCakeProfitCountdownRow
