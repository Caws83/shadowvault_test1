import games from 'config/constants/games'
import { getAddress } from 'utils/addressHelpers'
import { coinflipAbi } from '../../config/abi/coinFlip'
import { game2Abi } from '../../config/abi/game2'
import { useReadContracts } from 'wagmi'
import { Address } from 'viem'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'

export const fetchGameUserInfo = async (account) => {
  const calls = games.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.payToken.address, p.chainId),
    functionName: 'balanceOf',
    args: [account as Address],
    chainId: p.chainId
  }))
  try {
    const gameInfoRaw = await readContracts(config, { contracts: calls })
    const gameInfo = games.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: gameInfoRaw[index].result.toString(),
      }),
      {},
    )
    return { ...gameInfo }
  } catch {
    const gameInfo = games.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: "0",
      }),
      {},
    )
    return { ...gameInfo }
  }
}

export const fetchGameAllowance = async (account) => {
  const calls = games.map((p) => ({
    abi: ERC20_ABI,
    address: getAddress(p.payToken.address, p.chainId),
    functionName: 'allowance',
    args: [account, getAddress(p.contractAddress, p.chainId)],
    chainId: p.chainId
  }))
  try {
    const allowanceRaw = await readContracts(config, { contracts: calls })
    const gameInfo = games.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: allowanceRaw[index].result.toString(),
      }),
      {},
    )
    return { ...gameInfo }
  } catch {
    const gameInfo = games.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: "0",
      }),
      {},
    )
    return { ...gameInfo }
  }
}

export const fetchGameData = async (account) => {
  const highCard = games.filter((g) => g.gameContract === 1)
  const callInfo = highCard.map((p) => {
    return {
      abi: coinflipAbi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'highCard',
      args: [account],
      chainId: p.chainId
    }
  })
  try {
    const info = await readContracts(config, { contracts: callInfo })
    const gameData = highCard.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: info[index].result.toString(),
      }),
      {},
    )
    return { ...gameData }
  } catch {
    const gameData = highCard.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: 0,
      }),
      {},
    )
    return { ...gameData }
  }
}

export const fetchBJData = async (account) => {
  const BJ = games.filter((g) => g.gameContract === 1)
  const callInfo = BJ.map((p) => {
    return {
      abi: coinflipAbi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'blackJackUser',
      args: [account],
      chainId: p.chainId
    }
  })
  try {
    const info = await readContracts(config, { contracts: callInfo })
    const gameData = BJ.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: info[index].result.toString(),
      }),
      {},
    )
    return { ...gameData }
  } catch {
    const gameData = BJ.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: 0,
      }),
      {},
    )
    return { ...gameData }
  }
}

export const fetchHRData = async (account) => {
  const games2 = games.filter((g) => g.gameContract === 2)
  const callInfo = games2.map((p) => {
    return {
      abi: game2Abi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'highRollerInfo',
      args: [account],
      chainId: p.chainId
    }
  })
  try {
    const info = await readContracts(config, { contracts: callInfo })
    const gameData = games2.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: info[index].result.toString(),
      }),
      {},
    )
    return { ...gameData }
  } catch {
    const gameData = games2.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: 0,
      }),
      {},
    )
    return { ...gameData }
  }
}

export const fetchLRData = async (account) => {
  const games3 = games.filter((g) => g.gameContract === 2)
  const callInfo = games3.map((p) => {
    return {
      abi: game2Abi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'lowRollerInfo',
      args: [account],
      chainId: p.chainId
    }
  })
  try {
    const info = await readContracts(config, { contracts: callInfo })
    const gameData = games3.reduce(
      (acc, game, index) => ({
        ...acc,
        [game.GameId]: info[index].result.toString(),
      }),
      {},
    )
    return { ...gameData }
  } catch {
    const gameData = games3.reduce(
      (acc, game) => ({
        ...acc,
        [game.GameId]: 0,
      }),
      {},
    )
    return { ...gameData }
  }
}
