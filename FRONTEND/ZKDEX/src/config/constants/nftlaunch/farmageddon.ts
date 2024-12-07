import tokens from '../tokens'
import { NFTLaunchConfig } from '../types'

const farmageddonNFTLaunch: NFTLaunchConfig[] = [
  {
    nftCollectionId: 1,
    nftCollectionName: 'MSWAPF Lottery',
    contractAddress: {
      109: '0x60F5DC827a0fF7284013BC917CF3CD4Ba7348837',
    },
    payToken: tokens.mswap,
    chainId: 109,
  },
  {
    nftCollectionId: 8,
    nftCollectionName: 'THE KEKS',
    contractAddress: {
      109: '0xda0215AA1b321bdd870912DDe4f6F0695f0c95b0',
    },
    payToken: tokens.kek,
    chainId: 109,
  },
  {
    nftCollectionId: 7,
    nftCollectionName: 'NobleMen 贵族男士',
    contractAddress: {
      109: '0x27F9825c83b21ab9581a17E2A2725E2d2EC011E5',
    },
    payToken: tokens.mswap,
    chainId: 109,
  },
  {
    nftCollectionId: 2,
    nftCollectionName: 'Dazzling Fox',
    contractAddress: {
      109: '0x8722a0fCD1150E874B53083967EfFbF52cf514C7',
    },
    payToken: tokens.mswap,
    chainId: 109,
  },
  {
    nftCollectionId: 3,
    nftCollectionName: 'CryptoRebels',
    contractAddress: {
      109: '0x051a112e5b7d56d3825d9720d73ce147c6f08eb8',
    },
    payToken: tokens.mswap,
    chainId: 109,
  },
  {
    nftCollectionId: 4,
    nftCollectionName: 'Shiba Fawkes',
    contractAddress: {
      109: '0x2D591Cfa04900468c32D6bD83b332c2Aaad375Fd',
    },
    payToken: tokens.mswap,
    chainId: 109,
  },
  /*
  {
    nftCollectionId: 99999,
    nftCollectionName: 'MarswapTest',
    contractAddress: {
      97: '0x3aE76C77DCA8Ce674A3E8FA0f66D578Cefb04D2b',
    },
    payToken: tokens.wtbnb,
    chainId: 97,
  },
 */
]

export default farmageddonNFTLaunch
