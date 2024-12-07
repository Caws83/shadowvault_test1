import React from 'react'
import { Flex, Text, Button, Heading, useModal, Skeleton } from 'uikit'
import BigNumber from 'bignumber.js'
import { PoolConfig, Token } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance, getBalanceNumber, formatNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import EasyCollectModal from '../../Modals/EasyCollectModal'

interface HarvestActionsProps {
  pool: PoolConfig
  earnings: BigNumber
  earningToken: Token
  sousId: number
  earningTokenPrice: number
  isBnbPool: boolean
  isLoading?: boolean
}

const HarvestActions: React.FC<HarvestActionsProps> = ({
  pool,
  earnings,
  earningToken,
  sousId,
  isBnbPool,
  earningTokenPrice,
  isLoading = false,
}) => {
  const { t } = useTranslation()
  const earningTokenBalance = getBalanceNumber(earnings, earningToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)

  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)

  const fullBalance = getFullDisplayBalance(earnings, earningToken.decimals)
  const hasEarnings = earnings.toNumber() > 0
  const isCompoundPool = pool.stakingToken === pool.earningToken
  const canHarvest = pool.canHarvest !== undefined ? pool.canHarvest : true && hasEarnings

  const [onPresentCollect] = useModal(
    <EasyCollectModal
      pool={pool}
      formattedBalance={formattedBalance}
      fullBalance={fullBalance}
      earningToken={earningToken}
      earningsDollarValue={earningTokenDollarBalance}
      sousId={sousId}
      isBnbPool={isBnbPool}
      isCompoundPool={isCompoundPool}
    />,
  )

  return (
    <Flex flexDirection="row" mb="16px" justifyContent="space-between" alignItems="center">
    <Flex flexDirection="column" alignItems="left">
      {isLoading ? (
        <Skeleton width="80px" height="48px" />
      ) : (
        <>
          {hasEarnings ? (
            <>
              <Balance bold fontSize="20px" decimals={5} value={earningTokenBalance} />
              {earningTokenPrice > 0 && (
                <Balance
                  display="inline"
                  fontSize="8px"
                  color="textSubtle"
                  decimals={2}
                  prefix="~"
                  value={earningTokenDollarBalance}
                  unit=" USD"
                />
              )}
            </>
          ) : (
            <>
              <Heading fontSize='20px' color="textDisabled">0</Heading>
              <Text fontSize="8px" color="textDisabled">
                0 USD
              </Text>
            </>
          )}
        </>
      )}
    </Flex>
    <Flex flex="1" justifyContent="flex-end">
      <Button disabled={!canHarvest} onClick={onPresentCollect}>
        {isCompoundPool ? t('Collect') : t('Harvest')}
      </Button>
    </Flex>
  </Flex>
  
  )
}

export default HarvestActions
