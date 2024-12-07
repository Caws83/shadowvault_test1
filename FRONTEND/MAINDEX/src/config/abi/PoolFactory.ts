import { Abi } from "viem";

export const poolFactoryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_marsFactory',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_subFee',
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
        name: 'Pool',
        type: 'address',
      },
    ],
    name: 'createdPool',
    type: 'event',
  },
  {
    inputs: [],
    name: 'Controller',
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
        name: 'newController',
        type: 'address',
      },
    ],
    name: 'changeController',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newSubFee',
        type: 'uint256',
      },
    ],
    name: 'changeSubFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBEP20',
        name: 'stakingToken',
        type: 'address',
      },
      {
        internalType: 'contract IBEP20',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'createPool',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBEP20',
        name: 'stakingToken',
        type: 'address',
      },
      {
        internalType: 'contract IBEP20',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'createPoolOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBEP20',
        name: 'stakingToken',
        type: 'address',
      },
      {
        internalType: 'contract IBEP20',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'createPoolOwnerManual',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'number',
        type: 'uint256',
      },
    ],
    name: 'getPool',
    outputs: [
      {
        internalType: 'contract SmartPoolRenewable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'howManyPools',
    outputs: [
      {
        internalType: 'uint256',
        name: 'PoolCount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marsFactory',
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
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'subFee',
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
