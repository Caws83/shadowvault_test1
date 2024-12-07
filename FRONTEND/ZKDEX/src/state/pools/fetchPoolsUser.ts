import pools from 'config/constants/pools'
import { sousChefAbi } from 'config/abi/sousChef'
import { masterChefAbi } from 'config/abi/masterchef'
import { getAddress } from 'utils/addressHelpers'
import { Host, PoolCategory } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { Address } from 'viem'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import { readContracts, readContract, getBalance } from '@wagmi/core'


// Pool 0, Cake / Cake is a different kind of contract (master chef)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
let poolsConfig = []
let nonBnbPools = []
let bnbPools = []
let nonMasterPools = []
let masterPools = []
let manualFrt = []
let manualCake = []

// Define an async function to fetch and set the pools data
const fetchPoolsData = async () => {
  poolsConfig = await pools()
  if (poolsConfig.length > 0) {
    nonBnbPools = poolsConfig.filter((p) => p.stakingToken?.symbol !== 'WCRO')
    bnbPools = poolsConfig.filter((p) => p.stakingToken?.symbol === 'WCRO')
    nonMasterPools = poolsConfig.filter((p) => p.poolCategory !== PoolCategory.SINGLE)
    masterPools = poolsConfig.filter((p) => p.poolCategory === PoolCategory.SINGLE)
    manualFrt = poolsConfig.filter((p) => p.sousId === 0)
    manualCake = poolsConfig.filter((p) => p.sousId === 2)
  }
}

fetchPoolsData()

export const fetchPoolsAllowanceByHost = async (account, host: Host) => {
  const filteredPools = nonBnbPools.filter((pool) => pool.host === host)
  const calls = filteredPools.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'allowance',
    args: [account as Address, getAddress(p.contractAddress, p.chainId)],
    chainId: p.chainId as number,
  }))

  const allowances = await readContracts(config, { contracts: calls })
  return filteredPools.reduce(
    (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index].result.toString()).toJSON() }),
    {},
  )
}

export const fetchPoolsAllowance = async (account) => {
  const calls = nonBnbPools.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'allowance',
    args: [account as Address, getAddress(p.contractAddress, p.chainId)],
    chainId: p.chainId,
  }))

  const allowances = await readContracts(config, { contracts: calls })
  return nonBnbPools.reduce(
    (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index].result.toString()).toJSON() }),
    {},
  )
}

export const fetchUserBalancesByHost = async (account, host: Host) => {
  const filteredPools = nonBnbPools.filter((pool) => pool.host === host)
  // Non BNB pools
  const calls = filteredPools.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'balanceOf',
    args: [account as Address],
    chainId: p.chainId,
  }))
  const tokenBalancesRaw = await readContracts(config, { contracts: calls })
  const tokenBalances = filteredPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(tokenBalancesRaw[index].result.toString()).toJSON(),
    }),
    {},
  )

  // BNB pools
  const bnbBalance = await getBalance(config, {
    address: account,
  })

  const bnbBalances = bnbPools.reduce(
    (acc, pool) => ({ ...acc, [pool.sousId]: new BigNumber(bnbBalance.toString()).toJSON() }),
    {},
  )
  

  return { ...tokenBalances, ...bnbBalances }
}

export const fetchUserBalances = async (account) => {
  // Non BNB pools
  const calls = nonBnbPools.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'balanceOf',
    args: [account as Address],
    chainId: p.chainId,
  }))
  const tokenBalancesRaw = await readContracts(config, { contracts: calls })
  const tokenBalances = nonBnbPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(tokenBalancesRaw[index].result.toString()).toJSON(),
    }),
    {},
  )

  // BNB pools
  const bnbBalance = await getBalance(config, {
    address: account,
  })
  const bnbBalances = bnbPools.reduce(
    (acc, pool) => ({ ...acc, [pool.sousId]: new BigNumber(bnbBalance.toString()).toJSON() }),
    {},
  )

  return { ...tokenBalances, ...bnbBalances }
}

export const fetchUserStakeBalancesByHost = async (account, host) => {
  const filteredPools = nonMasterPools.filter((pool) => pool.host === host)
  const calls = filteredPools.map((p) => ({
    abi: sousChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'userInfo',
    args: [account],
    chainId: p.chainId,
  }))
  const userInfo = await readContracts(config, { contracts: calls })
  const stakedBalances = filteredPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userInfo[index].result[0].toString()).toJSON(),
    }),
    {},
  )

  const filteredPools2 = masterPools.filter((pool) => pool.host === host)
  const calls2 = filteredPools2.map((p) => ({
    abi: masterChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'userInfo',
    args: [p.pid, account],
    chainId: p.chainId,
  }))
  const userInfo2 = await readContracts(config, { contracts: calls2 })
  const stakedBalances2 = filteredPools2.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userInfo2[index].result.toString()).toJSON(),
    }),
    {},
  )
  return { ...stakedBalances, ...stakedBalances2 }
}

export const fetchUserStakeBalances = async (account) => {
  const calls = nonMasterPools.map((p) => ({
    abi: sousChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'userInfo',
    args: [account],
    chainId: p.chainId,
  }))
  const userInfo = await readContracts(config, { contracts: calls })
  const stakedBalances = nonMasterPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userInfo[index].result[0].toString()).toJSON(),
    }),
    {},
  )

  const calls2 = masterPools.map((p) => ({
    abi: masterChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'userInfo',
    args: [p.pid, account],
    chainId: p.chainId,
  }))
  const userInfo2 = await readContracts(config, { contracts: calls2 })
  const stakedBalances2 = masterPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userInfo2[index].result[0].toString()).toJSON(),
    }),
    {},
  )
  return { ...stakedBalances, ...stakedBalances2 }
}

export const fetchUserPendingRewardsByHost = async (account, host) => {
  const filteredPools = nonMasterPools.filter((p) => p.host === host)
  const calls = filteredPools.map((p) => ({
    abi: sousChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'pendingReward',
    args: [account],
    chainId: p.chainId,
  }))
  const res = await readContracts(config, { contracts: calls })

  const pendingRewards = filteredPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(res[index].result.toString()).toJSON(),
    }),
    {},
  )

  const filteredPools2 = masterPools.filter((p) => p.host === host)
  const calls2 = filteredPools2.map((p) => ({
    abi: masterChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: p.host.pendingCall,
    args: [p.pid, account],
    chainId: p.chainId,
  }))
  const res2 = await readContracts(config, { contracts: calls2 })
  const pendingRewards2 = filteredPools2.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(res2[index].result.toString()).toJSON(),
    }),
    {},
  )
  return { ...pendingRewards, ...pendingRewards2 }
}

export const fetchUserPendingRewards = async (account) => {
  const calls = nonMasterPools.map((p) => ({
    abi: sousChefAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'pendingReward',
    args: [account],
    chainId: p.chainId,
  }))
  const res = await readContracts(config, { contracts: calls })
  const pendingRewards = nonMasterPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(res[index].result.toString()).toJSON(),
    }),
    {},
  )
  const cakePending = await Promise.all(
    manualCake.map(async (p) => {
      const pendingCake = await readContract(config, {
        abi: p.host.chefAbi,
        address: getAddress(p.host.masterChef, p.chainId),
        functionName: 'pendingCake',
        args: [0n, account],
        chainId: p.chainId,
      })
      return new BigNumber(pendingCake.toString()).toJSON()
    }),
  )

  const frtPending = await Promise.all(
    manualFrt.map(async (p) => {
      const pendingCake = await readContract(config,  {
        abi: p.host.chefAbi,
        address: getAddress(p.host.masterChef, p.chainId),
        functionName: 'pendingCake',
        args: [0n, account],
        chainId: p.chainId,
      })

      return new BigNumber(pendingCake.toString()).toJSON()
    }),
  )

  return {
    ...pendingRewards,
    0: frtPending,
    2: cakePending,
  }
}
