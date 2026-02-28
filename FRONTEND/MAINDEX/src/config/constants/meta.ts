import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'ShadowVault Protocol',
  description: 'Trade in Shadows. Leverage Fearless. Privacy-centric DEX with AI-driven leverage trading, zero-knowledge privacy, and Uniswap liquidity.',
  image: 'https://shadowvault.protocol/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  switch (path) {
    case '/':
      return {
        title: `${t('Home')} | ${t('ShadowVault Protocol')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('ShadowVault Protocol')}`,
      }
    case '/farms':
      return {
        title: `${t('LP Staking')} | ${t('ShadowVault Protocol')}`,
      }
    case '/pools':
      return {
        title: `${t('Token Staking')} | ${t('ShadowVault Protocol')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('ShadowVault Protocol')}`,
      }
    default:
      return null
  }
}
