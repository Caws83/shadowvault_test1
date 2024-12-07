import nftlaunchs from 'config/constants/nftlaunch'
import { getAddress } from 'utils/addressHelpers'
import { nftCollectionAbi } from '../../config/abi/nftCollection'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { config } from 'wagmiConfig'
import { readContracts } from '@wagmi/core'

export const fetchNftLaunchUserInfo = async (account): Promise<{ [collectionId: number]: boolean }> => {
  const launchs = await nftlaunchs()
  const calls = launchs.map((p) => ({
    abi: nftCollectionAbi,
    address: getAddress(p.contractAddress, p.chainId),
    functionName: 'whitelisted',
    args: [account],
    chainId: p.chainId
  }))
  try {
    const launchInfoRaw = await readContracts(config, { contracts: calls })
    const nftLaunchInfo = launchs.reduce(
      (acc, launch, index) => ({
        ...acc,
        [launch.nftCollectionId]: launchInfoRaw[index].result as boolean,
      }),
      {},
    )
    return { ...nftLaunchInfo }
  } catch {
    const nftLaunchInfo = launchs.reduce(
      (acc, launch) => ({
        ...acc,
        [launch.nftCollectionId]: false,
      }),
      {},
    )
    return { ...nftLaunchInfo }
  }
}

export const fetchNftLaunchAllowance = async (account): Promise<{ [collectionId: number]: string }> => {
  const launchs = await nftlaunchs()
  const calls = launchs.map((p) => {
 
    return {
      abi: ERC20_ABI,
      address: getAddress(p.payToken.address, p.chainId),
      functionName: 'allowance',
      args: [account, getAddress(p.contractAddress, p.chainId)],
      chainId: p.chainId
    };
  });
  try {
    const allowanceRaw = await readContracts(config, { contracts: calls })
    console.log("allowanceRaw:", allowanceRaw)

    const nftLaunchInfo = launchs.reduce(
      (acc, launch, index) => ({
        ...acc,
        [launch.nftCollectionId]: allowanceRaw[index]?.result ? allowanceRaw[index].result.toString() : "0",
      }),
      {},
    )
    console.log("complete")
    return { ...nftLaunchInfo }
  } catch {
    const nftLaunchInfo = launchs.reduce(
      (acc, launch) => ({
        ...acc,
        [launch.nftCollectionId]: "0",
      }),
      {},
    )
    console.log("failed")
    return { ...nftLaunchInfo }
  }
}
