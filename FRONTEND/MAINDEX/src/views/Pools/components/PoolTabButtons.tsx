import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem, NotificationDot } from 'uikit'
import { useTranslation } from 'contexts/Localization'

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

const PoolTabButtons = ({ hasStakeInFinishedPools }) => {
  const params = useParams();
  const isHistoryActive = params['*'] === 'history';
  const { t } = useTranslation()

  return (
    <Wrapper>
      <ButtonMenu activeIndex={isHistoryActive ? 1 : 0} scale="sm" variant="subtle">
        <ButtonMenuItem as={Link} to="/pools/">
          {t('Live')}
        </ButtonMenuItem>
        <NotificationDot show={hasStakeInFinishedPools}>
          <ButtonMenuItem as={Link} to="/pools/history">
            {t('Finished')}
          </ButtonMenuItem>
        </NotificationDot>
      </ButtonMenu>
    </Wrapper>
  )
}

export default PoolTabButtons
