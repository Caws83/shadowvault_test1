import { NftItemInfo, NFTPoolConfig } from 'config/constants/types'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import { useCallback } from 'react'
import { readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { nftPoolV2Abi } from 'config/abi/nftPoolV2'
import { getAddress } from 'utils/addressHelpers'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { config } from 'wagmiConfig'
import { erc404Token } from 'config/abi/tokens/erc404Token2'

export const useNftTokenList = (nftpool: NFTPoolConfig) => {
  const { address: account } = useAccount()

  const getNftTokenIdListFromWallet = useCallback(async () => {
  try{
    const tokenIds = await readContract(config, {
      abi: nftPoolV2Abi,
      address: getAddress(nftpool.contractAddress, nftpool.chainId),
      functionName: 'walletOfOwner',
      args: [account],
      chainId: nftpool.chainId
    })
    return tokenIds
  } catch {
    try{
    const tokenIds = await readContract(config, {
      abi: erc404Token,
      address: getAddress(nftpool.contractAddress, nftpool.chainId),
      functionName: 'owned',
      args: [account],
      chainId: nftpool.chainId
    })
    return tokenIds
  } catch {
    let tokenIds: bigint[] = []
    // get balance
    const balance = await readContract(config, {
      address: getAddress(nftpool.contractAddress, nftpool.chainId),
      abi: nftCollectionAbi,
      functionName: "balanceOf",
      args: [account ?? "0x0"],
      chainId: nftpool.chainId

})

    for(let i=0; i<balance; i++){
      const tId = await readContract(config, {
        address: getAddress(nftpool.contractAddress, nftpool.chainId),
        abi: nftCollectionAbi,
        functionName: 'tokenOfOwnerByIndex',
        args: [account ?? "0x0", BigInt(i)],
        chainId: nftpool.chainId
      })
      tokenIds.push(tId)
    }
  }}
  }, [account, nftpool])

  const getNftTokenIdListFromPool = useCallback(async () => {
    const tokenIds = await readContract(config, {
      abi: nftPoolV2Abi,
      address: getAddress(nftpool.contractAddress, nftpool.chainId),
      functionName: 'getTokenIds',
      args: [account],
      chainId: nftpool.chainId
    })
    return tokenIds
  }, [account, nftpool])

  const getImageForTokenId = useCallback(
    async (tokenId, updateToken: (imageInfo: NftItemInfo) => void) => {
      // const baseUrl: string = await nftCollectionContract.baseURI()
      const baseUrl = await readContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(nftpool.stakingToken.address, nftpool.chainId),
        functionName: 'tokenURI',
        args: [tokenId],
        chainId: nftpool.chainId
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
                    imageUrl = nftJson.image
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
    },
    [nftpool],
  )

  return {
    getNftTokenIdListFromWallet,
    getNftTokenIdListFromPool,
    getImageForTokenId,
  }
}
