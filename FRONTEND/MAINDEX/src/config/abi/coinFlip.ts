import { Abi } from "viem";

export const coinflipAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_gameToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_tokenTreasury',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_BNBtreasury',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_BNBfee',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'playersSuits',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'playersNumbers',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'Dsuit',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'Dnumber',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'betAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'Dtotal',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'bust',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    name: 'BlackJackGame',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'suit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'number',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bet',
        type: 'uint256',
      },
    ],
    name: 'HighCardFirst',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'LastCardSuit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'LastCardNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newCardSuit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newCardNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isJackpot',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'currentBet',
        type: 'uint256',
      },
    ],
    name: 'HighCardGuess',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'HighCardTakeMoney',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'houseCard',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'houseSuit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerCard',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerSuit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'cutTheDeckResults',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'houseRoll',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerChoice',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'diceSize',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'diceCallResults',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'win',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isHeads',
        type: 'bool',
      },
    ],
    name: 'results',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BNBfee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'BNBtreasury',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BetHeads',
    outputs: [
      {
        internalType: 'bool',
        name: 'isHeads',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BetTails',
    outputs: [
      {
        internalType: 'bool',
        name: 'isHeads',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'FeeDivisor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'amountToSendAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'blackJackHitMe',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'blackJackHold',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'blackJackUser',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '_playerSuits',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_playerNumbers',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_houseSuits',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_houseNumbers',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256',
        name: '_currentBet',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_total',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_Dtotal',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '_gameStarted',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'numbers',
        type: 'uint256[]',
      },
    ],
    name: 'checkIfBust',
    outputs: [
      {
        internalType: 'bool',
        name: 'bust',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
    ],
    name: 'cutTheDeck',
    outputs: [
      {
        internalType: 'uint256',
        name: 'houseCard',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'houseSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerCard',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cutTheDeckQuick',
    outputs: [
      {
        internalType: 'uint256',
        name: 'houseCard',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'houseSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerCard',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'choice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'diceChoice',
        type: 'uint256',
      },
    ],
    name: 'diceCall',
    outputs: [
      {
        internalType: 'uint256',
        name: 'houseRoll',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerChoice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'diceSize',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feesCollected',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gameToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'highCard',
    outputs: [
      {
        internalType: 'uint256',
        name: 'currentCardSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentCardNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentBet',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'gameStarted',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'guessHigh',
        type: 'bool',
      },
    ],
    name: 'highCardGuess',
    outputs: [
      {
        internalType: 'bool',
        name: 'resultHigh',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'LastCardSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'LastCardNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newCardSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newCardNumber',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isJackpot',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'highCardTakeMoney',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'isGame',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxBetAllowed',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxBetDivisor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'multipliers',
    outputs: [
      {
        internalType: 'uint256',
        name: '_coinFlipM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deckCutM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall6M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall12M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall20M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highCardStart',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_blackJackM',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_isPaused',
        type: 'bool',
      },
    ],
    name: 'pauseGames',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'payOutDivisor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'potAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quickBetAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quickBetHeads',
    outputs: [
      {
        internalType: 'bool',
        name: 'isHeads',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quickBetTails',
    outputs: [
      {
        internalType: 'bool',
        name: 'isHeads',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'sendFeesGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'sendIsWinnerGame',
    outputs: [
      {
        internalType: 'uint256',
        name: 'payOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'multiplier',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'sendIsWinnerPrePaidGame',
    outputs: [
      {
        internalType: 'uint256',
        name: 'winnings',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'setAmountToSendAt',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newCost',
        type: 'uint256',
      },
    ],
    name: 'setCostBNB',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newDivisor',
        type: 'uint256',
      },
    ],
    name: 'setFeeDivisor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_coinFlipM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deckCutM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall6M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall12M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_diceCall20M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highCardStart',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_blackJackM',
        type: 'uint256',
      },
    ],
    name: 'setGameMultipliers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'setGameToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newLottery',
        type: 'address',
      },
    ],
    name: 'setLotteryAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'setMaxBetDivisor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newGame',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    name: 'setNewGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newPayOutDivisor',
        type: 'uint256',
      },
    ],
    name: 'setPayOutDivisor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'setQuickBetAmount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newTreasury',
        type: 'address',
      },
    ],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
    ],
    name: 'startBlackJack',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
    ],
    name: 'startHighCard',
    outputs: [
      {
        internalType: 'uint256',
        name: 'currentCardSuit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentCardNumber',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stateCallMain',
    outputs: [
      {
        internalType: 'uint256',
        name: '_maxBetAllowed',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_quickBetAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_payOutDivisor',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_potAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_bnbFee',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenTreasury',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawBNB',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawlAllGameToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawlToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const
