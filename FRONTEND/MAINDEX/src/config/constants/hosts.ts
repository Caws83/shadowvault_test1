import { masterChefAbi } from 'config/abi/masterchef'
import { lockerMasterChefAbi } from 'config/abi/lockerMasterChefAbi'
import { dexs } from './dex'
import tokens from './tokens'

const hosts = {
  
  forgeTest: {
    name: 'T-FORGE',
    masterChef: {
      245022926: '0xC64D5bbf42e584Ec8ba9D681560147c2EC0C2212', // 0x94D1f631Df8C28b18A9D337c9a51530DB0431252 syrup
    },
    payoutToken: tokens.wneon,
    hasLeaveStaking: true,
    requiresExtraBool: false,
    requiresReferral: false,
    dex: dexs.forgeTest,
    chefAbi: masterChefAbi,
    pendingCall: 'pendingCake',
    rewardCall: 'cakePerBlock',
    allocCall: 'totalAllocPoint',
    priceId: 999,
    chainId: 245022926,
    isLocker: false,
  },
 
 
}

export default hosts
