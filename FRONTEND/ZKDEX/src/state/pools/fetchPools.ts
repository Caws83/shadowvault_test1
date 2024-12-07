import pools from 'config/constants/pools'
import { sousChefAbi } from 'config/abi/sousChef'
import { sousChefNewAbi } from 'config/abi/sousChefNew'
import { cakeAbi } from 'config/abi/cake'
import { wethAbi } from 'config/abi/weth'
import { getAddress, getWrappedAddress } from 'utils/addressHelpers'
import { PoolCategory, PoolConfig } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { readContract, readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'

export const fetchPoolsBlockLimits = async () => {
  const poolsConfig = await pools()
  const poolsWithEnd = poolsConfig.filter((p) => p.poolCategory !== PoolCategory.SINGLE)

  const callsStartBlock = poolsWithEnd.map((poolConfig) => {
    return {
      abi: sousChefAbi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'startBlock',
      chainId: poolConfig.chainId,
    }
  })
  const callsEndBlock = poolsWithEnd.map((poolConfig) => {
    return {
      abi: sousChefAbi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'bonusEndBlock',
      chainId: poolConfig.chainId,
    }
  })

  const starts = await readContracts(config, { contracts: callsStartBlock })
  const ends = await readContracts(config, { contracts: callsEndBlock })

  return poolsWithEnd.map((cakePoolConfig, index) => {
    const startBlock = new BigNumber(starts[index].result.toString())
    const endBlock = new BigNumber(ends[index].result.toString())
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock.toJSON(),
      endBlock: endBlock.toJSON(),
    }
  })
}

export const fetchPoolsTotalStaking = async () => {
  const poolsConfig = await pools()
  const newPools = poolsConfig.filter((p) => p.isRenew)
  const nonBnbPools = poolsConfig.filter((p) => p.stakingToken.symbol !== 'zkCRO' && p.isRenew !== true)
  const bnbPool = poolsConfig.filter((p) => p.stakingToken.symbol === 'zkCRO' && p.isRenew !== true)

  const callsNonBnbPools = nonBnbPools.map((poolConfig) => {
    return {
      abi: cakeAbi,
      address: getAddress(poolConfig.stakingToken.address, poolConfig.chainId),
      functionName: 'balanceOf',
      args: [getAddress(poolConfig.contractAddress, poolConfig.chainId)],
      chainId: poolConfig.chainId,
    }
  })

  const callsBnbPools = bnbPool.map((poolConfig) => {
    return {
      abi: wethAbi,
      address: getWrappedAddress(poolConfig.chainId),
      functionName: 'balanceOf',
      args: [getAddress(poolConfig.contractAddress, poolConfig.chainId)],
      chainId: poolConfig.chainId,
    }
  })

  const callsNewPools = newPools.map((poolConfig) => {
    return {
      abi: sousChefNewAbi,
      address: getAddress(poolConfig.contractAddress, poolConfig.chainId),
      functionName: 'totalStaked',
      chainId: poolConfig.chainId,
    }
  })

  const newPoolsTotalStaked = await readContracts(config, { contracts: callsNewPools })
  const nonBnbPoolsTotalStaked = await readContracts(config, { contracts: callsNonBnbPools })
  const bnbPoolsTotalStaked = await readContracts(config, { contracts: callsBnbPools })

  return [
    ...nonBnbPools.map((p, index) => ({
      sousId: p.sousId,
      totalStaked: new BigNumber((nonBnbPoolsTotalStaked[index].result as bigint).toString()).toJSON(),
    })),
    ...bnbPool.map((p, index) => ({
      sousId: p.sousId,
      totalStaked: new BigNumber((bnbPoolsTotalStaked[index].result as bigint).toString()).toJSON(),
    })),
    ...newPools.map((p, index) => ({
      sousId: p.sousId,
      totalStaked: new BigNumber((newPoolsTotalStaked[index].result as bigint).toString()).toJSON(),
    })),
  ]
}

export const fetchPoolStakingLimit = async (sousId: number, poolsConfig: PoolConfig[]): Promise<string> => {
  try {
    const config1 = poolsConfig.find((pool) => pool.sousId === sousId)
    const stakingLimit = readContract(config, {
      address: getAddress(config1.contractAddress, config1.chainId),
      abi: sousChefNewAbi,
      functionName: 'poolLimitPerUser',
      chainId: config1.chainId,
    })
    return new BigNumber(stakingLimit.toString()).toJSON()
  } catch (error) {
    return '0'
  }
}

export const fetchPoolsStakingLimits = async (poolsWithStakingLimit: number[]): Promise<{ [key: string]: string }> => {
  const poolsConfig = await pools()
  const validPools = poolsConfig
    .filter((p) => p.poolCategory !==  PoolCategory.SINGLE)
    .filter((p) => p.stakingToken.symbol !== 'zkCRO' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

  // Get the staking limit for each valid pool
  // Note: We cannot batch the calls via multicall because V1 pools do not have "poolLimitPerUser" and will throw an error
  const stakingLimitPromises = validPools.map((validPool) => fetchPoolStakingLimit(validPool.sousId, poolsConfig))
  const stakingLimits = await Promise.all(stakingLimitPromises)

  return stakingLimits.reduce((accum, stakingLimit, index) => {
    return {
      ...accum,
      [validPools[index].sousId]: stakingLimit,
    }
  }, {})
}
