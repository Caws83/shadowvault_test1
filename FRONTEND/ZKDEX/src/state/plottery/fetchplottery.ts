import { lotteries } from 'config/constants/lottery'
import { getAddress, getLotteryKeeperAddress } from 'utils/addressHelpers'
import { keeperAbi } from 'config/abi/keeper'
import { useReadContracts } from 'wagmi'
import { config } from 'wagmiConfig'
import { readContracts, readContract } from '@wagmi/core'


export const fetchPLotteryInfo = async () => {
  const keeperAddress = getLotteryKeeperAddress()
  const keeperCalls = lotteries.map((l) => {
    return {
      abi: keeperAbi,
      address: keeperAddress,
      functionName: 'lotteries',
      args: [getAddress(l.lotteryAddress, l.chainId)],
      chainId: l.chainId
    }
  })

  const keeperInfo = await readContracts(config, { contracts: keeperCalls })

  return lotteries.map((l, index) => {
    const data = keeperInfo[index].result
    return {
      lId: l.lId,
      draws: data[9].toString(),
      price: data[0].toString(),
      bnbFee: data[10].toString(),
      operator: data[11],
      step: data[5].toString(),
      upKeepTime: data[3].toString(),
    }
  })
}
