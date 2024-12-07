import React from 'react'
import styled from 'styled-components'
import { useLocation, Link, useParams } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, NotificationDot } from 'uikit'
import { useTranslation } from 'contexts/Localization'

interface FarmTabButtonsProps {
  hasStakeInFinishedFarms: boolean
  isLocker: boolean
}

const FarmTabButtons: React.FC<FarmTabButtonsProps> = ({ hasStakeInFinishedFarms, isLocker }) => {
  const params = useParams();
  const isHistoryActive = params['*'] === 'history';
  const { t } = useTranslation()

  return (
    <Wrapper>
      <ButtonMenu activeIndex={isHistoryActive ? 1 : 0} scale="sm" variant="subtle">
        <ButtonMenuItem as={Link} to={isLocker === true ? "/lockers/" : "/marstake/"}>
        {isLocker === true ? t('All lockers') : t('Rewarding')}
        </ButtonMenuItem>
        <NotificationDot show={hasStakeInFinishedFarms}>
          <ButtonMenuItem as={Link} to={isLocker === true ? "/lockers/history" :"/marstake/history"}>
          {isLocker === true ? t('Unlocked Only') : t('No Rewards')}
          </ButtonMenuItem>
        </NotificationDot>
      </ButtonMenu>
    </Wrapper>
  )
}

export default FarmTabButtons

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    padding-left: 12px;
    padding-right: 12px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`
