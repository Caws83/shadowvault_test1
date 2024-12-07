import React from 'react'
import styled from 'styled-components'
import { Text, ChevronDownIcon } from 'uikit'
import { useTranslation } from 'contexts/Localization'

interface ExpandActionCellProps {
  expanded: boolean
  isFullLayout: boolean
}

const BaseCell = styled.div`
  color: black;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

export const StyledCell = styled(BaseCell)`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
  padding-right: 12px;
  padding-left: 0px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding-right: 32px;
    padding-left: 8px;
  }
`

const ArrowIcon = styled(ChevronDownIcon)<{ toggled: boolean }>`
  transform: ${({ toggled }) => (toggled ? 'rotate(180deg)' : 'rotate(0)')};
  height: 24px;
`

const ExpandedActionCell: React.FC<ExpandActionCellProps> = ({ expanded, isFullLayout }) => {
  const { t } = useTranslation()
  return (
    <StyledCell role="cell">
      {isFullLayout ? (
        <Text color="primary" bold>
          {expanded ? t('Minimize') : t('NFT Info')}
        </Text>
      ) : (
        <Text color="primary" bold>
          {expanded ? t('Hide ') : t('Information')}
        </Text>
      )}
      <ArrowIcon color="primary" toggled={expanded} />
    </StyledCell>
  )
}

export default ExpandedActionCell
