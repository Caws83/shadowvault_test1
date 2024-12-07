import React from 'react'
import styled from 'styled-components'
import { Text, useMatchBreakpoints } from 'uikit'
import { Pool } from 'state/types'
import { useCakeVault } from 'state/pools/hooks'
import { useTranslation } from 'contexts/Localization'
import BaseCell, { CellContent } from './BaseCell'
import Apr from '../Apr'
import { convertSharesToCake } from '../../../helpers'
import { BigNumber } from 'bignumber.js'

interface AprCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 1 0 40px;
  ${({ theme }) => theme.mediaQueries.md} {
    flex: 0 0 120px;
  }
`

const AutoAprCell: React.FC<AprCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const {
    userData: { userShares },
    fees: { performanceFee },
    pricePerFullShare,
  } = useCakeVault()

  const { cakeAsBigNumber } = convertSharesToCake(new BigNumber(userShares), new BigNumber(pricePerFullShare))
  const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize="12px" color="textSubtle" textAlign="left">
          {t('APY')}
        </Text>
        <Apr
          pool={pool}
          stakedBalance={cakeAsBigNumber}
          performanceFee={performanceFeeAsDecimal}
          showIcon={!isMobile}
        />
      </CellContent>
    </StyledCell>
  )
}

export default AutoAprCell
