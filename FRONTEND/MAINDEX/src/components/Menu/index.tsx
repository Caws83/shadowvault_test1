import React from 'react'
import { useLocation } from 'react-router'
import { Menu as UikitMenu } from 'uikit'
import { languageList } from 'config/localization/languages'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { useHostPricesBusd } from 'state/farms/hooks'
import { useProfile } from 'state/profile/hooks'
import tokens from 'config/constants/tokens'
import config from './config'
import { getActiveMenuItem, getActiveSubMenuItem } from './utils'
import UserMenu from './UserMenu'
import GlobalSettings from './GlobalSettings'
import { footerLinks } from './footerConfig'

const Menu = (props) => {
  const { isDark, toggleTheme } = useTheme()
  // const hostprices = useHostPricesBusd()
  const frtprice = 0 // hostprices[tokens.mswap.symbol]
  const { profile } = useProfile()
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useLocation()

  const activeMenuItem = getActiveMenuItem({ menuConfig: config(t), pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

  return (
    <UikitMenu
      userMenu={<UserMenu />}
      globalMenu={<GlobalSettings />}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={currentLanguage.code}
      langs={languageList}
      setLang={setLanguage}
      cakePriceUsd={frtprice}
      links={config(t)}
      subLinks={activeMenuItem?.hideSubNav ? [] : activeMenuItem?.items}
      footerLinks={footerLinks(t)}
      activeItem={activeMenuItem?.href}
      activeSubItem={activeSubMenuItem?.href}
      buyCakeLabel={t('Buy $SHDV')}
      profile={{
        username: profile?.username,
        image: profile?.nft ? `/images/nfts/${profile.nft?.images.sm}` : undefined,
        profileLink: '/profile',
        noProfileLink: '/profile',
        showPip: !profile?.username,
      }}
      {...props}
    />
  )
}

export default Menu
