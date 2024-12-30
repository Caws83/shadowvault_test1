import { ChainId } from 'sdk'

const NETWORK_URLS: { [chainId in ChainId]: string } = {
  [ChainId.NEONDEV]: 'https://puppynet.shibrpc.com',
}

export default NETWORK_URLS
