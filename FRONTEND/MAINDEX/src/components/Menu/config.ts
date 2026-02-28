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
    label: t('AI Agents'),
    href: '/swap',
    hideSubNav: true,
    items: [
      {
        label: t('AI Trading'),
        href: '/swap',
      },
      {
        label: t('Leverage Trading'),
        href: '/swap',
      },
      {
        label: t('Privacy Mode'),
        href: '/swap',
      },
    ],
  },

]

export default config
