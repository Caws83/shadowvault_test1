import { farmFactoryAbi } from 'config/abi/farmFactory'
import { pancakeFactoryAbi } from 'config/abi/pancakeFactory'
import { Dex } from './types'
import tokens from './tokens'

// BSC Mainnet - PancakeSwap V2
export const pancakeBsc = {
  id: 'PancakeSwap',
  factory: { 56: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73" },
  router: { 56: "0x10ED43C718714eb63d5aA57B78B54704E256024E" },
  dexABI: pancakeFactoryAbi,
  allowTrade: true,
  factoryBase: tokens.wbnb,
  info: {
    name: 'PancakeSwap',
    lpname: 'Pancake LPs',
    factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    codeHash: "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5",
    numerator: 9975,
  },
  chainId: 56,
  isMars: true,
}

// BSC Testnet - PancakeSwap V2
export const pancakeBscTest = {
  id: 'PancakeSwap',
  factory: {
    97: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  },
  router: {
    97: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
  },
  dexABI: pancakeFactoryAbi,
  allowTrade: true,
  factoryBase: tokens.wbnb,
  info: {
    name: 'PancakeSwap',
    lpname: 'Pancake LPs',
    factory: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
    codeHash: "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    numerator: 9975,
  },
  chainId: 97,
  isMars: true,
}

// Sepolia - Uniswap V2
export const uniswapSepolia = {
  id: 'Uniswap',
  factory: { 11155111: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6' },
  router: { 11155111: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3' },
  dexABI: pancakeFactoryAbi,
  allowTrade: true,
  factoryBase: tokens.wethSepolia,
  info: {
    name: 'Uniswap',
    lpname: 'Uniswap LPs',
    factory: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
    codeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    numerator: 9975,
  },
  chainId: 11155111,
  isMars: false,
}

// Neon Devnet - Forge
export const forgeTest = {
  id: 'Forge Test',
  factory: {
    245022926: "0x3708BcD02Cb4540ddb733C9ceD6303AB7577943f",
  },
  router: {
    245022926: "0x44E38a1A4E00592a4CC24D7E50b475B823F7cEdD",
  },
  dexABI: farmFactoryAbi,
  allowTrade: true,
  factoryBase: tokens.wneon,
  info: {
    name: 'Forge',
    lpname: 'ForgeTest LPs',
    factory: "0x3708BcD02Cb4540ddb733C9ceD6303AB7577943f",
    codeHash: "0x5ae7f91854eca2fc4ce52df27a29d91820b723f8c4fb9214b22db72e7a6e5230",
    numerator: 9990,
  },
  chainId: 245022926,
  isMars: true,
}

export const dexs = {
  pancakeBsc,
  pancakeBscTest,
  uniswapSepolia,
  forgeTest,
}

export const dexList: Dex[] = [
  dexs.pancakeBsc,
  dexs.pancakeBscTest,
  dexs.uniswapSepolia,
  dexs.forgeTest,
]

export const defaultDex = dexs.pancakeBscTest
