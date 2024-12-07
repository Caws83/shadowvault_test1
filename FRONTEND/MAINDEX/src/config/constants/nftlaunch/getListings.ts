import { NFTLaunchConfig } from '../types'
import { getNFTHostAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { readContract } from '@wagmi/core'
import { nftLaunchHostAbi } from 'config/abi/nftLaunchHost'
import { config } from 'wagmiConfig'


const blackList = []

const isBlacklisted = (address) => {
  for(let i=0; i<blackList.length; i++) {
    if(address === blackList[i]) return true
  }
  return false
}

const getListing = async (chainId) => {
  const startIndex = Number(`${chainId}100000`)
  
  try {

    const data  = await readContract(config, {
      abi: nftLaunchHostAbi,
      address: getNFTHostAddress(chainId),
      functionName: 'getAllSales',
      chainId
    })
    const salesRaw: NFTLaunchConfig[] = []
    for (let i = 0; i < data.length; i++) {
      if(!isBlacklisted(data[i].contractAddress)) {
      salesRaw.push({
        nftCollectionId: startIndex + i,
        nftCollectionName: data[i].collectionName,
        contractAddress: {
            [chainId]: data[i].contractAddress,
        },
        payToken: {
            symbol: data[i].symbol,
            name: data[i].name,
            address: {
              [chainId]: data[i].payToken,
            },
            decimals: new BigNumber(data[i].decimals.toString()).toNumber(),
            projectLink: data[i].projectLink,
          },
        chainId,
      })

    }
  }
    
    const reversedPools = salesRaw.slice().reverse()
    return reversedPools
  } catch {
    console.info('Error getting sales.')
    return []
  }

}

export default getListing
