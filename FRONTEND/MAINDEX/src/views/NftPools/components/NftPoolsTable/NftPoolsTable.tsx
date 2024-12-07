import React, { useRef } from 'react'
import styled from 'styled-components'
import { Button, Card, ChevronUpIcon } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { NFTPool } from 'state/types'
import PoolRow from './NftPoolsRow'

interface NftPoolsTableProps {
  pools: NFTPool[]
  userDataLoaded: boolean
  account: string
}

const StyledTable = styled.div``;

const TableElementWrapper = styled.div`
  margin-bottom: 10px; 
  border-radius: ${({ theme }) => theme.radii.card};
  background-color: ${({ theme }) => theme.card.background};
  > div:not(:last-child) {
  }
`

const ScrollButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 5px;
  padding-bottom: 5px;
`

const NftPoolsTable: React.FC<NftPoolsTableProps> = ({ pools, userDataLoaded, account }) => {
  const { t } = useTranslation()
  const tableWrapperEl = useRef<HTMLDivElement>(null)
  const scrollToTop = (): void => {
    tableWrapperEl.current.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <StyledTable role="table" ref={tableWrapperEl}>
      {pools.map(
        (pool) =>
          pool.currentRound && (
            <TableElementWrapper key={pool.nftCollectionId}>
              <PoolRow pool={pool} account={account} userDataLoaded={userDataLoaded} />
            </TableElementWrapper>
          ),
      )}
      <ScrollButtonContainer>
        <Button variant="text" onClick={scrollToTop}>
          {t('To Top')}
          <ChevronUpIcon color="primary" />
        </Button>
      </ScrollButtonContainer>
    </StyledTable>
  )
}

export default NftPoolsTable
