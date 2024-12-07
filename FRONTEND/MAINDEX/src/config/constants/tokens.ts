import { BASE_URL } from 'config'
import { ChainId, Token } from 'sdk'

/*
export const WETH: { [chainId: number]: Token } = {
  [ChainId.CROZK]: new Token(ChainId.CROZK, '0x8eb8f79CaB3A1c02F9A0Fc33A8E792625D6a240', 18, 'WETH', 'Wrapped ETHER'),
  [ChainId.CRO]: new Token(ChainId.CRO, '0x898b3560affd6d955b1574d87ee09e46669c60ea', 18, 'WETH', 'Wrapped ETHER'),
}
*/

export const USDT: { [chainId: number]: Token } = {
  [ChainId.CROZKT]: new Token(ChainId.CROZKT, '0x3e6f8fbcC20a4F470D232cEA9d44C8Df5d2a3c83', 18, 'vUSD', 'vUSD'),
  [ChainId.CRO]: new Token(ChainId.CRO, '0x5b91e29Ae5A71d9052620Acb813d5aC25eC7a4A2', 18, 'vUSD', 'vUSD') // vUSD
}



const tokens = {

// CRONOS 
wcro: {
  symbol: 'WCRO',
  name: 'Wrapped zkCRO',
  address: {
    282: '0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742',
    388: '0xC1bF55EE54E16229d9b369a5502Bfe5fC9F20b6d',
  },
  decimals: 18,
  projectLink: `${BASE_URL}`,
},

zkclmrs: {
  symbol: 'zkCLMRS',
  name: 'Crolon Mars',
  address: {
    388: '0x447A1296AB0b8470d90a74bb90d36Aff9B3a2EbA',
    282: "0xD640668a3D7194968b98553028BB36313B985Ead",
  },
  decimals: 18,
  projectLink: `${BASE_URL}`,
},

  weth: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: {
      282: "0x4200000000000000000000000000000000000006",
      388: '0x898b3560affd6d955b1574d87ee09e46669c60ea',
    },
    decimals: 18,
    projectLink: 'https://www.shib.io',
  },
 

  vusd: {
    symbol: 'vUSD',
    name: 'Veno USD',
    address: {
      282: "0x3e6f8fbcC20a4F470D232cEA9d44C8Df5d2a3c83",
      388: '0x5b91e29Ae5A71d9052620Acb813d5aC25eC7a4A2',
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  },
  veth: {
    symbol: 'vETH',
    name: 'Veno ETH',
    address: {
      388: '0x271602A97027ee1dd03b1E6e5dB153eB659A80b1',
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  },

 // testnet
  clrmrs: {
    symbol: 'zkTCLMRS',
    name: 'Crolon Mars',
    address: {
      282: "0xD640668a3D7194968b98553028BB36313B985Ead",
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  },


  // just for chart knowledge
  usdForChat: {
    symbol: 'USD',
    name: 'USD',
    address: {
      282: "",
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  },
  wNative: {
    symbol: 'NATIVE',
    name: 'native',
    address: {
      282: "0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742",
      388: '0xC1bF55EE54E16229d9b369a5502Bfe5fC9F20b6d',
    },
    decimals: 18,
    projectLink: `${BASE_URL}`,
  }

}

export default tokens
