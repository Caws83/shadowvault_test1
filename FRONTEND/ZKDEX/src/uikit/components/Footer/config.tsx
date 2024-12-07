import { Language } from '../LangSelector/types'
import { FooterLinkType, SocialLink } from './types'

export const footerLinks: FooterLinkType[] = [
  {
    label: 'About',
    items: [
      {
        label: 'Contact',
        href: 'https://docs.pancakeswap.finance/contact-us',
      },
      {
        label: 'Blog',
        href: 'https://pancakeswap.medium.com/',
      },
      {
        label: 'Community',
        href: 'https://docs.pancakeswap.finance/contact-us/telegram',
      },
      {
        label: 'CAKE',
        href: 'https://docs.pancakeswap.finance/tokenomics/cake',
      },
      {
        label: '—',
      },
      {
        label: 'Online Store',
        href: 'https://pancakeswap.creator-spring.com/',
        isHighlighted: true,
      },
    ],
  },
  {
    label: 'Help',
    items: [
      {
        label: 'Customer',
        href: 'Support https://docs.pancakeswap.finance/contact-us/customer-support',
      },
      {
        label: 'Troubleshooting',
        href: 'https://docs.pancakeswap.finance/help/troubleshooting',
      },
      {
        label: 'Guides',
        href: 'https://docs.pancakeswap.finance/get-started',
      },
    ],
  },
  {
    label: 'Developers',
    items: [
      {
        label: 'Github',
        href: 'https://github.com/pancakeswap',
      },
      {
        label: 'Documentation',
        href: 'https://docs.pancakeswap.finance',
      },
      {
        label: 'Bug Bounty',
        href: 'https://app.gitbook.com/@pancakeswap-1/s/pancakeswap/code/bug-bounty',
      },
      {
        label: 'Audits',
        href: 'https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited',
      },
      {
        label: 'Careers',
        href: 'https://docs.pancakeswap.finance/hiring/become-a-chef',
      },
    ],
  },
]

export const socials: SocialLink[] = [
  {
    label: 'Telegram',
    icon: 'telegram',
    href: 'https://t.me/MSWAP_LAUNCHPAD',
  },
  {
    label: 'Twitter',
    icon: 'x',
    href: 'https://twitter.com/MARSWAP1',
  },
  {
    label: 'TikTok',
    icon: 'tiktok',
    href: 'https://www.tiktok.com/@marswap.exchange',
  },
  {
    label: 'CoinGecko',
    icon: 'cg',
    href: 'https://www.coingecko.com/en/exchanges/marswap',
  },
  {
    label: 'CMC',
    icon: 'cmc',
    href: 'https://coinmarketcap.com/exchanges/marswap/',
  },
  {
    label: 'GitBook',
    icon: 'git',
    href: 'https://marswap.gitbook.io/marswap/',
  },
  {
    label: 'Youtube',
    icon: 'youtube',
    href: 'https://www.youtube.com/@MARSWAP.EXCHANGE',
  },
  {
    label: 'Contact',
    icon: 'mail',
    href: 'mailto:team@marswap.exchange',
  },
 
]

export const langs: Language[] = [...Array(20)].map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}))
