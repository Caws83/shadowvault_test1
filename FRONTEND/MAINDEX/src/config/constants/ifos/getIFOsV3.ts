import { Ifo } from '../types'
import { dexs } from 'config/constants/dex'
import { getAddress, getInfoChefaddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import contracts from 'config/constants/contracts'
import { readContract, readContracts } from '@wagmi/core'
import { infoChefAbi } from 'config/abi/infoChef'
import { ifoV3Abi } from 'config/abi/ifoV3'

import { config } from 'wagmiConfig'

const getListingv3 = async (chainId: number) => {

  const findDex = (router: string) => {
    for (const key in dexs) {
      if (dexs[key].router === router) {
        return dexs[key]
      }
    }
    for (const key in dexs) {
      if (dexs[key].chainId === chainId) {
        return dexs[key]
      }
    }

    return undefined
  }

  try {
    const factory = getAddress(contracts.ifoFactoryV3, chainId)

    const data = await readContract(config, {
      abi: infoChefAbi,
      address: getInfoChefaddress(chainId),
      functionName: 'getSaleInfos2',
      args: [factory],
      chainId
    })

    const salesRaw: Ifo[] = []

    // Extracting addresses from data[0]
    const contractAddresses = data[0].map((address: string) => ({
      abi: ifoV3Abi,
      address,
      functionName: 'router',
      chainId
    }))

    // Fetching router data using readContracts
    const routers = await readContracts(config, {
      contracts: contractAddresses
    })
    console.log(routers)

    for (let i = 0; i < data[0].length; i++) {
      const userCount = new BigNumber(data[9][i].toString()).toNumber()
      const claimCount = new BigNumber(data[10][i].toString()).toNumber()

      salesRaw.push({
        id: `${data[2][i]}_${data[3][i]} v3 (${i})`,
        address: {
          [chainId]: data[0][i].toString(),
        },
        isActive: !data[5][i],
        name: data[2][i],
        token: {
          symbol: data[3][i],
          name: data[2][i],
          address: {
            [chainId]: data[1][i].toString(),
          },
          decimals: new BigNumber(data[4][i].toString()).toNumber(),
          projectLink: "",
        },
        priceDecimals: 8,
        dex: findDex(routers[i].result.toString()),
        userCount,
        claimCount,
        isV3: true,
      })
    }

    return salesRaw
  } catch (error) {
    console.error('Error getting ifos V3.', error)
    return []
  }
}

export default getListingv3
