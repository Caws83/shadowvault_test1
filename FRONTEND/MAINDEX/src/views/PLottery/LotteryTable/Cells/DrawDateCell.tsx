import React from 'react'
import styled from 'styled-components'
import { Text, Skeleton, useMatchBreakpoints } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { dateTimeOptions, dayOptions } from 'views/Lottery/helpers'
import BaseCell, { CellContent } from './BaseCell'

interface DrawDateProps {
  endTime: string
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

const DrawDateCell: React.FC<DrawDateProps> = ({ endTime }) => {
  const { t } = useTranslation()

  const { isMobile } = useMatchBreakpoints()

  const endTimeMs = parseInt(endTime, 10) * 1000
  const endDate = new Date(endTimeMs)

  const getNextDrawDate = () => {
    if (isMobile) {
      return `${endDate.toLocaleString(undefined, dayOptions)}`
    }
    return `${endDate.toLocaleString(undefined, dateTimeOptions)}`
  }

  return (
    <StyledCell role="cell">
      <CellContent>
        <Text fontSize={isMobile ? '14px' : '20px'} textAlign="left">
          {t('Draw')}
        </Text>
        {endTime ? (
          <Text bold={!isMobile} small={isMobile} color="secondary" fontSize={isMobile ? '18px' : '24px'}>
            {getNextDrawDate()}
          </Text>
        ) : (
          <>
            <Skeleton width={50} height={40} my="8px" />
          </>
        )}
      </CellContent>
    </StyledCell>
  )
}

export default DrawDateCell
