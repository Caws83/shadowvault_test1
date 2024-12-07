import nftlaunchs from 'config/constants/nftlaunch'
import { getAddress } from 'utils/addressHelpers'
import { nftCollectionAbi } from '../../config/abi/nftCollection'
import { config } from 'wagmiConfig'
import { readContracts } from '@wagmi/core'

export const fetchNftLaunchPublicInfo = async () => {
  const launchs = await nftlaunchs()
  const callInfo = launchs.map((p) => {
    return {
      address: getAddress(p.contractAddress, p.chainId),
      functionName: 'pageInfo',
      abi: nftCollectionAbi,
      chainId: p.chainId
    }
  })
  const info = await readContracts(config, { contracts: callInfo })
  
  return launchs.map((p, index) => {
    const data = info[index].result
    return {
      nftCollectionId: p.nftCollectionId,
      maxSupply: data[0].toString(),
      currentSupply: data[1].toString(),
      maxMint: data[2].toString(),
      payTokenAddress: data[3],
      costBNB: data[4].toString(),
      costToken: data[5].toString(),
      isPublic: data[6],
      owner: data[7],
      subOp: data[8],
      isFinished: p.isFinished === true || data[1] > data[0],
    }
  })
}
