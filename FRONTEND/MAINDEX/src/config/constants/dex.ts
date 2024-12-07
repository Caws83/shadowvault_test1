import { farmFactoryAbi } from 'config/abi/farmFactory'
import { pancakeFactoryAbi } from 'config/abi/pancakeFactory'
import { Dex } from './types'
import tokens from './tokens'

// add to dexList as bottom as well

export const dexs = {
  marsCZK: {
    id: 'MARS CROZK',
    factory: {
       388: "0xc547615d77b2d5c1add3d744342d8CB027873e82", // div fac: "0xB6FA98C38a1Ee369896fDfAf90306d827AC3B5b9"
    },
    router: {
     388: "0xdF5D7a26d0Da5636eF60CcFe493C13A1c0F37B9B",
    },
    dexABI: farmFactoryAbi,
    allowTrade: true,
    factoryBase: tokens.zkclmrs,
    info: {
      name: 'MARSWAP',
      lpname: 'Mars LPs',
      factory: "0xc547615d77b2d5c1add3d744342d8CB027873e82",
      codeHash: "0x0100066d128cb9857eb2abc0430fe0feff1ca4b9ab22f1af6cfda9e59fe57964",
      numerator: 9990,
    },
    chainId: 388,
    isMars: true,
  },
  h2f: {
    id: 'H2 FINANCE',
    factory: {
       388: "0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC", 
    },
    router: {
     388: "0x39aD8C3067281e60045DF041846EE01c1Dd3a853",
    },
    dexABI: farmFactoryAbi,
    allowTrade: true,
    factoryBase: tokens.wcro,
    info: {
      name: 'H2',
      lpname: 'H2 LPs',
      factory: "0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC",
      codeHash: "0x010003b769eff14077b08cfa578449069839b9ccb7e566601190f93592d4a6bc",
      numerator: 9970,
    },
    chainId: 388,
    isMars: false,
  },
  //cronosZK TEST
  marsCZKTest: {
    id: 'MARS CROZKT',
    factory: {
       282: "0x02936dE4fD09B7435E060Bb8733c41c88390BacF", // div fac: "0x5B120B58a702De57737599724E94206eA4Ff005b"
    },
    router: {
     282: "0xf532f287fE994e68281324C2e07426E2Fe7C7578",
    },
    dexABI: farmFactoryAbi,
    allowTrade: true,
    factoryBase: tokens.clrmrs,
    info: {
      name: 'MARSWAP',
      lpname: 'MarsTEST LPs',
      factory: "0x02936dE4fD09B7435E060Bb8733c41c88390BacF", // "0x375DA0314dDC5806694c73F14F9b7214E10ec553"
      codeHash: "0x0100066d9bcd1011a25573cfc57edce7f525c7a2a144e4e20d8798e3e399e576",
      numerator: 9990,
    },
    chainId: 282,
    isMars: true,
  }
}

// get codeHash from topic 0xc94722ff13eacf53547c4741dab5228353a05938ffcdd5d4a2d533ae0e618287 
export const dexList: Dex[] = [ 

  dexs.marsCZKTest,
  dexs.h2f,
  dexs.marsCZK,
  

 ]

 export const defaultDex = dexs.marsCZK
