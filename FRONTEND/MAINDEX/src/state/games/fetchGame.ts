import games from 'config/constants/games'
import { getAddress } from 'utils/addressHelpers'
import { coinflipAbi } from '../../config/abi/coinFlip'
import { game2Abi } from '../../config/abi/game2'
import { scratchersAbi } from '../../config/abi/scratchers'
import { useReadContracts } from 'wagmi'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'


export const fetchGamePublicInfo = async () => {
  const mainCasinos = games.filter((g) => g.gameContract !== 3)
  const callInfo = mainCasinos.map((p) => {
    return {
      abi: coinflipAbi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'stateCallMain',
      chainId: p.chainId
    }
  })

  const info = await readContracts(config, { contracts: callInfo })

  return mainCasinos.map((p, index) => {
    const data = info[index].result
    return {
      GameId: p.GameId,
      maxBetAmount: data[0].toString(),
      quickBetAmount: data[1].toString(),
      payoutRate: data[2].toString(),
      potAmount: data[3].toString(),
      bnbFee: data[4].toString(),
    }
  })
}

export const fetchMultiInfo = async () => {
  const mainCasinos = games.filter((g) => g.gameContract === 1)
  const callInfo = mainCasinos.map((p) => {
    return {
      abi: coinflipAbi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'multipliers',
      chainId: p.chainId
    }
  })
  const info = await readContracts(config, { contracts: callInfo })
  return mainCasinos.map((p, index) => {
    const data = info[index].result
    return {
      GameId: p.GameId,
      coinFlipM: data[0].toString(),
      deckCutM: data[1].toString(),
      diceCall6M: data[2].toString(),
      diceCall12M: data[3].toString(),
      diceCall20M: data[4].toString(),
      highCardStart: data[5].toString(),
      blackJackM: data[6].toString(),
    }
  })
}

export const fetchMultiInfo2 = async () => {
  const casinos = games.filter((g) => g.gameContract === 2)
  const callInfo = casinos.map((p) => {
    return {
      abi: game2Abi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'getMultipliers',
      chainId: p.chainId
    }
  })
  const info = await readContracts(config, { contracts: callInfo })
  return casinos.map((p, index) => {
    const data = info[index].result
    return {
      GameId: p.GameId,
      highRoller6M: data[0].toString(),
      highRoller12M: data[1].toString(),
      highRoller20M: data[2].toString(),
      suitCallM: data[3].toString(),
      blackRedM: data[4].toString(),
      horseRace1M: data[5].toString(),
      horseRace2M: data[6].toString(),
    }
  })
}

export const fetchScratcherInfo = async () => {
  const casinos = games.filter((g) => g.gameContract === 3)
  const callInfo = casinos.map((p) => {
    return {
      abi: scratchersAbi,
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'info',
      chainId: p.chainId
    }
  })
  const info = await readContracts(config, { contracts: callInfo })
  return casinos.map((p, index) => {
    const data = info[index].result
    return {
      GameId: p.GameId,
      minBet: data[0].toString(),
      maxBet: data[1].toString(),
      avlFunds: data[2].toString(),
      safetyM: data[3].toString(),
      jackPotCost: data[4].toString(),
      chances: data[5].map((val) => val.toString()),
      totalChance: data[6].toString(),
      multipliers: data[7].map((val) => val.toString()),
      jackPot: data[8].toString(),
      jackPotChance: data[9].toString(),
    }
  })
}
