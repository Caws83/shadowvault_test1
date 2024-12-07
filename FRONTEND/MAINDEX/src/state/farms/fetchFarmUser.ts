import { getAddress } from 'utils/addressHelpers'
import { FarmConfig } from 'config/constants/types'
import { Abi } from 'viem'
import BigNumber from 'bignumber.js'
import { lpTokenAbi } from 'config/abi/lpToken'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Address } from 'viem'
import { config } from 'wagmiConfig'
import { readContracts } from '@wagmi/core'

export const fetchFarmUserAllowances = async (account: string, farmsToFetch: FarmConfig[]) => {
  const calls = farmsToFetch.map((farm) => {
    const masterChefAddress = getAddress(farm.host.masterChef, farm.chainId)
    const lpContractAddress = getAddress(farm.lpAddresses, farm.chainId)
    return { abi: ERC20_ABI, address: lpContractAddress, functionName: 'allowance', chainId: farm.chainId, args: [account as Address, masterChefAddress] }
  })
  const rawLpAllowances = await readContracts(config, { contracts: calls })
  const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
    return new BigNumber((lpBalance.result as bigint).toString()).toJSON()
  })
  return parsedLpAllowances
}

export const fetchFarmUserTokenBalances = async (account: string, farmsToFetch: FarmConfig[]) => {
  const calls = farmsToFetch.map((farm) => {
    const lpContractAddress = getAddress(farm.lpAddresses, farm.chainId)
    return {
      abi: lpTokenAbi,
      address: lpContractAddress,
      functionName: 'balanceOf',
      args: [account],
      chainId: farm.chainId
    }
  })

  const rawTokenBalances = await readContracts(config, { contracts: calls })
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
    return new BigNumber((tokenBalance.result as bigint).toString()).toJSON()
  })
  return parsedTokenBalances
}

export const fetchFarmUserStakedBalances = async (account: string, farmsToFetch: FarmConfig[]) => {
  const calls: {
    [name: string]: { abi: Abi; address: `0x${string}`; functionName: string; chainId: number; args: any[] }[]
  } = {}
  farmsToFetch.forEach((farm) => {
    if (calls[farm.host.name] == undefined) {
      calls[farm.host.name] = []
    }
    calls[farm.host.name].push({
      abi: farm.host.chefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: 'userInfo',
      args: [farm.pid, account as Address],
      chainId: farm.chainId
    })
  })
  const callRes: { [name: string]: any } = {}
  const rawStakedBalances = []
  await Promise.all(
    Object.keys(calls).map(async (hostKey) => {
      if (callRes[hostKey] === undefined) {
        callRes[hostKey] = []
      }
      const hostCalls = calls[hostKey]
      callRes[hostKey] = await readContracts(config, { contracts: hostCalls })
    }),
  )
  const indexes: { [name: string]: number } = {}
  farmsToFetch.forEach((farm) => {
    const hostKey = farm.host.name
    if (indexes[hostKey] === undefined) {
      indexes[hostKey] = 0
    }
    const balance = callRes[hostKey][indexes[hostKey]]
    rawStakedBalances.push(balance)
    indexes[hostKey]++
  })
  const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
    return new BigNumber((stakedBalance.result[0] as bigint).toString()).toJSON()
  })
  return parsedStakedBalances
}

export const fetchFarmUserEarnings = async (account: string, farmsToFetch: FarmConfig[]) => {
  const calls: {
    [name: string]: { abi: Abi; address: `0x${string}`; functionName: string; chainId: number; args: any[] }[]
  } = {}

  farmsToFetch.forEach((farm) => {
    const hostKey = farm.host.name
    if (calls[hostKey] === undefined) {
      calls[hostKey] = []
    }
    calls[hostKey].push({
      abi: farm.host.chefAbi,
      address: getAddress(farm.host.masterChef, farm.chainId),
      functionName: farm.host.pendingCall,
      args: [farm.pid, account],
      chainId: farm.chainId
    })
  })
  const callRes: { [name: string]: any } = {}
  const rawEarnings = []
  await Promise.all(
    Object.keys(calls).map(async (hostKey) => {
      if (callRes[hostKey] === undefined) {
        callRes[hostKey] = []
      }
      const hostCalls = calls[hostKey]
      callRes[hostKey] = await readContracts(config, { contracts: hostCalls })
    }),
  )
  const indexes: { [symbol: string]: number } = {}
  farmsToFetch.forEach((farm) => {
    const hostKey = farm.host.name
    if (indexes[hostKey] === undefined) {
      indexes[hostKey] = 0
    }
    const balance = callRes[hostKey][indexes[hostKey]]
    rawEarnings.push(balance)
    indexes[hostKey]++
  })

  const parsedEarnings = rawEarnings.map((earnings) => {
   // const earned = earnings.result ?? 0n
    return new BigNumber((earnings.result as bigint).toString()).toJSON()
  })
  return parsedEarnings
}
