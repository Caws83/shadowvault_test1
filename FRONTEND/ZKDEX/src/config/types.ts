import { Address } from "viem"

export interface Token {
    symbol: string
    address: Address
    decimals: number
    name: string
  }
  

export interface Pool {
    earningToken: Token
    stakingToken: Token
    contractAddress: Address
    totalStaked: bigint
    stakingLimit: bigint
    startBlock: bigint
    endBlock: bigint
    apr: number
    rpb: bigint
    stakingTokenPrice: number
    earningTokenPrice: number
    userData?: {
        allowance: bigint
        stakingTokenBalance: bigint
        stakedBalance: bigint
        pendingReward: bigint
    }
  }

  export interface colInfo {
    volume: string
    name: string
    TotalSupply: string
    LowPrice: string
    HighPrice: string
    amountListed: string
  }
  export interface nftInfo {
    name: string
    image_url: string
    description: string
    attributes: []
  }
  export interface allInfo {
    [collection: string]: {
      info: colInfo
      nfts:{[ nft_id: string]: nftInfo}
    }
  }