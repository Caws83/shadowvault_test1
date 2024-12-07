import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonMenu, ButtonMenuItem } from 'uikit'
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

const NftLaunchTabButtons = () => {

  const params = useParams();
  const isHistoryActive = params['*'] === 'history';
  const { t } = useTranslation()

  return (
    <Wrapper>
      <ButtonMenu activeIndex={isHistoryActive ? 1 : 0} scale="sm" variant="subtle">
        <ButtonMenuItem as={Link} to="/nftlaunch">
          {t('Live')}
        </ButtonMenuItem>
        <ButtonMenuItem as={Link} to="/nftlaunch/history">
          {t('Old-Not Sold Out')}
        </ButtonMenuItem>
      </ButtonMenu>
    </Wrapper>
  )
}

export default NftLaunchTabButtons
