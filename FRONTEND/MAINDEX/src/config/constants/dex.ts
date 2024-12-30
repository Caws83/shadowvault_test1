import { farmFactoryAbi } from 'config/abi/farmFactory'
import { pancakeFactoryAbi } from 'config/abi/pancakeFactory'
import { Dex } from './types'
import tokens from './tokens'

// add to dexList as bottom as well

export const dexs = {
  //cronosZK TEST
  forgeTest: {
    id: 'Forge Test',
    factory: {
      245022926: "", // div fac: ""
    },
    router: {
      245022926: "",
    },
    dexABI: farmFactoryAbi,
    allowTrade: true,
    factoryBase: tokens.clrmrs,
    info: {
      name: 'MARSWAP',
      lpname: 'MarsTEST LPs',
      factory: "",
      codeHash: "",
      numerator: 9990,
    },
    chainId: 245022926,
    isMars: true,
  }
}

export const dexList: Dex[] = [ 
  dexs.forgeTest,
 ]

 export const defaultDex = dexs.forgeTest
