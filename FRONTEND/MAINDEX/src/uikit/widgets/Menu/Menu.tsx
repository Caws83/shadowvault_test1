import throttle from 'lodash/throttle'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import BottomNav from '../../components/BottomNav'
import { Box } from '../../components/Box'
import Flex from '../../components/Box/Flex'
import Footer from '../../components/Footer'
import MenuItems from '../../components/MenuItems/MenuItems'
import { SubMenuItems } from '../../components/SubMenuItems'
import { useMatchBreakpoints } from '../../hooks'
import CakePrice from '../../components/CakePrice/CakePrice'
import { HamburgerIcon, CloseIcon } from '../../components/Svg'
import IconButton from '../../components/Button/IconButton'
import Logo from './components/Logo'
import { MENU_HEIGHT, MOBILE_MENU_HEIGHT } from './config'
import { NavProps } from './types'
import ChatbotModal from 'components/AIBot/ChatbotModal'
import FreeSpinView from 'components/SpinModal/FreeSpinView'
import useRefresh from 'hooks/useRefresh'
import { defaultChainId } from 'config/constants/chains'
import { useAccount } from 'wagmi'
import { API_URL } from 'config'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const StyledNav = styled.nav<{ showMenu: boolean }>`
  position: fixed;
  top: ${({ showMenu }) => (showMenu ? 0 : `-${MENU_HEIGHT}px`)};
  left: 0;
  transition: top 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: ${MENU_HEIGHT}px;
  background-color: ${({ theme }) => theme.nav.background};
  z-index: 20;
  transform: translate3d(0, 0, 0);
  padding-left: 16px;
  padding-right: 16px;
  
  ${({ theme }) => theme.mediaQueries.sm} {
    padding-left: 24px;
    padding-right: 24px;
  }
`

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 25;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.25s ease;
`

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
`

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
`

const MobileDrawer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 260px;
  max-width: 80vw;
  height: 100%;
  background: ${({ theme }) => theme.nav.background};
  z-index: 26;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  animation: ${({ isOpen }) => (isOpen ? slideIn : slideOut)} 0.25s ease forwards;
`

const DrawerHeader = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
`

const DrawerSection = styled.div`
  margin-bottom: 8px;
`

const DrawerLink = styled(Link)<{ isActive?: boolean }>`
  display: block;
  padding: 12px 24px;
  color: ${({ isActive, theme }) => (isActive ? '#E11D2E' : theme.colors.text)};
  font-size: 15px;
  font-weight: ${({ isActive }) => (isActive ? 600 : 400)};
  text-decoration: none;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`

const DrawerSectionLabel = styled.div`
  padding: 8px 24px 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
`

const BodyWrapper = styled(Box)`
  position: relative;
  display: flex;
  flex: 1;
`

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean }>`
  flex-grow: 1;
  transition:
    margin-top 0.2s,
    margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;
`

const FooterWrapper = styled.div`
  margin-top: auto;
  width: 100%;
`

const Menu: React.FC<NavProps> = ({
  userMenu,
  globalMenu,
  isDark,
  toggleTheme,
  currentLang,
  setLang,
  cakePriceUsd,
  links,
  subLinks,
  footerLinks,
  activeItem,
  activeSubItem,
  langs,
  buyCakeLabel,
  children,
}) => {
  const { isMobile } = useMatchBreakpoints()
  const [showMenu, setShowMenu] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const refPrevOffset = useRef(window.pageYOffset)

  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const { chain, address } = useAccount();
  const chainId = chain ? chain.id : defaultChainId;
  const baseAPI = API_URL
  const { fastRefresh } = useRefresh();
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
      const API_URL = `${baseAPI}/api/publicData?chainId=${chainId}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((jsonData) => {
          if (jsonData.publicData) {
            setIsActive(true);
          } else {
            console.error('userData is missing from the API response.');
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setIsActive(false);
        });
    
  }, [fastRefresh, address, chain]);
  

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight
      const isTopOfPage = currentOffset === 0
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true)
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current) {
          // Has scroll up
          setShowMenu(true)
        } else {
          // Has scroll down
          setShowMenu(false)
        }
      }
      refPrevOffset.current = currentOffset
    }
    const throttledHandleScroll = throttle(handleScroll, 200)

    window.addEventListener('scroll', throttledHandleScroll)
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [])

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === 'Home')

  return (
    <Wrapper>
      <StyledNav showMenu={showMenu}>
        <Flex>
          <Logo isDark={isDark} href={homeLink?.href ?? '/'} />
          {!isMobile && <MenuItems items={links} activeItem={activeItem} activeSubItem={activeSubItem} ml="24px" />}
        </Flex>

        <Flex alignItems="center" justifyContent="center">
          <FreeSpinView isActive={isActive}/>
          {!isMobile && <ChatbotModal isActive={isActive} />}
          {!isMobile && globalMenu} {userMenu}
          {isMobile && (
            <IconButton onClick={toggleDrawer} variant="text" scale="sm" ml="4px">
              <HamburgerIcon width="24px" color="text" />
            </IconButton>
          )}
        </Flex>
      </StyledNav>

      {/* Mobile slide-out drawer */}
      {isMobile && (
        <>
          <Overlay isOpen={drawerOpen} onClick={closeDrawer} />
          {drawerOpen && (
            <MobileDrawer isOpen={drawerOpen}>
              <DrawerHeader>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Menu</span>
                <IconButton onClick={closeDrawer} variant="text" scale="sm">
                  <CloseIcon width="24px" color="text" />
                </IconButton>
              </DrawerHeader>
              <DrawerBody>
                {links.map((link) => (
                  <DrawerSection key={link.label}>
                    {link.items && link.items.length > 0 ? (
                      <>
                        <DrawerSectionLabel>{link.label}</DrawerSectionLabel>
                        {link.items.map((sub) =>
                          sub.label ? (
                            <DrawerLink
                              key={sub.label}
                              to={sub.href}
                              isActive={sub.href === activeSubItem}
                              onClick={closeDrawer}
                            >
                              {sub.label}
                            </DrawerLink>
                          ) : null,
                        )}
                      </>
                    ) : (
                      <DrawerLink
                        to={link.href}
                        isActive={link.href === activeItem}
                        onClick={closeDrawer}
                      >
                        {link.label}
                      </DrawerLink>
                    )}
                  </DrawerSection>
                ))}
              </DrawerBody>
            </MobileDrawer>
          )}
        </>
      )}
      {subLinks && <SubMenuItems items={subLinks} mt={`${MENU_HEIGHT + 1}px`} activeItem={activeSubItem} />}
      <BodyWrapper mt={!subLinks ? `${MENU_HEIGHT + 1}px` : '0'}>
        <Inner isPushed={false} showMenu={showMenu}>
          {children}
        </Inner>
      </BodyWrapper>
      <FooterWrapper>
        <Footer
          items={footerLinks}
          isDark={isDark}
          toggleTheme={toggleTheme}
          langs={langs}
          setLang={setLang}
          currentLang={currentLang}
          cakePriceUsd={cakePriceUsd}
          buyCakeLabel={buyCakeLabel}
          mb={[`${MOBILE_MENU_HEIGHT}px`, null, '0px']}
        />
      </FooterWrapper>
      {isMobile && <BottomNav items={links} activeItem={activeItem} activeSubItem={activeSubItem} />}
    </Wrapper>
  )
}

export default Menu
