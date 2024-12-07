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
        label: t('MARSCREATE'),
        href: '/marscreate',
      },
      {
        label: t('MARSALE'),
        href: '/marsale',
      },
      {
        label: t('MARSHOT'),
        href: '/marshot',
      },
      {
        label: t('MARSPIN'),
        href: '/marspin',
      },
      {
        label: t('MARSEND'),
        href: '/marsend',
      },
      {
        label: t('MARS POOLS'),
        href: '/marspools',
      },
      {
        label: t('MARSTAKE'),
        href: '/marstake',
      },

    ],
  },

]

export default config
