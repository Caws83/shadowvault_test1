import React from 'react'
import styled from 'styled-components'
import { Skeleton, Text, Flex, Box, useMatchBreakpoints } from 'uikit'
import { NFTPool } from 'state/types'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceNumber } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import BaseCell, { CellContent } from './BaseCell'

interface EarningsCellProps {
  pool: NFTPool
  account: string
  userDataLoaded: boolean
}

const StyledCell = styled(BaseCell)`

`

const EarningsCell: React.FC<EarningsCellProps> = ({ pool, account, userDataLoaded }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { earningToken, userData, dex, currentRound } = pool
  const round = new BigNumber(currentRound).toNumber()
  const currentRToken = earningToken[round]

  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO

  const earningTokenPrice = useGetTokenPrice(dex, currentRToken)
  const earningTokenBalance = getBalanceNumber(earnings, currentRToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), currentRToken.decimals)
  const hasEarnings = account && earnings.gt(0)

  const labelText = t('Earned')

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize="12px" color="textSubtle" textAlign="left">
          {labelText}
        </Text>
        {!userDataLoaded && account ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex>
              <Box mr="8px" height="32px">
                <Balance
                  mt="4px"
                  bold={!isMobile}
                  fontSize={isMobile ? '14px' : '16px'}
                  color={hasEarnings ? 'primary' : 'textDisabled'}
                  decimals={hasEarnings ? 2 : 1}
                  value={hasEarnings ? earningTokenBalance : 0}
                />

                {hasEarnings ? (
                  <>
                    {earningTokenPrice > 0 && (
                      <Balance
                        display="inline"
                        fontSize="12px"
                        color="textSubtle"
                        decimals={2}
                        prefix="~"
                        value={earningTokenDollarBalance}
                        unit=" USD"
                      />
                    )}
                  </>
                ) : (
                  <Text mt="4px" fontSize="12px" color="textDisabled">
                    0 USD
                  </Text>
                )}
              </Box>
            </Flex>
          </>
        )}
      </CellContent>
    </StyledCell>
  )
}

export default EarningsCell
