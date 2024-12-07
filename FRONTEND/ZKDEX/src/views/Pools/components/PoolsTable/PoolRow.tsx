import React, { useState } from 'react'
import styled from 'styled-components'
import { useMatchBreakpoints } from 'uikit'
import { Pool } from 'state/types'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import NameCell from './Cells/NameCell'
import EarningsCell from './Cells/EarningsCell'
import AprCell from './Cells/AprCell'
import TotalStakedCell from './Cells/TotalStakedCell'
import EndsInCell from './Cells/EndsInCell'
import ExpandActionCell from './Cells/ExpandActionCell'
import ActionPanel from './ActionPanel/ActionPanel'
import AutoEarningsCell from './Cells/AutoEarningsCell'
import AutoAprCell from './Cells/AutoAprCell'

export interface PoolRowProps {
  pool: Pool
  account: string
  userDataLoaded: boolean
}

const StyledRow = styled.div<{ isLargerScreen: boolean; isDesktop: boolean }>`
  background-color: transparent;
  display: flex;
  cursor: pointer;

  & > :first-child {
    flex: 0 0 ${(props) => (props.isLargerScreen && props.isDesktop ? '30%' : '50%')};
  }

  & > div {
    flex: 1; /* Share the rest of the space equally among other cells */
  }
`

const PoolRow: React.FC<PoolRowProps> = ({ pool, account, userDataLoaded }) => {
  const { isXs, isSm, isMd,isLg, isXl, isXxl, isDesktop } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isDesktop
  const [expanded, setExpanded] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  const currentBlock = Date.now() / 1000

  return (
    <>
      <StyledRow role="row" isLargerScreen={isLargerScreen} isDesktop={isDesktop} onClick={toggleExpanded}>
        <NameCell pool={pool} />
        {pool.isAutoVault ? (
          <AutoEarningsCell pool={pool} account={account} userDataLoaded={userDataLoaded} />
        ) : (
          <EarningsCell pool={pool} account={account} userDataLoaded={userDataLoaded} />
        )}
        {pool.isAutoVault ? <AutoAprCell pool={pool} /> : <AprCell pool={pool} />}
        {isLargerScreen && <TotalStakedCell pool={pool} />}
        {isDesktop && <EndsInCell pool={pool} currentBlock={currentBlock} />}
        <ExpandActionCell expanded={expanded} isFullLayout={isDesktop || isLargerScreen} />
      </StyledRow>
      {shouldRenderActionPanel && (
        <ActionPanel
          account={account}
          pool={pool}
          userDataLoaded={userDataLoaded}
          expanded={expanded}
          breakpoints={{ isXs, isSm, isMd, isLg, isXl, isXxl }}
          currentBlock={currentBlock}
        />
      )}
    </>
  )
}

export default PoolRow
