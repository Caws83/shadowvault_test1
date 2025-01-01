import addresses from 'config/constants/contracts'
import tokens from 'config/constants/tokens'
import { Address } from 'config/constants/types'
import nftlaunchs from 'config/constants/nftlaunch'
import { defaultChainId } from 'config/constants/chains'

export const getAddress = (address: Address, chain_Id?: number): `0x${string}` => {
  if(address === undefined) return undefined 
  const chainId = chain_Id ?? defaultChainId
  return address[chainId]
}

export const getNftContractAdress = async (id: number, chain_Id?: number): Promise<`0x${string}`> => {
  const launches = await nftlaunchs()
  const config = launches.find((launch) => launch.nftCollectionId === id)
  return getAddress(config.contractAddress, chain_Id)
}

export const getMSWAPAddress = () => {
  return getAddress(tokens.mswap.address, 109)
}

export const getInfoChefaddress = (chain_Id?: number) => {
  return getAddress(addresses.infoChef, chain_Id)
}
export const getNFTHostAddress = (chain_Id:number) => {
  return getAddress(addresses.nftLaunchHost, chain_Id)
}

export const getPriceCheckaddress = (chain_Id?: number) => {
  return getAddress(addresses.priceCheck, chain_Id)
}

export const getCompostAddress = (chain_Id?: number) => {
  return getAddress(addresses.compost, chain_Id)
}

export const getWrappedAddress = (chainId: number) => {
  if(chainId === 245022926) return getAddress(tokens.wneon.address, 245022926)

}

export const getMulticallAddress = (chain_Id?: number) => {
  return getAddress(addresses.multiCall, chain_Id)
}
export const getCakeVaultAddress = (chain_Id?: number) => {
  return getAddress(addresses.cakeVault, chain_Id)
}
export const getLotteryKeeperAddress = (chain_Id?: number) => {
  return getAddress(addresses.lotteryKeeper, chain_Id)
}



