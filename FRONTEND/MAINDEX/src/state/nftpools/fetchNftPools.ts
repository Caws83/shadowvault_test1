import { getAddress } from 'utils/addressHelpers'
import { Host, NFTPoolConfig } from 'config/constants/types'
import { BigNumber } from 'bignumber.js'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import nftPools from 'config/constants/nftpools'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'


export const fetchNftPoolsPublicInfoByHost = async (host: Host, blockNumber: bigint) => {
  const nftpools = await nftPools()
  const filteredPools = nftpools.filter((p) => p.host === host)
  const callInfo = filteredPools.map((p) => {
    return {
      address: getAddress(p.contractAddress, p.chainId),
      abi: nftPoolV2Abi,
      functionName: 'getMainPoolInfo',
      chainId: p.chainId as number
    }
  })
  const info = await readContracts(config, { contracts: callInfo })
  return filteredPools.map((p, index) => {
    let { isFinished } = p
    const data = info[index].result
    if (isFinished === undefined || isFinished === false) {
      if (new BigNumber(data[3].toString()).lt(blockNumber.toString())) {
        isFinished = true
      }
    }
    return {
      nftCollectionId: p.nftCollectionId,
      rewardPerBlock: data[0].toString(),
      totalStaked: data[1].toString(),
      startBlock: data[2].toString(),
      endBlock: data[3].toString(),
      isFinished,
    }
  })
}

export const fetchNftPoolsBlockLimits = async () => {
  const nftpools = await nftPools()
  const callsStartBlock = nftpools.map((poolConfig) => {
    return {
      abi: nftPoolV2Abi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'startBlock',
      chainId: poolConfig.chainId
    }
  })
  const callsEndBlock = nftpools.map((poolConfig) => {
    return {
      abi: nftPoolV2Abi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'bonusEndBlock',
      chainId: poolConfig.chainId
    }
  })

  const starts = await readContracts(config, { contracts: callsStartBlock })
  const ends = await readContracts(config, { contracts: callsEndBlock })

  return nftpools.map((cakePoolConfig, index) => {
    const startBlock = starts[index].result
    const endBlock = ends[index].result
    return {
      nftCollectionId: cakePoolConfig.nftCollectionId,
      startBlock: Number(startBlock),
      endBlock: Number(endBlock),
    }
  })
}

export const fetchNftPoolTotalStakingForPool = async (nftCollectionId) => {
  const nftpools = await nftPools()
  const poolInfo = nftpools.find((nftpool) => nftpool.nftCollectionId === nftCollectionId)
  const info = await readContract(config, {
    address: getAddress(poolInfo.contractAddress, poolInfo.chainId),
    abi: nftPoolV2Abi,
    functionName: 'totalStaked',
    chainId: poolInfo.chainId
  })
  return info.toString()
}

export const fetchNftPoolsTotalStaking = async () => {
  const nftpools = await nftPools()
  const callsNftPools = nftpools.map((poolConfig) => {
    return {
      abi: nftPoolV2Abi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'totalStaked',
      chainId: poolConfig.chainId
    }
  })

  const nftPoolsTotalStakes = await readContracts(config, { contracts: callsNftPools })
  return [
    ...nftpools.map((p, index) => ({
      nftCollectionId: p.nftCollectionId,
      totalStaked: nftPoolsTotalStakes[index].result.toString(),
    })),
  ]
}

export const fetchNftPoolStakingLimit = async (nftCollectionId: number, nftpools: NFTPoolConfig[]): Promise<string> => {
  try {
    const poolInfo = nftpools.find((nftpool) => nftpool.nftCollectionId === nftCollectionId)
    const stakingLimit = readContract(config, {
      address: getAddress(poolInfo.contractAddress, poolInfo.chainId),
      abi: nftPoolV2Abi,
      functionName: 'poolLimitPerUser',
      chainId: poolInfo.chainId
    }) as Promise<string>
    return stakingLimit
  } catch (error) {
    return "0"
  }
}

export const fetchNftPoolsStakingLimits = async (
  poolsWithStakingLimit: number[],
): Promise<{ [key: string]: bigint }> => {
  const nftpools = await nftPools()
  const validPools = nftpools
    .filter((p) => p.stakingToken.symbol !== 'zkCRO' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.nftCollectionId))

  // Get the staking limit for each valid pool
  // Note: We cannot batch the calls via multicall because V1 pools do not have "poolLimitPerUser" and will throw an error
  const stakingLimitPromises = validPools.map((validPool) => fetchNftPoolStakingLimit(validPool.nftCollectionId, nftpools))
  const stakingLimits = await Promise.all(stakingLimitPromises)

  return stakingLimits.reduce((accum, stakingLimit, index) => {
    return {
      ...accum,
      [validPools[index].nftCollectionId]: stakingLimit.toString(),
    }
  }, {})
}
