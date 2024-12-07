import { AnyAction, ThunkAction } from '@reduxjs/toolkit'
import {
  CampaignType,
  FarmConfig,
  Host,
  LotteryStatus,
  LotteryTicket,
  Nft,
  NFTLaunchConfig,
  NFTPoolConfig,
  PoolConfig,
  GameConfig,
  Team,
  Token,
  LotteryConfig,
  CashierConfig,
} from 'config/constants/types'
import { Address } from 'cluster'

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export type TranslatableText =
  | string
  | {
      key: string
      data?: {
        [key: string]: string | number
      }
    }

export interface Farm extends FarmConfig {
  tokenAmountMc?: string
  quoteTokenAmountMc?: string
  tokenAmountTotal?: string
  quoteTokenAmountTotal?: string
  lpTotalInQuoteToken?: string
  lpTotalSupply?: string
  lpTotalMC?: string
  tokenPriceVsQuote?: string
  poolWeight?: string
  blockReward?: string
  unLockTime?: string
  lockTime?: string
  lockLength?: string
  isLocked?: boolean
  lockFee?: string
  admin?: string
  userData?: {
    allowance: string
    tokenBalance: string
    stakedBalance: string
    earnings: string
  }
}

export interface Cashier extends CashierConfig {
  bnbFee?: string
  reflections?: string
  chipSupply?: string
  cashierBalance?: string
  userData?: {
    allowance: string
    allowance2: string
    tokenBalance: string
    chipBalance: string
  }
}

export interface NFTLaunch extends NFTLaunchConfig {
  maxSupply?: string
  currentSupply?: string
  maxMint?: string
  payTokenAddress?: Address
  costBNB?: string
  costToken?: string
  isPublic?: boolean
  owner?: Address
  subOp?: Address
  userData?: {
    whitelist: boolean
    allowance: string
  }
}

export interface Game extends GameConfig {
  maxBetAmount?: string
  quickBetAmount?: string
  payoutRate?: string
  potAmount?: string
  bnbFee?: string
  userData?: {
    balance: string
    allowance: string
  }
  // game 1
  multipliers?: {
    coinFlipM?: string
    deckCutM?: string
    diceCall6M?: string
    diceCall12M?: string
    diceCall20M?: string
    highCardStart?: string
    blackJackM?: string
  }
  highCard?: {
    currentSuit?: string
    currentNumber?: string
    currentBet?: string
    winnings?: string
    multiplier?: string
    isGameStarted?: boolean
  }
  blackJack?: {
    playerSuits?: string[]
    playerCards?: string[]
    houseSuits?: string[]
    houseCards?: string[]
    currentBet?: string
    playerTotal?: string
    houseTotal?: string
    isGameStarted?: boolean
  }
  // game 2
  multipliers2?: {
    highRoller6M?: string
    highRoller12M?: string
    highRoller20M?: string
    suitCallM?: string
    blackRedM?: string
    horseRace1M?: string
    horseRace2M?: string
  }
  highRoller?: {
    houseDice1: string
    houseDice2: string
    playerDice1: string
    playerDice2: string
    currentBet: string
    diceChoice: string
    isGameStarted: boolean
  }
  lowRoller?: {
    houseDice1: string
    houseDice2: string
    playerDice1: string
    playerDice2: string
    currentBet: string
    diceChoice: string
    isGameStarted: boolean
  }
  scratcher?: {
    minBet: string
    maxBet: string
    avlFunds: string
    safetyM: string
    jackPotCost: string
    chances: string[]
    totalChance: string
    multipliers: string[]
    jackPot: string
    jackPotChance: string
  }
}

export interface NFTPool extends NFTPoolConfig {
  totalStaked?: string
  stakingLimit?: string
  startBlock?: number
  endBlock?: number
  rewardPerDayPerToken?: string
  tokenFee?: string
  currentRound?: string
  userData?: {
    approved: boolean
    balance?: string
    tokenIds?: string[]
    stakedBalance?: string
    stakingTokenBalance?: string
    pendingReward?: string
    hasOld?: boolean
    prevRewards?: string[]
  }
}

export interface Pool extends PoolConfig {
  stakingToken: any
  totalStaked?: string
  stakingLimit?: string
  startBlock?: number
  endBlock?: number
  apr?: number
  stakingTokenPrice?: number
  earningTokenPrice?: number
  isAutoVault?: boolean
  userData?: {
    allowance: string
    stakingTokenBalance: string
    stakedBalance: string
    pendingReward: string
  }
}

export interface Profile {
  userId: number
  points: number
  teamId: number
  nftAddress: string
  tokenId: number
  isActive: boolean
  username: string
  nft?: Nft
  team: Team
  hasRegistered: boolean
}

// Slices states

export interface FarmsState {
  data: Farm[]
  loadArchivedFarmsData: boolean
  userDataLoaded: boolean
  host: Host
}

export interface VaultFees {
  performanceFee: number
  callFee: number
  withdrawalFee: number
  withdrawalFeePeriod: number
}

export interface VaultUser {
  isLoading: boolean
  userShares: string
  cakeAtLastUserAction: string
  lastDepositedTime: string
  lastUserActionTime: string
}
export interface CakeVault {
  totalShares?: string
  pricePerFullShare?: string
  totalCakeInVault?: string
  estimatedCakeBountyReward?: string
  totalPendingCakeHarvest?: string
  fees?: VaultFees
  userData?: VaultUser
}

export interface NFTLaunchState {
  data: NFTLaunch[]
  userDataLoaded: boolean
}

export interface GameState {
  data: Game[]
  userDataLoaded: boolean
}

export interface CashierState {
  data: Cashier[]
  userDataLoaded: boolean
}

export interface NFTPoolsState {
  data: NFTPool[]
  userDataLoaded: boolean
  host: Host
}

export interface PoolsState {
  data: Pool[]
  cakeVault: CakeVault
  userDataLoaded: boolean
  host: Host
}

export interface ProfileState {
  isInitialized: boolean
  isLoading: boolean
  hasRegistered: boolean
  data: Profile
}

export type TeamResponse = {
  0: string
  1: string
  2: string
  3: string
  4: boolean
}

export type TeamsById = {
  [key: string]: Team
}

export interface TeamsState {
  isInitialized: boolean
  isLoading: boolean
  data: TeamsById
}

export interface Achievement {
  id: string
  type: CampaignType
  address: string
  title: TranslatableText
  description?: TranslatableText
  badge: string
  points: number
}

export interface AchievementState {
  data: Achievement[]
}

// Block

export interface BlockState {
  currentBlock: string
  initialBlock: string
}

// Collectibles

export interface CollectiblesState {
  isInitialized: boolean
  isLoading: boolean
  data: {
    [key: string]: number[]
  }
}

// Predictions

export enum BetPosition {
  BULL = 'Bull',
  BEAR = 'Bear',
  HOUSE = 'House',
}

export enum PredictionStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface Round {
  id: string
  epoch: number
  failed?: boolean
  startBlock: number
  startAt: number
  startHash: string
  lockAt: number
  lockBlock: number
  lockPrice: number
  lockHash: string
  lockRoundId: string
  closeRoundId: string
  closeHash: string
  closeAt: number
  closePrice: number
  closeBlock: number
  totalBets: number
  totalAmount: number
  bullBets: number
  bearBets: number
  bearAmount: number
  bullAmount: number
  position: BetPosition
  bets?: Bet[]
}

export interface Market {
  paused: boolean
  epoch: number
}

export interface Bet {
  id?: string
  hash?: string
  amount: number
  position: BetPosition
  claimed: boolean
  claimedAt: number
  claimedHash: string
  claimedBNB: number
  claimedNetBNB: number
  createdAt: number
  updatedAt: number
  block: number
  user?: PredictionUser
  round?: Round
}

export interface PredictionUser {
  id: string
  createdAt: number
  updatedAt: number
  block: number
  totalBets: number
  totalBetsBull: number
  totalBetsBear: number
  totalBNB: number
  totalBNBBull: number
  totalBNBBear: number
  totalBetsClaimed: number
  totalBNBClaimed: number
  winRate: number
  averageBNB: number
  netBNB: number
}

export interface HistoryData {
  [key: string]: Bet[]
}

export enum HistoryFilter {
  ALL = 'all',
  COLLECTED = 'collected',
  UNCOLLECTED = 'uncollected',
}

export interface LedgerData {
  [key: string]: {
    [key: string]: ReduxNodeLedger
  }
}

export interface RoundData {
  [key: string]: ReduxNodeRound
}

export interface ReduxNodeLedger {
  position: BetPosition
  amount: string
  claimed: boolean
}

export interface NodeLedger {
  position: BetPosition
  amount: string
  claimed: boolean
}

export interface ReduxNodeRound {
  epoch: number
  startTimestamp: number | null
  lockTimestamp: number | null
  closeTimestamp: number | null
  lockPrice: string | null
  closePrice: string | null
  totalAmount: string
  bullAmount: string
  bearAmount: string
  rewardBaseCalAmount: string
  rewardAmount: string
  oracleCalled: boolean
  lockOracleId: string
  closeOracleId: string
}

export interface NodeRound {
  epoch: number
  startTimestamp: number | null
  lockTimestamp: number | null
  closeTimestamp: number | null
  lockPrice: string | null
  closePrice: string | null
  totalAmount: string
  bullAmount: string
  bearAmount: string
  rewardBaseCalAmount: string
  rewardAmount: string
  oracleCalled: boolean
  closeOracleId: string
  lockOracleId: string
}

export interface PredictionsState {
  status: PredictionStatus
  isLoading: boolean
  isHistoryPaneOpen: boolean
  isChartPaneOpen: boolean
  isFetchingHistory: boolean
  historyFilter: HistoryFilter
  currentEpoch: number
  intervalSeconds: number
  minBetAmount: string
  bufferSeconds: number
  lastOraclePrice: string
  history: HistoryData
  rounds?: RoundData
  ledgers?: LedgerData
  claimableStatuses: {
    [key: string]: boolean
  }
}

// Voting

/* eslint-disable camelcase */
/**
 * @see https://hub.snapshot.page/graphql
 */
export interface VoteWhere {
  id?: string
  id_in?: string[]
  voter?: string
  voter_in?: string[]
  proposal?: string
  proposal_in?: string[]
}

export enum SnapshotCommand {
  PROPOSAL = 'proposal',
  VOTE = 'vote',
}

export enum ProposalType {
  ALL = 'all',
  CORE = 'core',
  COMMUNITY = 'community',
}

export enum ProposalState {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export interface Space {
  id: string
  name: string
}

export interface Proposal {
  author: string
  body: string
  choices: string[]
  end: number
  id: string
  snapshot: string
  space: Space
  start: number
  state: ProposalState
  title: string
}

export interface Vote {
  id: string
  voter: string
  created: number
  space: Space
  proposal: {
    choices: Proposal['choices']
  }
  choice: number
  metadata?: {
    votingPower: string
    verificationHash: string
  }
  _inValid?: boolean
}

export enum VotingStateLoadingStatus {
  INITIAL = 'initial',
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
}

export interface VotingState {
  proposalLoadingStatus: VotingStateLoadingStatus
  proposals: {
    [key: string]: Proposal
  }
  voteLoadingStatus: VotingStateLoadingStatus
  votes: {
    [key: string]: Vote[]
  }
}

export interface PLottery extends LotteryConfig {
  draws?: string
  price?: string
  bnbFee?: string
  operator?: string
  step?: string
  upKeepTime?: string
  userData?: {
    nftClaimed?: boolean
    howManySpots?: string
  }
}

export interface LotteryRoundUserTickets {
  isLoading?: boolean
  tickets?: LotteryTicket[]
}

interface LotteryRoundGenerics {
  isLoading?: boolean
  lotteryId: string
  status: LotteryStatus
  startTime: string
  endTime: string
  treasuryFee: string
  firstTicketId: string
  lastTicketId: string
  finalNumber: number
}

export interface LotteryRound extends LotteryRoundGenerics {
  userTickets?: LotteryRoundUserTickets
  priceTicketInCake: string
  discountDivisor: string
  amountCollectedInCake: string
  cakePerBracket: string[]
  countWinnersPerBracket: string[]
  rewardsBreakdown: string[]
}

export interface LotteryResponse extends LotteryRoundGenerics {
  priceTicketInCake: string
  discountDivisor: string
  amountCollectedInCake: string
  cakePerBracket: string[]
  countWinnersPerBracket: string[]
  rewardsBreakdown: string[]
  lotteryToken?: Token
}

export interface AllLotteryState {
  [token: string]: LotteryState
}

export interface PLotteryState {
  data: PLottery[]
  userDataLoaded: boolean
}

export interface LotteryState {
  currentLotteryId: string
  maxNumberTicketsPerBuyOrClaim: string
  isTransitioning: boolean
  currentRound: LotteryResponse & { userTickets?: LotteryRoundUserTickets }
  lotteriesData?: LotteryRoundGraphEntity[]
  userLotteryData?: LotteryUserGraphEntity
  displayDecimals: number
  costPerTicket: number
}

export interface LotteryStateBNB {
  currentLotteryId: string
  maxNumberTicketsPerBuyOrClaim: string
  isTransitioning: boolean
  currentRound: LotteryResponse & { userTickets?: LotteryRoundUserTickets }
  lotteriesData?: LotteryRoundGraphEntity[]
  userLotteryData?: LotteryUserGraphEntity
}

export interface LotteryRoundGraphEntity {
  id: string
  totalUsers: string
  totalTickets: string
  winningTickets: string
  status: LotteryStatus
  finalNumber: string
  startTime: string
  endTime: string
  ticketPrice: string
}

export interface LotteryUserGraphEntity {
  account: string
  totalCake: string
  totalTickets: string
  rounds: UserRound[]
}

export interface UserRound {
  claimed: boolean
  lotteryId: string
  status: LotteryStatus
  endTime: string
  totalTickets: string
  tickets?: LotteryTicket[]
}

export type UserTicketsResponse = [string[], number[], boolean[]]

// Global state

export interface State {
  achievements: AchievementState
  block: BlockState
  farms: FarmsState
  pools: PoolsState
  nftpools: NFTPoolsState
  nftlaunchs: NFTLaunchState
  predictions: PredictionsState
  profile: ProfileState
  teams: TeamsState
  collectibles: CollectiblesState
  voting: VotingState
  lottery: LotteryState
  lotteryBNB: LotteryStateBNB
  lotteryFG: LotteryStateBNB
  games: GameState
  plotteries: PLotteryState
  cashiers: CashierState
}
