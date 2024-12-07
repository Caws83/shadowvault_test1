import React from 'react'
import styled from 'styled-components'
import { Text, useMatchBreakpoints } from 'uikit'
import { LotteryConfig } from 'config/constants/types'
import { TokenImage } from 'components/TokenImage'
import hosts from 'config/constants/hosts'
import BaseCell, { CellContent } from './BaseCell'

interface NameCellProps {
  plottery: LotteryConfig
}

const StyledCell = styled(BaseCell)`
  flex: 5;
  flex-direction: column;
  padding-left: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding-left: 32px;
  }
`

const NameCell: React.FC<NameCellProps> = ({ plottery }) => {
  const { isMobile } = useMatchBreakpoints()
  const { lotteryToken } = plottery

  const gameTokenSymbol = lotteryToken.symbol

  const gameToken = `${gameTokenSymbol}`

  return (
    <StyledCell role="cell">
      <TokenImage token={lotteryToken} host={hosts.marswap} chainId={plottery.chainId} width={isMobile ? 32 : 64} height={isMobile ? 32 : 64} />
      <CellContent>
        <Text bold={!isMobile} small={isMobile}>
          {gameToken}
        </Text>
      </CellContent>
    </StyledCell>
  )
}

export default NameCell
