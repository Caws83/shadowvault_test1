import { dexs } from '../dex'
import hosts from '../hosts'
import tokens from '../tokens'
import { FarmConfig } from '../types'

const farmageddonFarms: FarmConfig[] = [
  // To keep organized IDs are from 0 - 999

  // POOL DO NOT REMOVE
  /*
  {
    id: 0,
    pid: 0,
    lpSymbol: 'MSWAP',
    lpAddresses: {
      719: '0xa7c94E9068496e2b0Ba51fa9C459312CB3F95634',
      109: '',
    },
    token: tokens.mswap,
    quoteToken: tokens.wbone,
    host: hosts.farmageddon,
    dex: dexs.marswap,
    isVisible: false,
    isForEmmissions: true,
  },
*/
  // NEWEST STUFF
  {
    id: 1,
    pid: 1,
    lpSymbol: 'zkCLMRS-zkCRO LP',
    lpAddresses: {
      388: "0x35b4cdab7e6bba1ad1ca217bea1fadfc84c90ca2",
    },
    token: tokens.zkclmrs,
    quoteToken: tokens.wcro,
    host: hosts.marswap,
    dex: dexs.marsCZK,
    isVisible: true,
    isForEmmissions: true,
    chainId: 388,
  },
  {
    id: 2,
    pid: 2,
    lpSymbol: 'vUSD-zkCRO LP',
    lpAddresses: {
      388: "0x7d95e8039df1551f8c3c7512e3931abd002bcec9",
    },
    token: tokens.vusd,
    quoteToken: tokens.wcro,
    host: hosts.marswap,
    dex: dexs.marsCZK,
    isVisible: true,
    isForEmmissions: false,
    chainId: 388,
  },
  {
    id: 3,
    pid: 3,
    lpSymbol: 'vETH-vUSD LP',
    lpAddresses: {
      388: "0xf186109de062bdea3d5c62efe7798836e92bdd1a",
    },
    token: tokens.veth,
    quoteToken: tokens.vusd,
    host: hosts.marswap,
    dex: dexs.marsCZK,
    isVisible: true,
    isForEmmissions: false,
    chainId: 388,
  },
  {
    id: 4,
    pid: 4,
    lpSymbol: 'vETH-zkCRO LP',
    lpAddresses: {
      388: "0x0084b4732a56111b3e93760319f524ce8017a2db",
    },
    token: tokens.veth,
    quoteToken: tokens.wcro,
    host: hosts.marswap,
    dex: dexs.marsCZK,
    isVisible: true,
    isForEmmissions: false,
    chainId: 388,
  },

  
  // TESTNET
  {
    id: 999,
    pid: 1,
    lpSymbol: 'zkCLMRS-zkCRO LP',
    lpAddresses: {
      282: "0x679406242E8CDEbe358bFDd6A0769B986D259459",
    },
    token: tokens.clrmrs,
    quoteToken: tokens.wcro,
    host: hosts.marstest,
    dex: dexs.marsCZKTest,
    isVisible: true,
    isForEmmissions: false,
    chainId: 282,
  },
  {
    id: 998,
    pid: 2,
    lpSymbol: 'vUSD-zkCRO LP',
    lpAddresses: {
      282: "0x6b7D935f18ebA130e604a4576CA85F5B1CD6B53C",
    },
    token: tokens.vusd,
    quoteToken: tokens.wcro,
    host: hosts.marstest,
    dex: dexs.marsCZKTest,
    isVisible: true,
    isForEmmissions: false,
    chainId: 282,
  },
 
]

export default farmageddonFarms
