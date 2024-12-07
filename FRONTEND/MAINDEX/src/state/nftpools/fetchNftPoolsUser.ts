import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import { Host } from 'config/constants/types'
import nftPools from 'config/constants/nftpools'
import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

export const fetchNftPoolsApprovedByHost = async (account, host: Host) => {
  const nftpools = await nftPools()

  const filteredPools = nftpools.filter((pool) => pool.host === host)
  const calls = filteredPools.map((p) => ({
    abi: nftCollectionAbi,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'isApprovedForAll',
    args: [account, getAddress(p.contractAddress, p.chainId)],
    chainId: p.chainId
  }))

  const approvals = await readContracts(config, { contracts: calls })
  return filteredPools.reduce((acc, pool, index) => ({ ...acc, [pool.nftCollectionId]: approvals[index].result }), {})
}

export const fetchNftUserInfo = async (account: Address, host: Host) => {
  const nftpools = await nftPools()

  const filteredNftPools = nftpools.filter((pool) => pool.host === host)
  
  const calls2 = filteredNftPools.map((p) => ({
    abi: nftPoolV2Abi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'getUserPoolInfo',
    args: [account],
    chainId: p.chainId
  }))
  try {
 
    const poolInfoRaw2 = await readContracts(config, { contracts: calls2 })
    const nftPoolInfo2 = filteredNftPools.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.nftCollectionId]: {
          balance: poolInfoRaw2[index].result[1].length,
          tokenIds: poolInfoRaw2[index].result[1].map((tokenId) => tokenId.toString()),
          pendingReward: poolInfoRaw2[index].result[2].toString(),
          hasOld: poolInfoRaw2[index].result[3],
          prevRewards: poolInfoRaw2[index].result[4].map((reward) => reward.toString()),
        },
      }),
      {},
    )
    return { ...nftPoolInfo2 }
  } catch {
    const nftPoolINfo = filteredNftPools.reduce(
      (acc, pool) => ({
        ...acc,
        [pool.nftCollectionId]: {
          balance: 0n,
          tokenIds: [],
          pendingReward: 0n,
          hasOld: false,
          prevRewards: [],
        },
      }),
      {},
    )

    return { ...nftPoolINfo }
  }
}

export const fetchNftUserBalancesByHost = async (account, host: Host) => {
  const nftpools = await nftPools()

  const filteredPools = nftpools.filter((pool) => pool.host === host)
  const calls = filteredPools.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.stakingToken.address, p.chainId),
    functionName: 'balanceOf',
    args: [account],
    chainId: p.chainId
  }))
  const tokenBalancesRaw = await readContracts(config, { contracts: calls })
  const tokenBalances = filteredPools.reduce(
    (acc, pool, index) => ({ ...acc, [pool.nftCollectionId]: tokenBalancesRaw[index].result.toString() }),
    {},
  )

  return { ...tokenBalances }
}

export const fetchNftUserStakeBalancesByHost = async (account, host) => {
  const nftpools = await nftPools()

  const filteredPools = nftpools.filter((pool) => pool.host === host)
  const calls = filteredPools.map((p) => ({
    abi: nftPoolV2Abi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'getUserPoolInfo',
    args: [account],
    chainId: p.chainId
  }))
  const userInfo = await readContracts(config, { contracts: calls })
  const stakedBalances = filteredPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.nftCollectionId]: userInfo[index].result[0].toString(),
    }),
    {},
  )

  return { ...stakedBalances }
}

export const fetchNftUserPendingRewardsByHost = async (account, host) => {
  const nftpools = await nftPools()

  const filteredPools = nftpools.filter((p) => p.host === host)
  const calls = filteredPools.map((p) => ({
    abi: nftPoolV2Abi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'pendingReward',
    args: [account],
    chainId: p.chainId
  }))
  const res = await readContracts(config, { contracts: calls })

  const pendingRewards = filteredPools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.nftCollectionId]: res[index].result.toString(),
    }),
    {},
  )

  return { ...pendingRewards }
}
