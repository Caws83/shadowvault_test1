import { DropdownMenuItemType, MenuItemsType /* DropdownMenuItemType */ } from 'uikit'
import { ContextApi } from 'contexts/Localization/types'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Trade'),
    href: '/swap',
    hideSubNav: true,
    items: [
      {
        label: t('Exchange'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
      },
     
     
    ],
  },

  {
    label: t('Tools'),
    href: '/marshot',
    hideSubNav: true,
    items: [
      {
        label: t('Flash Forge'),
        href: '/marshot',
      },
      {
        label: t('Create Token'),
        href: '/marscreate',
      },
      {
        label: t('Presale'),
        href: '/marsale',
      },
      {
        label: t('Quick Airdrop'),
        href: '/marsend',
      },
      {
        label: t('Pools'),
        href: '/marspools',
      },
      {
        label: t('Stake'),
        href: '/marstake',
      },

    ],
  },

]

export default config
