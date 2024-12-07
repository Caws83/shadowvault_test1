// import { lotteries } from 'config/constants/lottery'
import { getAddress } from 'utils/addressHelpers'
import { lotteries } from 'config/constants/lottery'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { useReadContracts } from 'wagmi'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'

export const fetchNftClaimedUserInfo = async (account, currentId) => {
  const calls = lotteries.map((l) => ({
    abi: lotteryV3Abi,
    address: getAddress(l.lotteryAddress, l.chainId),
    functionName: 'userClaimedLotteryId',
    args: [account, currentId],
    chainId: l.chainId
  }))
  try {
    const claimedInfo = await readContracts(config, { contracts: calls })
    const plInfo = lotteries.reduce(
      (acc, plottery, index) => ({
        ...acc,
        [plottery.lId]: claimedInfo[index].result,
      }),
      {},
    )
    return { ...plInfo }
  } catch {
    const plInfo = lotteries.reduce(
      (acc, plottery) => ({
        ...acc,
        [plottery.lId]: false,
      }),
      {},
    )
    return { ...plInfo }
  }
}

export const fetchNftHowManyUserInfo = async (account) => {
  const calls = lotteries.map((l) => ({
    abi: lotteryV3Abi,
    address: getAddress(l.lotteryAddress, l.chainId),
    functionName: 'getTotalNFTTicketsAvailable',
    args: [account],
    chainId: l.chainId
  }))
  try {
    const howManySpots = await readContracts(config, { contracts: calls })
    const plInfo = lotteries.reduce(
      (acc, plottery, index) => ({
        ...acc,
        [plottery.lId]: howManySpots[index].result.toString(),
      }),
      {},
    )
    return { ...plInfo }
  } catch {
    const plInfo = lotteries.reduce(
      (acc, plottery) => ({
        ...acc,
        [plottery.lId]: 0,
      }),
      {},
    )
    return { ...plInfo }
  }
}
