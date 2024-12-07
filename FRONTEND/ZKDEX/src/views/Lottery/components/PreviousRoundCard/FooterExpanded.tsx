import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Flex, Skeleton, Heading, Box, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { LotteryRound } from 'state/types'
import { formatNumber, getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { Token } from 'config/constants/types'
import { useLotteryDecimals } from 'state/lottery/hooks'
import RewardBrackets from '../RewardBrackets'

const NextDrawWrapper = styled(Flex)`
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
  }
`

const PreviousRoundCardFooter: React.FC<{
  lotteryNodeData: LotteryRound
  lotteryId: string
  lotteryToken: Token
  lottoPrice: BigNumber
}> = ({ lotteryNodeData, lotteryToken, lottoPrice }) => {
  const { t } = useTranslation()

  // const dex = useLotteryDex(lotteryToken)
  // const lottoPrice = useLottoPrice( lotteryToken, dex)

  let prizeInBusd = new BigNumber(NaN)
  if (lotteryNodeData) {
    const { amountCollectedInCake } = lotteryNodeData
    const cakeAmount = new BigNumber(amountCollectedInCake.toString())
    prizeInBusd = cakeAmount.times(lottoPrice)
  }
  const { displayTokenDecimals, displayBUSDDecimals } = useLotteryDecimals(lotteryToken)

  const getTotalUsers = (): string => {
    if (lotteryNodeData) {
      const { firstTicketId, lastTicketId } = lotteryNodeData
      return new BigNumber(lastTicketId).minus(firstTicketId).toString()
    }

    return null
  }

  const getPrizeBalances = () => {
    return (
      <>
        {prizeInBusd.isNaN() ? (
          <Skeleton my="7px" height={40} width={200} />
        ) : (
          <Heading scale="xl" lineHeight="1" color="secondary">
            ~${formatNumber(getBalanceNumber(prizeInBusd, lotteryToken.decimals), 0, displayBUSDDecimals)}
          </Heading>
        )}
        {prizeInBusd.isNaN() ? (
          <Skeleton my="2px" height={14} width={90} />
        ) : (
          <Balance
            fontSize="14px"
            color="textSubtle"
            unit={` ${lotteryToken.symbol}`}
            value={getBalanceNumber(
              new BigNumber(lotteryNodeData?.amountCollectedInCake.toString()),
              lotteryToken.decimals,
            )}
            decimals={displayTokenDecimals}
          />
        )}
      </>
    )
  }

  return (
    <NextDrawWrapper>
      <Flex mr="24px" flexDirection="column" justifyContent="space-between">
        <Box>
          <Heading>{t('Prize pot')}</Heading>
          {getPrizeBalances()}
        </Box>
        <Box mb="24px">
          <Flex>
            <Text fontSize="14px" display="inline">
              {t('Total players this round')}: {lotteryNodeData ? getTotalUsers() : <Skeleton height={14} width={31} />}
            </Text>
          </Flex>
        </Box>
      </Flex>
      <RewardBrackets
        lotteryNodeData={lotteryNodeData}
        isHistoricRound
        lotteryToken={lotteryToken}
        lottoPrice={lottoPrice}
      />
    </NextDrawWrapper>
  )
}

export default PreviousRoundCardFooter
