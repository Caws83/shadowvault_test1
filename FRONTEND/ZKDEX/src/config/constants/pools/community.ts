import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import { infoChefAbi } from 'config/abi/infoChef'
import { BigNumber } from 'bignumber.js'
import { PoolCategory, PoolConfig } from '../types'
import contracts from '../contracts'
import hosts from '../hosts'
import { dexs } from '../dex'
import { createPublicClient, http } from 'viem'
import { shibarium } from 'viem/chains';
import getSocials from 'config/constants/socials'


const blackList = [
  '0xf5E8C9DF39f85775F6614E4AFD11778174e2CcDf',
  '0xc255Af7b31027D190a5d024657Ec19c76dc5cc1F',
  '0x0811bdE3f319c9b326ca9c805Ec58C3b5A4DB555',
]

const isBlacklisted = (address) => {
  for(let i=0; i<blackList.length; i++) {
    if(address === blackList[i]) return true
  }
  return false
}

const manual: PoolConfig[] = []

const community = async () => {
  const start = 100001
  const dex = dexs.marswap
  const chainId = dex.chainId
  const factory = getAddress(contracts.poolFactory, chainId)
  const host = hosts.community
  const publicClient = createPublicClient({ 
    chain: shibarium,
    transport: http()
  })
  try {
    
    const info = await publicClient.readContract({address: getInfoChefaddress(chainId), abi: infoChefAbi, functionName: "getPoolInfo", args: [factory]})
    
    const PoolInfo: PoolConfig[] = []
    if(info[0].length === 0) return []
    for (let i = 0; i < info[0].length; i++) {
      if(!isBlacklisted(info[0][i])) {
 
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
          projectLink: getSocials(chainId, info[5][i].toString()),
        },
        stakingToken: {
          symbol: `${info[3][i]}`,
          name: `${info[2][i]}`,
          address: {
            [chainId]: `${info[1][i]}`,
          },
          decimals: new BigNumber(info[4][i].toString()).toNumber(),
          projectLink: getSocials(chainId, info[1][i].toString()),
        },
        poolCategory: PoolCategory.COMMUNITY,
        harvest: true,
        sortOrder: 2,
        isFinished: false,
        host,
        dex,
        isRenew: true,
        chainId,
      })
    }}

    const reversedPools = PoolInfo.slice().reverse()

    return manual.concat(reversedPools)
  } catch (err) {
    console.log((err as Error).message)
    console.info('Error getting info.')
    return []
  }
}

export default community
