import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'MARSWAP',
  description: 'A complete utility driven DEX and DeFi platform catering to the users needs.',
  image: 'https://.marswap.exchange/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  switch (path) {
    case '/':
      return {
        title: `${t('Home')} | ${t('MARSWAP')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('MARSWAP')}`,
      }
    case '/farms':
      return {
        title: `${t('LP Staking')} | ${t('MARSWAP')}`,
      }
    case '/pools':
      return {
        title: `${t('Token Staking')} | ${t('MARSWAP')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('MARSWAP')}`,
      }
    default:
      return null
  }
}
