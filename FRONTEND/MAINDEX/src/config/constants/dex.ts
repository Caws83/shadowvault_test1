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
      245022926: "0x3708BcD02Cb4540ddb733C9ceD6303AB7577943f", // div fac: ""
    },
    router: {
      245022926: "0x44E38a1A4E00592a4CC24D7E50b475B823F7cEdD",
    },
    dexABI: farmFactoryAbi,
    allowTrade: true,
    factoryBase: tokens.wneon,
    info: {
      name: 'Forge',
      lpname: 'ForgeTest LPs',
      factory: "0x3708BcD02Cb4540ddb733C9ceD6303AB7577943f",
      codeHash: "0x5ae7f91854eca2fc4ce52df27a29d91820b723f8c4fb9214b22db72e7a6e5230",
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
