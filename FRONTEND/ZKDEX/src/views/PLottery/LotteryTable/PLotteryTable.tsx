import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonMenu, ButtonMenuItem, Card, ChevronUpIcon, Flex } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { PLottery } from 'state/types'
import PLotteryRow from './PLotteryRow'

interface PLotteryTableProps {
  plotteries: PLottery[]
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

const PLotteryTable: React.FC<PLotteryTableProps> = ({ plotteries, userDataLoaded, account }) => {
  const { t } = useTranslation()
  const tableWrapperEl = useRef<HTMLDivElement>(null)
  const scrollToTop = (): void => {
    tableWrapperEl.current.scrollIntoView({
      behavior: 'smooth',
    })
  }
  const [isLive, setIsLive] = useState(true)
  return (
    <>
      <Flex justifyContent="center" alignItems="center" mb="24px">
        <ButtonMenu
          activeIndex={isLive ? 0 : 1}
          scale="sm"
          variant="subtle"
          onItemClick={(index) => {
            setIsLive(!index)
          }}
        >
          <ButtonMenuItem as="button">{t('Live')}</ButtonMenuItem>
          <ButtonMenuItem as="button">{t('Finished')}</ButtonMenuItem>
        </ButtonMenu>
      </Flex>

        <StyledTable role="table" ref={tableWrapperEl}>
          {plotteries
            .filter((l) => (isLive ? !l.isFinished : l.isFinished))
            .map((plottery) => (
              <TableElementWrapper>
                <PLotteryRow key={plottery.lId} plottery={plottery} userDataLoaded={userDataLoaded} account={account} />
              </TableElementWrapper>
            ))}
          <ScrollButtonContainer>
            <Button variant="text" onClick={scrollToTop}>
              {t('To Top')}
              <ChevronUpIcon color="primary" />
            </Button>
          </ScrollButtonContainer>
        </StyledTable>
    </>
  )
}

export default PLotteryTable
