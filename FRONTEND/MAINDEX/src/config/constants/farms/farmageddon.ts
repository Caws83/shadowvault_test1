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

 
]

export default farmageddonFarms
