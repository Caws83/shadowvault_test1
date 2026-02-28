import { BASE_URL } from 'config'
import { ChainId, Token } from 'sdk'

/*
export const WETH: { [chainId: number]: Token } = {
  [ChainId.CROZK]: new Token(ChainId.CROZK, '0x8eb8f79CaB3A1c02F9A0Fc33A8E792625D6a240', 18, 'WETH', 'Wrapped ETHER'),
  [ChainId.CRO]: new Token(ChainId.CRO, '0x898b3560affd6d955b1574d87ee09e46669c60ea', 18, 'WETH', 'Wrapped ETHER'),
}
*/

export const USDT: { [chainId: number]: Token } = {
  [ChainId.NEONDEV]: new Token(ChainId.NEONDEV, '0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5', 18, 'USDt', 'USDt'),
}



const tokens = {
  // BSC Testnet (tBNB)
  wbnb: {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    address: {
      56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      97: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    },
    decimals: 18,
    projectLink: 'https://www.binance.org',
  },
  // Sepolia
  wethSepolia: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: {
      11155111: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    },
    decimals: 18,
    projectLink: 'https://ethereum.org',
  },
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
      245022926: "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5",
    },
    decimals: 6,
    projectLink: "https://"
  },
 

  // just for chart knowledge
  usdForChat: {
    symbol: 'USD',
    name: 'USD',
    address: {
      97: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      11155111: "",
      245022926: "",
    },
    decimals: 6,
    projectLink: `${BASE_URL}`,
  },
  wNative: {
    symbol: 'NATIVE',
    name: 'native',
    address: {
      97: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
      11155111: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      245022926: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  }

}

export default tokens
