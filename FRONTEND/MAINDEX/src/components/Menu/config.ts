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
        label: t('Create Token'),
        href: '/marshot',
      },
      {
        label: t('Pools'),
        href: '/marspools',
      },
      {
        label: t('Stake'),
        href: '/marstake',
      },
      {
        label: t('Presale'),
        href: '/marsale',
      },
      {
        label: t('SOL Foundry'),
        href: '/marscreate',
      },
      {
        label: t('Quick Airdrop'),
        href: '/marsend',
      },
    ],
  },

]

export default config
