import { ChainId } from 'sdk'

const NETWORK_URLS: { [chainId in ChainId]: string } = {
  [ChainId.PUPNET]: 'https://puppynet.shibrpc.com',
  [ChainId.SHIBNET]: 'https://www.shibrpc.com',
}

export default NETWORK_URLS
