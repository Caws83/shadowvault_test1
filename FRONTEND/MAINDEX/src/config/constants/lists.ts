// const FARMAGEDDON_EXTENDED = 'https://dex.marswap.exchange/tokenlist/marswap-extended.json'
// const FARMAGEDDON_TOP15 = 'https://dex.marswap.exchange/tokenlist/marswap-top-15.json'

export const UNSUPPORTED_LIST_URLS: string[] = []

// lower index == higher priority for token import

export const DEFAULT_LIST_OF_LISTS: string[] = [
  // FARMAGEDDON_EXTENDED,
  // FARMAGEDDON_TOP15,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = []
