import { Abi } from "viem";

export const game2Abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_mainCasino',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_gameToken',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
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
        internalType: 'bool',
        name: 'isBlack',
        type: 'bool',
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
    name: 'blackOrRedResults',
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
        name: 'houseDice1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'houseDice2',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerDice1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerDice2',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'diceChoice',
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
        internalType: 'bool',
        name: 'isLoser',
        type: 'bool',
      },
    ],
    name: 'highRollerGame',
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
        internalType: 'uint256[]',
        name: 'results',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'selection',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'isWinner',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'horseRaceResults',
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
        name: 'houseDice1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'houseDice2',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerDice1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'playerDice2',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'diceChoice',
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
        internalType: 'bool',
        name: 'isLoser',
        type: 'bool',
      },
    ],
    name: 'lowRollerGame',
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
        name: 'suitChoice',
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
    name: 'suitCallResults',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'Double',
        type: 'bool',
      },
    ],
    name: 'PlayerRoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'Double',
        type: 'bool',
      },
    ],
    name: 'PlayerRollLR',
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
      {
        internalType: 'bool',
        name: '_isBlack',
        type: 'bool',
      },
    ],
    name: 'blackRed',
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
        internalType: 'bool',
        name: 'isBlack',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'amount',
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
        name: '_highRoller6M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highRoller12M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highRoller20M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_suitCallM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_blackRedM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_horseRace1M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_horseRace2M',
        type: 'uint256',
      },
    ],
    name: 'changeMultipliers',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'getMultipliers',
    outputs: [
      {
        internalType: 'uint256',
        name: '_highRoller6M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highRoller12M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_highRoller20M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_suitCallM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_blackRedM',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_horseRace1M',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_horseRace2M',
        type: 'uint256',
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
    name: 'highRollerInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'houseDice1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'houseDice2',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerDice1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerDice2',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentBet',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'diceChoice',
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
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_selection',
        type: 'uint256',
      },
    ],
    name: 'horseRace',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'results',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256',
        name: 'selection',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'isWinner',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
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
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'lowRollerInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: 'houseDice1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'houseDice2',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerDice1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'playerDice2',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentBet',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'diceChoice',
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
    inputs: [],
    name: 'mainCasino',
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
        name: '_MainCasino',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_gameToken',
        type: 'address',
      },
    ],
    name: 'mainCasinoSettings',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'racers',
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
    name: 'renounceOwnership',
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
      {
        internalType: 'uint256',
        name: 'diceChoice',
        type: 'uint256',
      },
    ],
    name: 'startHR',
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
      {
        internalType: 'uint256',
        name: 'diceChoice',
        type: 'uint256',
      },
    ],
    name: 'startLR',
    outputs: [],
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_betAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_suitChoice',
        type: 'uint256',
      },
    ],
    name: 'suitCallGame',
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
        name: 'suitChoice',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isWinner',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
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
] as const
