import { FooterLinkType } from 'uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('Documentation'),
    items: [
      {
        label: t('MARSWAP Medium'),
        href: 'https://medium.com/@marswap',
      },
      {
        label: t('GitBook'),
        href: 'https://marswap.gitbook.io/marswap/',
      },
    ],
  },
  
  {
    label: t('Help'),
    items: [
      
      {
        label: t('Email'),
        href: 'Team@marswap.exchange',
      },
      {
        label: t('LinkTree'),
        href: 'https://linktr.ee/marswap/',
      },
      
    ],
  },
  
]
