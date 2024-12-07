
export const compostAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_bnbAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_treasury",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BNBSTORED",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FeePercent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_TokenInput",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_TokenH",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_TokenA",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_TokenB",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_routerAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_routerAddress2",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippage",
				"type": "uint256"
			}
		],
		"name": "_1StakeToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_TokenA",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_TokenB",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_routerAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippage",
				"type": "uint256"
			}
		],
		"name": "_1StakeUsingBNB",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_LPToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_TokenInput",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_TokenA",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_TokenB",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_router",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_TokenH",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_router2",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippage",
				"type": "uint256"
			}
		],
		"name": "_BreakLPReturnToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_FeePercentInBip",
				"type": "uint256"
			}
		],
		"name": "_SetFeePercent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_TokenOut",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_RouterOut",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippage",
				"type": "uint256"
			}
		],
		"name": "_bnbToToken",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_TokenIn",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_AmountIn",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_TokenOut",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_RouterIn",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_RouterOut",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_slippage",
				"type": "uint256"
			}
		],
		"name": "_tokenToToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "setBNBBalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "treasury",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdawlBNB",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tokenAddress",
				"type": "address"
			}
		],
		"name": "withdrawlToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
] as const
