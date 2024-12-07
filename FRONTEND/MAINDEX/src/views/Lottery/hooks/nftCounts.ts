import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { getLotteryAddress } from 'state/lottery/helpers'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import { useAccount, useReadContract } from 'wagmi'
import { readContract } from '@wagmi/core'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { getAddress } from 'utils/addressHelpers'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { useLottery } from 'state/lottery/hooks'
import { NftItemInfo, Token } from 'config/constants/types'

// Lottery
interface ColInfo {
  collection: string
  ids: BigInt[]
  claimable: BigInt[]
}

export const useGetNftLotteryInfo = (lotteryToken: Token) => {
  const { address: account } = useAccount()
  const lotteryAddress = getLotteryAddress(lotteryToken.symbol)
  const l = useLottery(lotteryToken)
  const useGetColInfo = () => {
    const [colInfo, setColInfo] = useState<ColInfo[]>()

    useEffect(() => {
      async function getInfo() {
        const data  = await readContract(config, {
          abi: lotteryV3Abi,
          address: getAddress(lotteryAddress, l.chainId),
          functionName: 'getCollectionInfo',
          args: [account],
          chainId: l.chainId
        })
        const cInfo = data as unknown as ColInfo[]
        console.log(cInfo)
        setColInfo(cInfo)
      }
      
      getInfo()
    }, [colInfo])
    return colInfo
  }

  const getImageForTokenId = useCallback(async (tokenId, collection, updateToken: (imageInfo: NftItemInfo) => void) => {
    const baseUrl = await readContract(config, {
      abi: nftCollectionAbi,
      address: collection,
      functionName: 'tokenURI',
      args: [tokenId],
      chainId: l.chainId
    })
    const ipfsChecker = baseUrl.substring(0, 4).toLowerCase()
    let jsonUrl
    if (ipfsChecker === 'http') {
      jsonUrl = baseUrl
    } else {
      const properSubUrl = baseUrl.substring(7)
      jsonUrl = `${IPFS_GATEWAY}/${properSubUrl}`
    }
    fetch(jsonUrl).then((nftResponse) => {
      if (nftResponse.status === 200) {
        nftResponse.json().then((nftJson) => {
          const ipfsChecker2 = nftJson.image.substring(0, 4).toLowerCase()
          let imageUrl
          if (ipfsChecker2 === 'http') {
            imageUrl = baseUrl
          } else {
            const imageBase = nftJson.image.substring(7)
            imageUrl = `${IPFS_GATEWAY}/${imageBase}`
          }
          const tokenInfo: NftItemInfo = {
            tokenId,
            name: nftJson.name,
            imageURI: imageUrl,
            selected: false,
            haveImage: true,
            imageLoaded: false,
          }
          updateToken(tokenInfo)
        })
      }
    })
  }, [])

  return {
    onImage: getImageForTokenId,
    onColInfo: useGetColInfo,
  }
}
