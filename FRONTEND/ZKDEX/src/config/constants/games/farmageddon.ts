import { dexs } from '../dex'
import tokens from '../tokens'
import { GameConfig, GameType } from '../types'
// new RNG: 0x86F4E55a62064a11Eae5D79f858dc43527cC9d02 puppynet
// rng mainnet 0xf636eeB0dFcA0FB258e6f95c1968b750739e5DB5 mainnet

// ["0","1","2","3","4","5","6","10","20","50","100"]
// ["700","100","30","100","15","30","10","7","4","3","1"]https://www.msn.com/en-ca/entertainment/news/25-worst-sitcoms-of-all-time-according-to-imdb/ss-AA1fLZUr?cvid=45a2ddb64d9548f0ae64808d6974d64e
const farmageddonGame: GameConfig[] = [
  // THESE ARE USING OLD WBONE!!!!
  // SCARATCHER --
  //  Change Router
  //  Remove old WBONE
  //  Add new WBONE

  //  other games need to re-deploy

  {
    GameId: 1,
    gameContract: 3,
    CasinoName: 'MSWAPF Pocket Casino',
    GameType: [GameType.SCRATCHERS],
    contractAddress: {
      109: '0x6Cc1274f9C183b6dE121B243395e1Ca3DF618395', // '0x4E493B483A906fef9B8E3094D487EE5ef565C6f6',
    },
    payToken: tokens.mswap,
    folder: 'default',
    displayDecimals: 6,
    dex: dexs.marswap,
    chainId: 109,
  },
  {
    GameId: 2,
    gameContract: 1,
    CasinoName: 'MSWAPF Pocket Casino',
    // GameType: [GameType.COINFLIP, GameType.DECKCUT, GameType.DICECALL, GameType.HIGHLOW, GameType.BLACKJACK],
    GameType: [GameType.COINFLIP, GameType.DECKCUT, GameType.DICECALL],
    contractAddress: {
      109: '0x572d198CE679EEb50A947449E5464B847fD37B70',
    },
    payToken: tokens.mswap,
    folder: 'default',
    displayDecimals: 6,
    dex: dexs.marswap,
    chainId: 109,
  },
  /*
  {
    GameId: 3,
    gameContract: 2,
    CasinoName: 'MSWAPF Pocket Casino',
    // GameType: [GameType.HIGHROLLER, GameType.LOWROLLER, GameType.SUITCALL, GameType.BLACKRED, GameType.HORSERACE],
    GameType: [GameType.BLACKRED, GameType.HORSERACE],
    contractAddress: {
      109: '0x741AD4473D2252C032C7956b5c9F09b2e249a24D',
    },
    payToken: tokens.mswap,
    folder: 'default',
    displayDecimals: 6,
    dex: dexs.marswap,
  },
  */
]

export default farmageddonGame
