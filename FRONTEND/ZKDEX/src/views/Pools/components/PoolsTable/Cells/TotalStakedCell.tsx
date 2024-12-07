import React, { useMemo } from 'react'
import { Flex, Skeleton, Text } from 'uikit'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import { Pool } from 'state/types'
import { useCakeVault } from 'state/pools/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import BaseCell, { CellContent } from './BaseCell'
import BigNumber from 'bignumber.js'

interface TotalStakedCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 2 0 100px;
`

const TotalStakedCell: React.FC<TotalStakedCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  const { stakingToken, totalStaked, isAutoVault } = pool
  const { totalCakeInVault } = useCakeVault()

  const totalStakedBalance = useMemo(() => {
    if (isAutoVault) {
      return getBalanceNumber(new BigNumber(totalCakeInVault), stakingToken.decimals)
    }
    return getBalanceNumber(new BigNumber(totalStaked), stakingToken.decimals)
  }, [isAutoVault, totalCakeInVault, totalStaked, stakingToken.decimals])

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize="14px" color="textSubtle" textAlign="left">
          {t('TOTAL STAKED')}
        </Text>
        {totalStaked && new BigNumber(totalStaked).gte(0) ? (
          <Flex height="20px" alignItems="center">
            <Balance fontSize="16px" value={totalStakedBalance} decimals={0}  />
          </Flex>
        ) : (
          <Skeleton width="80px" height="16px" />
        )}
      </CellContent>
    </StyledCell>
  )
}

export default TotalStakedCell
