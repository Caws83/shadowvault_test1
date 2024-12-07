import { Abi } from "viem";

export const tokenPriceAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'factory',
        type: 'address',
      },
    ],
    name: 'getBNBPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: 'price',
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
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'factory',
        type: 'address',
      },
    ],
    name: 'TokenPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: 'num',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'den',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'usd',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
