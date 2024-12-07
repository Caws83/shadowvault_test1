import BigNumber from 'bignumber.js'
import { FactoryInfo } from 'sdk'
import { TranslatableText } from 'state/types'


export interface Address {
  282?: string
  388?: string
}

export interface Token {
  symbol: string
  address?: Address
  decimals?: number
  projectLink?: string
  busdPrice?: string
  name?: string
  baseAddress?: Address
}

export enum PoolIds {
  poolBasic = 'poolBasic',
  poolUnlimited = 'poolUnlimited',
}

export type IfoStatus = 'idle' | 'coming_soon' | 'live' | 'finished'

export interface Ifo {
  id: string
  isActive: boolean
  address: Address
  name: string
  token: Token
  priceDecimals: number
  dex: Dex
  logo?: string
  banner?: string
  userCount?: number
  claimCount?: number
  isV3?: boolean
}

export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'BINANCE' = 'zkCRO', // Pools using native BNB behave differently than pools using a token
  'AUTO' = 'Auto',
  'SINGLE' = 'Single',
}

export interface Host {
  name: string
  masterChef: Address
  payoutToken: Token
  dex: Dex
  hasLeaveStaking: boolean
  requiresExtraBool: boolean
  requiresReferral: boolean
  referralAddress?: Address
  chefAbi: any
  pendingCall: string
  rewardCall: string
  allocCall: string
  site?: string
  isForEmmissions?: boolean
  isLocker: boolean
  priceId: number
  chainId: number
}

export interface Dex {
  id: string
  router: Address
  factory: Address
  dexABI: any
  allowTrade: boolean
  factoryBase: Token
  info: FactoryInfo
  chainId: number
  isMars: boolean
}

export interface CashierConfig {
  id: number
  gameToken: Token
  chipToken: Token
  dex?: Dex
}

export interface QuickCalls {
  id: number
  name: string
  address: Address
}

export interface LotteryConfig {
  lId: number
  lotteryToken: Token
  displayTokenDecimals: number
  displayBUSDDecimals: number
  lotteryAddress: Address
  dex: Dex
  isFinished?: boolean
  chainId: number
}

export interface FarmConfig {
  id: number
  pid: number
  lpSymbol: string
  lpAddresses: Address
  token: Token
  quoteToken: Token
  host: Host
  dex: Dex
  multiplier?: string
  isCommunity?: boolean
  isVisible: boolean
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
  isForEmmissions?: boolean
  chainId: number
}

export interface NftImageProps {
  tokenId: BigNumber
  name: string
  imageURI: string
  haveImage: boolean
  imageLoaded: boolean
}

export interface NftItemInfo {
  tokenId: BigNumber
  name: string
  imageURI: string
  selected: boolean
  haveImage: boolean
  imageLoaded: boolean
}

export interface NFTLaunchConfig {
  nftCollectionId: number
  nftCollectionName: string
  contractAddress: Address
  payToken: Token
  isFinished?: boolean
  chainId: number
}

export interface GameConfig {
  GameId: number
  gameContract: number
  CasinoName: string
  GameType: GameType[]
  contractAddress: Address
  payToken: Token
  folder: string
  displayDecimals: number
  dex: Dex
  chainId: number
}

export interface NFTPoolConfig {
  nftCollectionId: number
  contractAddress: Address
  earningToken: Token[]
  stakingToken: Token
  host: Host
  dex: Dex
  isFinished?: boolean
  isVisible?: boolean
  isV3?: boolean
  chainId: number
}

export interface PoolConfig {
  sousId: number
  earningToken: Token
  stakingToken: Token
  contractAddress: Address
  poolCategory: PoolCategory
  sortOrder?: number
  harvest?: boolean
  pid?: number
  host: Host
  dex: Dex
  isFinished?: boolean
  enableEmergencyWithdraw?: boolean
  canHarvest?: boolean
  isVisible?: boolean
  isRenew?: boolean
  chainId: number
  isV3?: boolean
}

export type Images = {
  lg: string
  md: string
  sm: string
  ipfs?: string
}

export type NftImages = {
  blur?: string
} & Images

export type NftVideo = {
  webm: string
  mp4: string
}

export type NftSource = {
  [key in NftType]: {
    address: Address
    identifierKey: string
  }
}

export enum NftType {
  PANCAKE = 'pancake',
  MIXIE = 'mixie',
}

export type Nft = {
  description: string
  name: string
  images: NftImages
  sortOrder: number
  type: NftType
  video?: NftVideo

  // Uniquely identifies the nft.
  // Used for matching an NFT from the config with the data from the NFT's tokenURI
  identifier: string

  // Used to be "bunnyId". Used when minting NFT
  variationId?: number | string
}

export type TeamImages = {
  alt: string
} & Images

export type Team = {
  id: number
  name: string
  description: string
  isJoinable?: boolean
  users: number
  points: number
  images: TeamImages
  background: string
  textColor: string
}

export type CampaignType = 'ifo' | 'teambattle' | 'participation'

export type Campaign = {
  id: string
  type: CampaignType
  title?: TranslatableText
  description?: TranslatableText
  badge?: string
}

export type PageMeta = {
  title: string
  description?: string
  image?: string
}

export enum GameType {
  COINFLIP = 'coinflip',
  DECKCUT = 'deckcut',
  DICECALL = 'dicecall',
  HIGHLOW = 'highlow',
  BLACKJACK = 'blackjack',
  HIGHROLLER = 'highroller',
  LOWROLLER = 'lowroller',
  SUITCALL = 'suitcall',
  BLACKRED = 'blackred',
  HORSERACE = 'horserace',
  SCRATCHERS = 'scratchers',
}

export enum LotteryStatus {
  PENDING = 'pending',
  OPEN = 'open',
  CLOSE = 'close',
  CLAIMABLE = 'claimable',
}

export interface LotteryTicket {
  id: string
  number: string
  status: boolean
  rewardBracket?: number
  roundId?: string
  cakeReward?: BigNumber
  lotteryToken?: Token
}

export interface LotteryTicketClaimData {
  ticketsWithUnclaimedRewards: LotteryTicket[]
  allWinningTickets: LotteryTicket[]
  cakeTotal: BigNumber
  roundId: string
  lotteryToken?: Token
}

// Farm Auction
export interface FarmAuctionBidderConfig {
  account: string
  farmName: string
  tokenAddress: string
  quoteToken: Token
  tokenName: string
  projectSite?: string
  lpAddress?: string
}

// Note: this status is slightly different compared to 'status' comfing
// from Farm Auction smart contract
export enum AuctionStatus {
  ToBeAnnounced, // No specific dates/blocks to display
  Pending, // Auction is scheduled but not live yet (i.e. waiting for startBlock)
  Open, // Auction is open for bids
  Finished, // Auction end block is reached, bidding is not possible
  Closed, // Auction was closed in smart contract
}

export interface Auction {
  id: number
  status: AuctionStatus
  startBlock: number
  startDate: Date
  endBlock: number
  endDate: Date
  auctionDuration: number
  farmStartBlock: number
  farmStartDate: Date
  farmEndBlock: number
  farmEndDate: Date
  initialBidAmount: number
  topLeaderboard: number
  leaderboardThreshold: bigint
}

export interface BidderAuction {
  id: number
  amount: BigNumber
  claimed: boolean
}

export interface Bidder extends FarmAuctionBidderConfig {
  position?: number
  isTopPosition: boolean
  samePositionAsAbove: boolean
  amount: BigNumber
}

export interface ConnectedBidder {
  account: string
  isWhitelisted: boolean
  bidderData?: Bidder
}
