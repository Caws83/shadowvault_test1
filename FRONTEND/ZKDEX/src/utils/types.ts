export type MultiCallResponse<T> = T | null

// Predictions
export type PredictionsClaimableResponse = boolean

export interface PredictionsLedgerResponse {
  position: 0n | 1n
  amount: bigint
  claimed: boolean
}

export interface TransactionSteps {
  [EasyTransactionSteps.Start]: boolean
  [EasyTransactionSteps.Initializing]: boolean
  [EasyTransactionSteps.Harvest]: boolean
  [EasyTransactionSteps.Approval]: boolean
  [EasyTransactionSteps.CreateLP]: boolean
  [EasyTransactionSteps.Unstaking]: boolean
  [EasyTransactionSteps.RemoveLiquidity]: boolean
  [EasyTransactionSteps.Swap1]: boolean
  [EasyTransactionSteps.Swap2]: boolean
  [EasyTransactionSteps.Swap3]: boolean
  [EasyTransactionSteps.Liquidity]: boolean
  [EasyTransactionSteps.Deposit]: boolean
  [EasyTransactionSteps.Complete]: boolean
}

export enum EasyTransactionSteps {
  Start = 0,
  Initializing,
  Unstaking,
  Harvest,
  Approval,
  CreateLP,
  RemoveLiquidity,
  Swap1,
  Swap2,
  Swap3,
  Liquidity,
  Deposit,
  Complete,
}

export enum EasyTransactionError {
  None,
  General,
  Transaction,
  NoFarm,
  Gas,
  Allowance,
}

export const EasyTransactionString = [
  'Starting Process',
  'Initializing',
  'Unstaking',
  'Harvesting',
  'Approving',
  'Creating LP',
  'Removing LP',
  'Swapping Tokens',
  'Swapping Tokens',
  'Swapping Tokens',
  'Adding LP',
  'Depositing',
  'Complete',
]

export type PredictionsRefundableResponse = boolean

export interface PredictionsRoundsResponse {
  epoch: bigint
  startTimestamp: bigint
  lockTimestamp: bigint
  closeTimestamp: bigint
  lockPrice: bigint
  closePrice: bigint
  lockOracleId: bigint
  closeOracleId: bigint
  totalAmount: bigint
  bullAmount: bigint
  bearAmount: bigint
  rewardBaseCalAmount: bigint
  rewardAmount: bigint
  oracleCalled: boolean
}

// [rounds, ledgers, count]
export type PredictionsGetUserRoundsResponse = [bigint[], PredictionsLedgerResponse[], bigint]

export type PredictionsGetUserRoundsLengthResponse = bigint

// Chainlink Orance
export type ChainLinkOracleLatestAnswerResponse = bigint

// Farm Auction

// Note: slightly different from AuctionStatus used throughout UI
export enum FarmAuctionContractStatus {
  Pending,
  Open,
  Close,
}

export interface AuctionsResponse {
  status: FarmAuctionContractStatus
  startBlock: bigint
  endBlock: bigint
  initialBidAmount: bigint
  leaderboard: bigint
  leaderboardThreshold: bigint
}

export interface BidsPerAuction {
  account: string
  amount: bigint
}

export type ViewBidsPerAuctionResponse = [BidsPerAuction[], bigint]

// [auctionId, bids, claimed, nextCursor]
export type ViewBidderAuctionsResponse = [bigint[], bigint[], boolean[], bigint]

type GetWhitelistedAddressesResponse = [
  {
    account: string
    lpToken: string
    token: string
  }[],
  bigint,
]

interface AuctionsHistoryResponse {
  totalAmount: bigint
  hasClaimed: boolean
}
