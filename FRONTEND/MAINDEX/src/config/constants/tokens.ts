import { BASE_URL } from 'config'
import { ChainId, Token } from 'sdk'

/*
export const WETH: { [chainId: number]: Token } = {
  [ChainId.CROZK]: new Token(ChainId.CROZK, '0x8eb8f79CaB3A1c02F9A0Fc33A8E792625D6a240', 18, 'WETH', 'Wrapped ETHER'),
  [ChainId.CRO]: new Token(ChainId.CRO, '0x898b3560affd6d955b1574d87ee09e46669c60ea', 18, 'WETH', 'Wrapped ETHER'),
}
*/

export const USDT: { [chainId: number]: Token } = {
  [ChainId.NEONDEV]: new Token(ChainId.NEONDEV, '0xAA24A5A5E273EFAa64a960B28de6E27B87FfDFfc', 18, 'USDt', 'USDt'),
}



const tokens = {

// CRONOS 
wneon: {
  symbol: 'WNEON',
  name: 'Wrapped NEON',
  address: {
    245022926: '0x11adC2d986E334137b9ad0a0F290771F31e9517F',
  },
  decimals: 18,
  projectLink: `${BASE_URL}`,
},

  weth: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: {
      245022926: "0x90306D9492eB658e47A64Ef834e76c81A0242598",
    },
    decimals: 18,
    projectLink: 'https://www.shib.io',
  },
  usdt: {
    symbol: "USDt",
    name: "USD Tether",
    address: {
      245022926: "0xAA24A5A5E273EFAa64a960B28de6E27B87FfDFfc",
    },
    decimals: 18,
    projectLink: "https://"
  },
 

  // just for chart knowledge
  usdForChat: {
    symbol: 'USD',
    name: 'USD',
    address: {
      245022926: "",
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  },
  wNative: {
    symbol: 'NATIVE',
    name: 'native',
    address: {
      245022926: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  }

}

export default tokens
