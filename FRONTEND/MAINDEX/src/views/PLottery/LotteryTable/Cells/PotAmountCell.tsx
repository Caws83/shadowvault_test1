import React from 'react'
import styled from 'styled-components'
import { Text, useMatchBreakpoints, Skeleton, Flex } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { PLottery } from 'state/types'
import Balance from 'components/Balance'
import { getBalanceAmount, getBalanceNumber } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import BaseCell, { CellContent } from './BaseCell'

interface PotAmountCellProps {
  plottery: PLottery
  lottoPrice: BigNumber
  amountCollectedInCake: BigNumber
}

const StyledCell = styled(BaseCell)`
  flex: 5;
  flex-direction: row;
  padding-left: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding-left: 32px;
  }
`

const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const PotAmountCell: React.FC<PotAmountCellProps> = ({ plottery, amountCollectedInCake, lottoPrice }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const { lotteryToken, displayBUSDDecimals, isFinished } = plottery

  const prizeInBusd = new BigNumber(amountCollectedInCake).times(lottoPrice)
  const prizeTotal = getBalanceNumber(prizeInBusd, lotteryToken.decimals)

  const title = `${t('Prizes')}`

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text bold={!isMobile} small={isMobile} fontSize={isMobile ? '14px' : '24px'}>
          {title}
        </Text>
        <Flex>
          {prizeInBusd.isNaN() ? (
            <Skeleton my="7px" height={60} width={50} />
          ) : (
            <Flex flexDirection="column">
              <>
                <PrizeTotalBalance
                  fontSize={isMobile ? '24px' : '32px'}
                  bold={!isMobile}
                  small={isMobile}
                  prefix="$"
                  value={isFinished ? 0 : prizeTotal}
                  decimals={prizeTotal > 10 ? 2 : displayBUSDDecimals}
                />
                {!isMobile && (
                  <Flex alignItems="center">
                    <Balance
                      fontSize="24px"
                      bold={!isMobile}
                      value={isFinished ? 0 : getBalanceAmount(amountCollectedInCake).toNumber()}
                      decimals={0}
                      unit={` ${lotteryToken.symbol}`}
                    />
                  </Flex>
                )}
              </>
            </Flex>
          )}
        </Flex>
      </CellContent>
    </StyledCell>
  )
}

export default PotAmountCell
