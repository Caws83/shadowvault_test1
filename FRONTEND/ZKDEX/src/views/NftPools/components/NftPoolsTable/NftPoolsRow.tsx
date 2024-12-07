import React, { useState } from 'react'
import styled from 'styled-components'
import { useMatchBreakpoints } from 'uikit'
import { NFTPool } from 'state/types'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import NameCell from './Cells/NameCell'
import EarningsCell from './Cells/EarningsCell'
import TotalStakedCell from './Cells/TotalStakedCell'
import EndsInCell from './Cells/EndsInCell'
import ExpandActionCell from './Cells/ExpandActionCell'
import ActionPanel from './ActionPanel/ActionPanel'

interface NftPoolRowProps {
  pool: NFTPool
  account: string
  userDataLoaded: boolean
}

const StyledRow = styled.div<{ isLargerScreen: boolean; isDesktop: boolean }>`
  background-color: transparent;
  display: flex;
  cursor: pointer;

  & > :first-child {
    flex: 0 0 ${(props) => (props.isLargerScreen && props.isDesktop ? '30%' : '60%')};
  }

  & > div {
    flex: 1; /* Share the rest of the space equally among other cells */
  }
`;


const NftPoolRow: React.FC<NftPoolRowProps> = ({ pool, account, userDataLoaded }) => {
  const { isXs, isSm, isMd, isLg, isXl, isXxl, isTablet, isDesktop } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl
  const [expanded, setExpanded] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <>
      <StyledRow role="row" isLargerScreen={isLargerScreen} isDesktop={isDesktop} onClick={toggleExpanded}>
        <NameCell pool={pool} />
        <EarningsCell pool={pool} account={account} userDataLoaded={userDataLoaded} />
        {isLargerScreen && <TotalStakedCell pool={pool} />}
        {isDesktop && <EndsInCell pool={pool} />}
        <ExpandActionCell expanded={expanded} isFullLayout={isDesktop || isLargerScreen} />
      </StyledRow>
      {shouldRenderActionPanel && (
        <ActionPanel
          account={account}
          nftpool={pool}
          userDataLoaded={userDataLoaded}
          expanded={expanded}
          breakpoints={{ isXs, isSm, isMd, isLg, isXl, isXxl }}
        />
      )}
    </>
  );
};

export default NftPoolRow
