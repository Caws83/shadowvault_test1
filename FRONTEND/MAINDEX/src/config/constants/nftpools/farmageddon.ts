import { dexs } from '../dex'
import hosts from '../hosts'
import tokens from '../tokens'
import { NFTPoolConfig } from '../types'

// nft pool factory 0x27be9F891317F36ea465885258a10528F4D0a005

const farmageddonNFTPools: NFTPoolConfig[] = [

  {
    nftCollectionId: 2,
    stakingToken: tokens.mswapltd,
    earningToken: [ tokens.shib ],
    contractAddress: {
      1: '0xC0730672cC2134C761AFb8443d779410834C04A1',
    },
    isFinished: false,
    host: hosts.farmageddon,
    dex: dexs.shibSwap,
    isVisible: true,
    chainId: 1,
  },
  {
    nftCollectionId: 3,
    stakingToken: tokens.shiboshi,
    earningToken: [ tokens.leash ],
    contractAddress: {
      1: '0x486faA9F1e5C99f267e1Ff933D37f8F1a3718654',
    },
    isFinished: false,
    host: hosts.farmageddon,
    dex: dexs.shibSwap,
    isVisible: true,
    chainId: 1,
  },
 
]

export default farmageddonNFTPools
