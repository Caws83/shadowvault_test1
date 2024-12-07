import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import { infoChefAbi } from 'config/abi/infoChef'
import { BigNumber } from 'bignumber.js'
import { PoolCategory, PoolConfig } from '../types'
import contracts from '../contracts'
import hosts from '../hosts'
import { dexs } from '../dex'
import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const manual: PoolConfig[] = []

const testPools = async () => {
  const start = 700001
  const dex = dexs.pcsTest
  const chainId = dex.chainId
  const factory = getAddress(contracts.poolFactoryV3, chainId)
  const host = hosts.community
  const publicClient = createPublicClient({ 
    chain: bscTestnet,
    transport: http()
  })


  try {
    
 
    const info = await publicClient.readContract({address: getInfoChefaddress(chainId), abi: infoChefAbi, functionName: "getPoolInfo", args: [factory]})
    if(info[0].length === 0) return []
    const PoolInfo: PoolConfig[] = []
    for (let i = 0; i < info[0].length; i++) {
      PoolInfo.push({
        sousId: start + i,
        contractAddress: {
            [chainId]: `${info[0][i]}`,
        },
        earningToken: {
          symbol: `${info[7][i]}`,
          name: `${info[7][i]}`,
          address: {
            [chainId]: `${info[5][i]}`,
          },
          decimals: new BigNumber(info[8][i].toString()).toNumber(),
          projectLink: '',
        },
        stakingToken: {
          symbol: `${info[3][i]}`,
          name: `${info[2][i]}`,
          address: {
            [chainId]: `${info[1][i]}`,
          },
          decimals: new BigNumber(info[4][i].toString()).toNumber(),
          projectLink: '',
        },
        poolCategory: PoolCategory.COMMUNITY,
        harvest: true,
        sortOrder: 2,
        isFinished: false,
        host,
        dex,
        isRenew: true,
        isV3: true,
        chainId,
      })
    }
    const reversedPools = PoolInfo.slice().reverse()

    return manual.concat(reversedPools)
  } catch (err) {
    console.log((err as Error).message)
    console.info('Error getting info.')
    return []
  }
}

export default testPools
