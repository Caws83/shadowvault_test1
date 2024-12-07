
import { dexs } from '../dex'
import hosts from '../hosts'
import tokens from '../tokens'
import { PoolCategory, PoolConfig } from '../types'

// start with a 1

const farmageddonPools: PoolConfig[] = [
  
  {
    sousId: 0,
    pid: 0,
    stakingToken: tokens.zkclmrs,
    earningToken: tokens.zkclmrs,
    contractAddress: {
      388: '0x7A97150ceA7B10FF1A2698EDdAA350e88Dac04ac',
    },
    poolCategory: PoolCategory.SINGLE,
    harvest: true,
    sortOrder: 1,
    isFinished: false,
    host: hosts.marswap,
    dex: dexs.marsCZK,
    chainId: 388,
  },
  {
    sousId: 1,
    pid: 0,
    stakingToken: tokens.clrmrs,
    earningToken: tokens.clrmrs,
    contractAddress: {
      282: '0xC64D5bbf42e584Ec8ba9D681560147c2EC0C2212',
    },
    poolCategory: PoolCategory.SINGLE,
    harvest: true,
    sortOrder: 2,
    isFinished: false,
    host: hosts.marstest,
    dex: dexs.marsCZKTest,
    chainId: 282,
  },
  
/*
  // Regular pools below
  // go below ========================================================

  {
    sousId: 1,
    earningToken: tokens.clrmrs,
    stakingToken: tokens.clrmrs,
    contractAddress: {
      25: '0xB4e5f9AA0774681aaA78265E5DA336B2b4f7384e', // SOUSCHEF ADDRESS
    },
    poolCategory: PoolCategory.COMMUNITY,
    harvest: true,
    sortOrder: 2,
    isFinished: false,
    host: hosts.cronos,
    dex: dexs.crodex,
    isRenew: true,
    chainId: 25,
  },
  */
]

export default farmageddonPools
