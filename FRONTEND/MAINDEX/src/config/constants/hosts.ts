import { masterChefAbi } from 'config/abi/masterchef'
import { lockerMasterChefAbi } from 'config/abi/lockerMasterChefAbi'
import { dexs } from './dex'
import tokens from './tokens'

const hosts = {
  
  marswap: {
    name: 'MARSWAP',
    masterChef: {
      388: '0x7A97150ceA7B10FF1A2698EDdAA350e88Dac04ac', // 0x6B19CC3DE7b71015bc74816CcEA9Cf21c26eF08e syrup
    },
    payoutToken: tokens.zkclmrs,
    hasLeaveStaking: true,
    requiresExtraBool: false,
    requiresReferral: false,
    dex: dexs.marsCZK,
    chefAbi: masterChefAbi,
    pendingCall: 'pendingCake',
    rewardCall: 'cakePerBlock',
    allocCall: 'totalAllocPoint',
    priceId: 1,
    chainId: 388,
    isLocker: false,
  },
  
  marstest: {
    name: 'T-MARSWAP',
    masterChef: {
      282: '0xC64D5bbf42e584Ec8ba9D681560147c2EC0C2212', // 0x94D1f631Df8C28b18A9D337c9a51530DB0431252 syrup
    },
    payoutToken: tokens.clrmrs,
    hasLeaveStaking: true,
    requiresExtraBool: false,
    requiresReferral: false,
    dex: dexs.marsCZKTest,
    chefAbi: masterChefAbi,
    pendingCall: 'pendingCake',
    rewardCall: 'cakePerBlock',
    allocCall: 'totalAllocPoint',
    priceId: 999,
    chainId: 282,
    isLocker: false,
  },
 
 
}

export default hosts
