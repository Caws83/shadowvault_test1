import React, { useEffect, useState } from 'react'
import { Flex, LogoutIcon, UserMenu as UIKitUserMenu, UserMenuDivider, UserMenuItem } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useGasPriceManager, useUserDex } from 'state/user/hooks'
import { dexs } from 'config/constants/dex'
import { useFarmHostManager } from 'state/farms/hooks'
import hosts from 'config/constants/hosts'
import { version } from '../../../../package.json'
import { useAccount, useDisconnect } from 'wagmi'
import { GAS_PRICE_GWEI } from 'state/user/hooks/helpers'
import { useWeb3ModalTheme } from '@web3modal/wagmi/react'


const UserMenu = (color?: any) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const [, setUserDex] = useUserDex()
  const [, setFarmHost] = useFarmHostManager()
  const { disconnect } = useDisconnect()
  const [, setGasPrice] = useGasPriceManager()
  const {  setThemeVariables } = useWeb3ModalTheme()
  const [ isSet, setisSet ] = useState(false)

 

  useEffect(() => {
    if (!isSet && color.color !== undefined) {
      console.log(color.color)
      
      setThemeVariables({
        '--w3m-accent': `#${color.color}`,
        '--w3m-color-mix-strength': 40
      })
      setisSet(true)
    }
  }, [color])

  const onResetDexState = () => {
    setUserDex(dexs.marswap)
    setFarmHost(hosts.farmageddon)
    setGasPrice(GAS_PRICE_GWEI.default)
  }

  const onDisconnect = () => {
    disconnect()
  }

  if (!account) return <w3m-button />

  return (

    <Flex justifyContent="flex-end">
      <UIKitUserMenu account={account}>
        <UserMenuItem>
          <w3m-network-button />
        </UserMenuItem>
        <UserMenuItem>
          <w3m-button />
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
    </Flex>
 
  )
}

export default UserMenu
