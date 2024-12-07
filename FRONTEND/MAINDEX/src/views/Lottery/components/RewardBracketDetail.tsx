import React from 'react'
import BigNumber from 'bignumber.js'
import { Flex, Skeleton, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { Token } from 'config/constants/types'
import { useLotteryDecimals } from 'state/lottery/hooks'

interface RewardBracketDetailProps {
  cakeAmount: BigNumber
  rewardBracket?: number
  numberWinners?: string
  isBurn?: boolean
  isHistoricRound?: boolean
  isLoading?: boolean
  lotteryToken: Token
  lottoPrice: BigNumber
}

const RewardBracketDetail: React.FC<RewardBracketDetailProps> = ({
  rewardBracket,
  cakeAmount,
  numberWinners,
  isHistoricRound,
  isBurn,
  isLoading,
  lotteryToken,
  lottoPrice,
}) => {
  const { t } = useTranslation()
  // const dex = useLotteryDex(lotteryToken)
  // const lottoPrice = useLottoPrice( lotteryToken, dex)
  const { displayTokenDecimals, displayBUSDDecimals } = useLotteryDecimals(lotteryToken)

  const getRewardText = () => {
    const numberMatch = rewardBracket + 1
    if (isBurn) {
      return t('Burn/Inject')
    }
    if (rewardBracket === 5) {
      return t('Match all %numberMatch%', { numberMatch })
    }
    return t('Match first %numberMatch%', { numberMatch })
  }

  return (
    <Flex flexDirection="column">
      {isLoading ? (
        <Skeleton mb="4px" mt="8px" height={16} width={80} />
      ) : (
        <Text fontSize="24px" bold color={isBurn ? 'failure' : 'secondary'}>
          {getRewardText()}
        </Text>
      )}
      <>
        {isLoading || cakeAmount.isNaN() ? (
          <Skeleton my="4px" mr="10px" height={20} width={110} />
        ) : (
          <Balance
            fontSize="20px"
            bold
            unit={` ${lotteryToken.symbol}`}
            value={getBalanceNumber(cakeAmount, lotteryToken.decimals)}
            decimals={displayTokenDecimals}
          />
        )}
        {isLoading || cakeAmount.isNaN() ? (
          <>
            <Skeleton mt="4px" mb="16px" height={12} width={70} />
          </>
        ) : (
          <Balance
            fontSize="12px"
            color="textSubtle"
            prefix="~$"
            value={getBalanceNumber(cakeAmount.times(lottoPrice), lotteryToken.decimals)}
            decimals={
              getBalanceNumber(cakeAmount.times(lottoPrice), lotteryToken.decimals) > 10 ? 2 : displayBUSDDecimals
            }
          />
        )}
        {isHistoricRound && cakeAmount && (
          <>
            {numberWinners !== '0' && (
              <Text fontSize="12px" color="textSubtle">
                {getFullDisplayBalance(
                  cakeAmount.div(parseInt(numberWinners, 10)),
                  lotteryToken.decimals,
                  displayTokenDecimals,
                )}{' '}
                {lotteryToken.symbol} {t('each')}
              </Text>
            )}
            <Text fontSize="12px" color="textSubtle">
              {numberWinners} {t('Winners')}
            </Text>
          </>
        )}
      </>
    </Flex>
  )
}

export default RewardBracketDetail
