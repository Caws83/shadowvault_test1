/* import { ethers } from 'ethers'
import { simpleRpcProvider } from 'utils/providers'
import pools from 'config/constants/pools'
import { quickCalls } from 'config/constants/quickCalls'
import { Address, Dex, Host, PoolCategory } from 'config/constants/types'

// Addresses
import {
  getAddress,
  getPancakeProfileAddress,
  getPancakeRabbitsAddress,
  getBunnyFactoryAddress,
  getBunnySpecialAddress,
  getMSWAPAddress,
  getMSWAPAddress,
  getTokenAddress,
  getPointCenterIfoAddress,
  getClaimRefundAddress,
  getTradingCompetitionAddress,
  getEasterNftAddress,
  getCakeVaultAddress,
  getPredictionsAddress,
  getChainlinkOracleAddress,
  getMulticallAddress,
  getBunnySpecialCakeVaultAddress,
  getBunnySpecialPredictionAddress,
  getBunnySpecialLotteryAddress,
  getFarmAuctionAddress,
  getCompostAddress,
  getLotteryKeeperAddress,
  getCashierAddress,
  getInfoChefaddress,
  getPriceCheckaddress,
} from 'utils/addressHelpers'

// ABI
import profileABI from 'config/abi/pancakeProfile.json'
import mswapAbi from 'config/abi/mswapToken.json'
import pancakeRabbitsAbi from 'config/abi/pancakeRabbits.json'
import bunnyFactoryAbi from 'config/abi/bunnyFactory.json'
import bunnySpecialAbi from 'config/abi/bunnySpecial.json'
import bep20Abi from 'config/abi/erc20.json'
import fgCoinToken from 'config/abi/fgCoinToken.json'
import erc721Abi from 'config/abi/erc721.json'
import lpTokenAbi from 'config/abi/lpToken.json'
import cakeAbi from 'config/abi/cake.json'
import wBNBabi from 'config/abi/wBNB.json'
import ifoV1Abi from 'config/abi/ifoV1.json'
import ifoV2Abi from 'config/abi/ifoV2.json'
import pointCenterIfo from 'config/abi/pointCenterIfo.json'
import lotteryV3Abi from 'config/abi/lotteryV2.json'
import lotteryV3Abi from 'config/abi/lotteryV3.json'
import masterChef from 'config/abi/masterchef.json'
import sousChef from 'config/abi/sousChef.json'
import sousChefV2 from 'config/abi/sousChefV2.json'
import sousChefV4 from 'config/abi/sousChefV4.json'
import sousChefBnb from 'config/abi/sousChefBnb.json'
import claimRefundAbi from 'config/abi/claimRefund.json'
import tradingCompetitionAbi from 'config/abi/tradingCompetition.json'
import easterNftAbi from 'config/abi/easterNft.json'
import cakeVaultAbi from 'config/abi/cakeVault.json'
import predictionsAbi from 'config/abi/predictions.json'
import chainlinkOracleAbi from 'config/abi/chainlinkOracle.json'
import MultiCallAbi from 'config/abi/Multicall'
import bunnySpecialCakeVaultAbi from 'config/abi/bunnySpecialCakeVault.json'
import bunnySpecialPredictionAbi from 'config/abi/bunnySpecialPrediction.json'
import bunnySpecialLotteryAbi from 'config/abi/bunnySpecialLottery.json'
import farmAuctionAbi from 'config/abi/farmAuction.json'
import pancakeRouterAbi from 'config/abi/pancakeRouter.json'
import compostABI from 'config/abi/compost.json'
import nftpoolABI from 'config/abi/nftPoolV2.json'
import tokens from 'config/constants/tokens'
import nftpools from 'config/constants/nftpools'
import nftCollection from 'config/abi/nftCollection'
import coinFlipAbi from 'config/abi/coinFlip'
import game2Abi from 'config/abi/game2.json'
import scratcherAbi from 'config/abi/scratchers.json'
import keeperABI from 'config/abi/keeper.json'
import cashierABI from 'config/abi/cashierV2'
import infoChefAbi from 'config/abi/infoChef'
import priceCheckAbi from 'config/abi/tokenPrice.json'
import nftlaunchs from 'config/constants/nftlaunch'
import farmFactoryAbi from 'config/abi/farmFactory.json'
import IFOFactoryAbi from 'config/abi/tokenSale.json'
import airdropAbi from 'config/abi/airDropper.json'
import tokenMakerAbi from 'config/abi/tokenMaker.json'
import poolFactoryAbi from 'config/abi/PoolFactory.json'
import games from 'config/constants/games'
import contracts from 'config/constants/contracts'
import { ChainLinkOracleContract, FarmAuctionContract, PredictionsContract } from './types'

let poolsConfig = []
const fetchPoolsData = async () => {
  poolsConfig = await pools()
}

fetchPoolsData()

const getContract = (abi: any, address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  const signerOrProvider = signer ?? simpleRpcProvider
  return new ethers.Contract(address, abi, signerOrProvider)
}

export const getPancakeRouterContract = (
  routerAddress: Address,
  signer?: ethers.Signer | ethers.providers.Provider,
) => {
  return getContract(pancakeRouterAbi, getAddress(routerAddress), signer)
}

export const getFactoryContractByString = (factory: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(farmFactoryAbi, factory, signer)
}

export const getCompostContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(compostABI, getCompostAddress(), signer)
}

export const getIfoContract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ifoV2Abi, address, signer)
}

export const getInfoChefContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(infoChefAbi, getInfoChefaddress(), signer)
}

export const getAirDropperContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(airdropAbi, getAddress(contracts.aridropper), signer)
}
export const getTokenCreatorContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(tokenMakerAbi, getAddress(contracts.tokenFactory), signer)
}
export const getPoolFactoryContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(poolFactoryAbi, getAddress(contracts.poolFactory), signer)
}

export const getPriceCheckContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(priceCheckAbi, getPriceCheckaddress(), signer)
}

export const getQuickCallsContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = quickCalls.find((qc) => qc.id === id)
  return getContract(compostABI, getAddress(config.address), signer)
}

export const getFactoryContract = (dex: Dex, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(dex.dexABI, getAddress(dex.factory), signer)
}

export const getBep20Contract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  if (address === getAddress(tokens.fg.address)) {
    return getContract(fgCoinToken, address, signer)
  }
  return getContract(bep20Abi, address, signer)
}
export const getErc721Contract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(erc721Abi, address, signer)
}
export const getLpContract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(lpTokenAbi, address, signer)
}

export const getIfoV1Contract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ifoV1Abi, address, signer)
}
export const getIfoV2Contract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(ifoV2Abi, address, signer)
}
export const getSouschefContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = poolsConfig.find((pool) => pool.sousId === id)
  const abi = config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  return getContract(abi, getAddress(config.contractAddress), signer)
}
export const getSouschefV2Contract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = poolsConfig.find((pool) => pool.sousId === id)
  return getContract(sousChefV2, getAddress(config.contractAddress), signer)
}

export const getSouschefV4Contract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = poolsConfig.find((pool) => pool.sousId === id)
  return getContract(sousChefV4, getAddress(config.contractAddress), signer)
}

export const getNftLaunchContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = nftlaunchs.find((launch) => launch.nftCollectionId === id)
  return getContract(nftCollection, getAddress(config.contractAddress), signer)
}

export const getNftContract = (address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(nftCollection, address, signer)
}

export const getCashierContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(cashierABI, getCashierAddress(), signer)
}

export const getLotteryKeeperContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(keeperABI, getLotteryKeeperAddress(), signer)
}

export const getCoinFlipContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = games.find((game) => game.GameId === id)
  return getContract(coinFlipAbi, getAddress(config.contractAddress), signer)
}

export const getGame2Contract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = games.find((game) => game.GameId === id)
  return getContract(game2Abi, getAddress(config.contractAddress), signer)
}

export const getScratcherContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = games.find((game) => game.GameId === id)
  return getContract(scratcherAbi, getAddress(config.contractAddress), signer)
}

export const getNftCollectionContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = nftpools.find((nftpool) => nftpool.nftCollectionId === id)
  return getContract(nftCollection, getAddress(config.stakingToken.address), signer)
}

export const getNftPoolContract = (id: number, signer?: ethers.Signer | ethers.providers.Provider) => {
  const config = nftpools.find((nftpool) => nftpool.nftCollectionId === id)
  return getContract(nftpoolABI, getAddress(config.contractAddress), signer)
}
export const getPointCenterIfoContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(pointCenterIfo, getPointCenterIfoAddress(), signer)
}
export const getCakeContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(cakeAbi, getMSWAPAddress(), signer)
}
export const getMSWAPContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(mswapAbi, getMSWAPAddress(), signer)
}

export const getTokenContract = (type: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  switch (type) {
    case 'FG':
      return getContract(fgCoinToken, getTokenAddress('FG'), signer)
    case 'BONE':
    default:
      return getContract(wBNBabi, getTokenAddress('BONE'), signer)
  }
}
export const getProfileContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(profileABI, getPancakeProfileAddress(), signer)
}
export const getPancakeRabbitContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(pancakeRabbitsAbi, getPancakeRabbitsAddress(), signer)
}
export const getBunnyFactoryContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(bunnyFactoryAbi, getBunnyFactoryAddress(), signer)
}
export const getBunnySpecialContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(bunnySpecialAbi, getBunnySpecialAddress(), signer)
}

export const getLotteryV2Contract = (address: Address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(lotteryV3Abi, getAddress(address), signer)
}

export const getLotteryV3Contract = (address: Address, signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(lotteryV3Abi, getAddress(address), signer)
}

export const getMasterChefABIFromHost = (host: Host) => {
  return host.chefAbi
}

export const getMasterChefFromHost = (host: Host, signer?: ethers.Signer | ethers.providers.Provider) => {
  const abi = getMasterChefABIFromHost(host)

  return getContract(abi, getAddress(host.masterChef), signer)
}

export const getIfoFactoryContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(IFOFactoryAbi, getAddress(contracts.ifoFactory), signer)
}
export const getOtcFactoryContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(IFOFactoryAbi, getAddress(contracts.otcFactory), signer)
}

export const getMasterchefContract = (
  masterChefAddress: string,
  signer?: ethers.Signer | ethers.providers.Provider,
) => {
  return getContract(masterChef, masterChefAddress, signer)
}
export const getClaimRefundContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(claimRefundAbi, getClaimRefundAddress(), signer)
}
export const getTradingCompetitionContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(tradingCompetitionAbi, getTradingCompetitionAddress(), signer)
}
export const getEasterNftContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(easterNftAbi, getEasterNftAddress(), signer)
}
export const getCakeVaultContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(cakeVaultAbi, getCakeVaultAddress(), signer)
}

export const getPredictionsContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(predictionsAbi, getPredictionsAddress(), signer) as PredictionsContract
}

export const getChainlinkOracleContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(chainlinkOracleAbi, getChainlinkOracleAddress(), signer) as ChainLinkOracleContract
}
export const getMulticallContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(MultiCallAbi, getMulticallAddress(), signer)
}
export const getBunnySpecialCakeVaultContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(bunnySpecialCakeVaultAbi, getBunnySpecialCakeVaultAddress(), signer)
}
export const getBunnySpecialPredictionContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(bunnySpecialPredictionAbi, getBunnySpecialPredictionAddress(), signer)
}
export const getBunnySpecialLotteryContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(bunnySpecialLotteryAbi, getBunnySpecialLotteryAddress(), signer)
}
export const getFarmAuctionContract = (signer?: ethers.Signer | ethers.providers.Provider) => {
  return getContract(farmAuctionAbi, getFarmAuctionAddress(), signer) as FarmAuctionContract
}
 */
