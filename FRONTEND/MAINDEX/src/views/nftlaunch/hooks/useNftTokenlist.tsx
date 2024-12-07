import { NftItemInfo } from 'config/constants/types'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import { useCallback } from 'react'
import { NFTLaunch } from 'state/types'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import { readContract } from '@wagmi/core'

export const useNftTokenList = (launch: NFTLaunch) => {
  const getImageForTokenId = useCallback(
    async (tokenId, updateToken: (imageInfo: NftItemInfo) => void) => {
      const baseUrl = await readContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(launch.contractAddress, launch.chainId),
        functionName: 'tokenURI',
        args: [tokenId],
        chainId: launch.chainId
      })
      const ipfsChecker = baseUrl.substring(0, 4).toLowerCase()
      let jsonUrl
      if (ipfsChecker === 'http') {
        jsonUrl = baseUrl
      } else {
        const properSubUrl = baseUrl.substring(7)
        jsonUrl = `${IPFS_GATEWAY}/${properSubUrl}`
      }

      // const tokenId = await nftCollectionContract.tokenOfOwnerByIndex(account, i) // eslint-disable-line no-await-in-loop
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
    [launch.nftCollectionId],
  )

  return {
    getImageForTokenId,
  }
}
