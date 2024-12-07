import React from 'react'
import { useTranslation } from 'contexts/Localization'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, Flex } from 'uikit'
import CurrentIfo from './CurrentIfo'
import PastIfo from './PastIfo'
import CreateIfo from './CreateIfo'
import Page from 'views/Page'




const Ifos = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const getActiveIndex = (path) => {
    if (path.includes('/marsale/create')) return 0
    if (path.includes('/marsale/live')) return 1
    if (path.includes('/marsale/history')) return 2
    return 1  // Default to "Live"
  }

  const activeIndex = getActiveIndex(location.pathname)

  return (
    <Page>
      
      <Flex justifyContent='center' alignItems='center'>
        <ButtonMenu activeIndex={activeIndex} scale='sm' variant='subtle'>
          <ButtonMenuItem as={Link} to='/marsale/create'>
            {t('Create')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to='/marsale/live'>
            {t('Live')}
          </ButtonMenuItem>
          <ButtonMenuItem as={Link} to='/marsale/history'>
            {t('Finalized')}
          </ButtonMenuItem>
        </ButtonMenu>
      </Flex>

      <Routes>
        <Route path='/' element={<CurrentIfo />} />
        <Route path='create' element={<CreateIfo />} />
        <Route path='live' element={<CurrentIfo />} />
        <Route path='history' element={<PastIfo />} />
      </Routes>

      
    </Page>
  )
}

export default Ifos
