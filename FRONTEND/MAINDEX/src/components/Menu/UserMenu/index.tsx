import React from 'react'
import { Flex, LogoutIcon, UserMenu as UIKitUserMenu, UserMenuDivider, UserMenuItem, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useGasPriceManager, useUserDex } from 'state/user/hooks'
import { dexs } from 'config/constants/dex'
import hosts from 'config/constants/hosts'
import { version } from '../../../../package.json'
import { useAccount, useDisconnect } from 'wagmi'
import { GAS_PRICE_GWEI } from 'state/user/hooks/helpers'
import { useMatchBreakpoints } from 'uikit/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { updateFarmHost } from 'state/farms'
import { useGasTokenManager } from 'state/user/hooks'
import { getETHER } from 'sdk'
import { Token } from 'config/constants/types'


const UserMenu = () => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const [, setUserDex] = useUserDex()
  const { disconnect } = useDisconnect()
  const [, setGasPrice] = useGasPriceManager()
  const { isMobile } = useMatchBreakpoints()
  const dispatch = useDispatch<AppDispatch>()
  const ETHER = getETHER(chain?.id) as Token



  const onResetDexState = () => {
    setUserDex(dexs.forgeTest)
    dispatch(updateFarmHost(hosts.forgeTest))
    setGasPrice(GAS_PRICE_GWEI.default)
  }

  const onDisconnect = () => {
    disconnect()
  }

  if (!account) return <w3m-button size="md" label="CONNECT WALLET" />

  return (
    <>
      {!isMobile && <w3m-network-button /> }
      <UIKitUserMenu account={account}>
      {isMobile &&
        <UserMenuItem>
          <w3m-network-button />
        </UserMenuItem>
      }
        <UserMenuItem>
          <w3m-button size="md" balance='hide' label="CONNECT WALLET" />
        </UserMenuItem>
        <UserMenuDivider />
        <UserMenuItem as="button" onClick={onDisconnect}>
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            {t('Disconnect')}
            <LogoutIcon />
          </Flex>
        </UserMenuItem>
       
        <UserMenuItem as="button" onClick={onResetDexState}>
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            {t('Reset State')}
          </Flex>
        </UserMenuItem>
      
       
        <UserMenuItem>Version: {version}</UserMenuItem>
       
      </UIKitUserMenu>
    </>
  )
}

export default UserMenu
