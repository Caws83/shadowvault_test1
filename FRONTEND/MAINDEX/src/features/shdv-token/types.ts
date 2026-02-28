// $SHDV Token Types
export interface SHDVTokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  totalSupply: string
  priceUSD?: number
}

export interface SHDVStakingInfo {
  stakedAmount: string
  rewards: string
  apy: number
  lockPeriod?: number
}

export interface SHDVGovernanceProposal {
  id: string
  title: string
  description: string
  votesFor: string
  votesAgainst: string
  endTime: number
  executed: boolean
}

export interface SHDVTokenomics {
  totalSupply: string
  presale: string
  liquidity: string
  team: string
  marketing: string
  ecosystem: string
  stakingRewards: string
}

