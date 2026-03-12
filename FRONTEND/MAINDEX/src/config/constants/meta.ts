import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

// Use same-origin logo for link previews (Telegram, etc.). For custom domain, set VITE_SITE_URL in Netlify.
const siteOrigin = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL
  ? (import.meta.env.VITE_SITE_URL as string).replace(/\/$/, '')
  : 'https://venerable-cupcake-ec1bc0.netlify.app'

export const DEFAULT_META: PageMeta = {
  title: 'ShadowVault Protocol',
  description: 'Trade in Shadows. Leverage Fearlessly. Privacy-centric DEX with AI-driven leverage trading, zero-knowledge privacy, and Uniswap liquidity.',
  image: `${siteOrigin}/images/shadow-vault-logo.png?v=shadowvault`,
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
