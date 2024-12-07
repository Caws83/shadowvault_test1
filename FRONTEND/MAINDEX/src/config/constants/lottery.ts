import tokens from 'config/constants/tokens'
import { dexs } from './dex'
import { LotteryConfig } from './types'

export const TICKET_LIMIT_PER_REQUEST = 2500
export const NUM_ROUNDS_TO_CHECK_FOR_REWARDS = 5
export const NUM_ROUNDS_TO_FETCH_FROM_NODES = 3

// TESTNET RNG: 0x86F4E55a62064a11Eae5D79f858dc43527cC9d02
// rng mainnet 0xf636eeB0dFcA0FB258e6f95c1968b750739e5DB5 mainnet

export const lotteries: LotteryConfig[] = [
  /*
  {
    lId: 1,
    lotteryToken: tokens.mswap,
    displayTokenDecimals: 0,
    displayBUSDDecimals: 2,
    lotteryAddress: {
      109: '0x9072902f9A9ffDDE9Ccbd7B8dDAD4d70016D7823',
    },
    dex: dexs.marswap,
    isFinished: false,
    chainId: 109
  },
  */
]
