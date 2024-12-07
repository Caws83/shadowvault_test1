import { Address } from "viem"

export const ultimateToken = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "__name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "__symbol",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "__decimals",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "_totalSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxWallet",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_maxTransactionAmount",
				"type": "uint256"
			},
			{
				"internalType": "address[4]",
				"name": "_accounts",
				"type": "address[4]"
			},
			{
				"internalType": "bool",
				"name": "_isMarketingFeeBaseToken",
				"type": "bool"
			},
			{
				"internalType": "uint16[10]",
				"name": "_fees",
				"type": "uint16[10]"
			},
			{
				"internalType": "address",
				"name": "_realOwner",
				"type": "address"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isEx",
				"type": "bool"
			}
		],
		"name": "ExcludedFromFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isExcluded",
				"type": "bool"
			}
		],
		"name": "ExcludedFromMaxTransactionAmount",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "marketingFeeTokens",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "marketingFeeBaseTokenSwapped",
				"type": "uint256"
			}
		],
		"name": "MarketingFeeTaken",
		"type": "event"
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "pair",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "value",
				"type": "bool"
			}
		],
		"name": "SetAutomatedMarketMakerPair",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokensForLiquidity",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "baseTokenForLiquidity",
				"type": "uint256"
			}
		],
		"name": "SwapAndLiquify",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TreasuryFeeTaken",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newSellBurnFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newBuyBurnFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldSellBurnFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldBuyBurnFee",
				"type": "uint16"
			}
		],
		"name": "UpdateBurnFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newSellLiquidityFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newBuyLiquidityFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldSellLiquidityFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldBuyLiquidityFee",
				"type": "uint16"
			}
		],
		"name": "UpdateLiquidityFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newSellMarketingFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newBuyMarketingFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldSellMarketingFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldBuyMarketingFee",
				"type": "uint16"
			}
		],
		"name": "UpdateMarketingFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newMarketingWallet",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "newIsMarketingFeeBaseToken",
				"type": "bool"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldMarketingWallet",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "oldIsMarketingFeeBaseToken",
				"type": "bool"
			}
		],
		"name": "UpdateMarketingWallet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newMaxTransactionAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldMaxTransactionAmount",
				"type": "uint256"
			}
		],
		"name": "UpdateMaxTransactionAmount",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newMaxWallet",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldMaxWallet",
				"type": "uint256"
			}
		],
		"name": "UpdateMaxWallet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newMinAmountToTakeFee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldMinAmountToTakeFee",
				"type": "uint256"
			}
		],
		"name": "UpdateMinAmountToTakeFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newSellRewardFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newBuyRewardFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldSellRewardFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldBuyRewardFee",
				"type": "uint16"
			}
		],
		"name": "UpdateRewardFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newSellTreasuryFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "newBuyTreasuryFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldSellTreasuryFee",
				"type": "uint16"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "oldBuyTreasuryFee",
				"type": "uint16"
			}
		],
		"name": "UpdateTreasuryFee",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newTreasuryWallet",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldTreasuryWallet",
				"type": "address"
			}
		],
		"name": "UpdateTreasuryWallet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldRouter",
				"type": "address"
			}
		],
		"name": "UpdateUniswapV2Router",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
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
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "automatedMarketMakerPairs",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
		"name": "baseTokenForPair",
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
		"name": "buyBurnFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyLiquidityFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyMarketingFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyRewardFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyTreasuryFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isEx",
				"type": "bool"
			}
		],
		"name": "excludeFromFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isEx",
				"type": "bool"
			}
		],
		"name": "excludeFromMaxTransactionAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "excludeFromReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "includeInReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isExcludedFromFee",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isExcludedFromMaxTransactionAmount",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "isExcludedFromReward",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isMarketingFeeBaseToken",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mainPair",
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
		"name": "mainRouter",
		"outputs": [
			{
				"internalType": "contract IUniswapV2Router02",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "marketingWallet",
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
		"name": "maxTransactionAmount",
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
		"name": "maxWallet",
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
		"name": "minAmountToTakeFee",
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
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "deductTransferFee",
				"type": "bool"
			}
		],
		"name": "reflectionFromToken",
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
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellBurnFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellLiquidityFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellMarketingFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellRewardFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sellTreasuryFee",
		"outputs": [
			{
				"internalType": "uint16",
				"name": "",
				"type": "uint16"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "pair",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "value",
				"type": "bool"
			}
		],
		"name": "setAutomatedMarketMakerPair",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "swapCaller",
		"outputs": [
			{
				"internalType": "contract SwapCaller",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "rAmount",
				"type": "uint256"
			}
		],
		"name": "tokenFromReflection",
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
		"name": "totalFees",
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
		"name": "totalSupply",
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
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
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
		"name": "treasuryBurn",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "treasuryWallet",
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
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_sellBurnFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_buyBurnFee",
				"type": "uint16"
			}
		],
		"name": "updateBurnFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_sellLiquidityFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_buyLiquidityFee",
				"type": "uint16"
			}
		],
		"name": "updateLiquidityFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_sellMarketingFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_buyMarketingFee",
				"type": "uint16"
			}
		],
		"name": "updateMarketingFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_marketingWallet",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_isMarketingFeeBaseToken",
				"type": "bool"
			}
		],
		"name": "updateMarketingWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxTransactionAmount",
				"type": "uint256"
			}
		],
		"name": "updateMaxTransactionAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxWallet",
				"type": "uint256"
			}
		],
		"name": "updateMaxWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_minAmountToTakeFee",
				"type": "uint256"
			}
		],
		"name": "updateMinAmountToTakeFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_sellRewardFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_buyRewardFee",
				"type": "uint16"
			}
		],
		"name": "updateRewardFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "_sellTreasuryFee",
				"type": "uint16"
			},
			{
				"internalType": "uint16",
				"name": "_buyTreasuryFee",
				"type": "uint16"
			}
		],
		"name": "updateTreasuryFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_treasuryWallet",
				"type": "address"
			}
		],
		"name": "updateTreasuryWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_baseTokenForPair",
				"type": "address"
			}
		],
		"name": "updateUniswapV2Pair",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "updateUniswapV2Router",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawETH",
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
			}
		],
		"name": "withdrawToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
] as const

export const byteCode =
"608060405260405162007c3c38038062007c3c833981016040819052620000269162001ddb565b62000031336200117f565b60405160009073449183e39d76fa4c1f516d3ea2feed3e8c99e8f19034908381818185875af1925050503d806000811462000089576040519150601f19603f3d011682016040523d82523d6000602084013e6200008e565b606091505b5050905080620000e55760405162461bcd60e51b815260206004820152601460248201527f6661696c20746f207472616e736665722066656500000000000000000000000060448201526064015b60405180910390fd5b604051620000f39062001bbf565b604051809103906000f08015801562000110573d6000803e3d6000fd5b50601c80546001600160a01b0319166001600160a01b03928316179055604086015160018054919092166001600160a81b031990911617600160a01b60ff8c1602179055600a620001628c8262001f69565b50600b620001718b8262001f69565b50600788905562000185886000196200204b565b620001939060001962002078565b60088190556001600160a01b03838116600090815260026020526040902091909155855116620002065760405162461bcd60e51b815260206004820152601d60248201527f6d61726b6574696e672077616c6c65742063616e206e6f7420626520300000006044820152606401620000dc565b60208501516001600160a01b0316620002625760405162461bcd60e51b815260206004820152601b60248201527f526f7574657220616464726573732063616e206e6f74206265203000000000006044820152606401620000dc565b60608501516001600160a01b0316620002be5760405162461bcd60e51b815260206004820152601c60248201527f54726561737572792077616c6c65742063616e206e6f742062652030000000006044820152606401620000dc565b845160608601516001600160a01b03918216911603620003475760405162461bcd60e51b815260206004820152603560248201527f54726561737572792077616c6c65742063616e206e6f742062652073616d652060448201527f77697468206d61726b6574696e672077616c6c657400000000000000000000006064820152608401620000dc565b61010083015160c084015160808501516040860151865161012c94939291620003709162002094565b6200037c919062002094565b62000388919062002094565b62000394919062002094565b61ffff161115620003e85760405162461bcd60e51b815260206004820152601560248201527f73656c6c20746f74616c20666565203c3d2033302500000000000000000000006044820152606401620000dc565b61012083015160e084015160a08501516060860151602087015161012c94939291620004149162002094565b62000420919062002094565b6200042c919062002094565b62000438919062002094565b61ffff1611156200048c5760405162461bcd60e51b815260206004820152601460248201527f62757920746f74616c20666565203c3d203330250000000000000000000000006044820152606401620000dc565b8251609661ffff90911610620004d65760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836001602002015161ffff1610620005245760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836002602002015161ffff1610620005725760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836003602002015161ffff1610620005c05760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836004602002015161ffff16106200060e5760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836005602002015161ffff16106200065c5760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836006602002015161ffff1610620006aa5760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836007602002015161ffff1610620006f85760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836008602002015161ffff1610620007465760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b6096836009602002015161ffff1610620007945760405162461bcd60e51b815260206004820152600e60248201526d6561636820666565203c2031352560901b6044820152606401620000dc565b8451601780546060880151601880546001600160a01b039283166001600160a01b031991909116179055871515600160a01b9081026001600160a81b0319909316948216948517831793849055604080519190940460ff16151581526000602082018190529492909116909117917fc8dfdd9b91ac62ee1bd8be3541ea02d8e584461c794c6e49e94ccf21c71ebcca910160405180910390a36018546040516000916001600160a01b0316907f79a52cbec002ef70283103eb4140713100276944fca2819713130141d04df183908390a3602085810151601d80546001600160a01b0319166001600160a01b039092169182179055604080516315ab88c960e31b81529051919263ad5c4648926004808401938290030181865afa158015620008c1573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620008e79190620020b9565b6001546001600160a01b039081169116146200097c57600154601d5460405163095ea7b360e01b81526001600160a01b039182166004820152600019602482015291169063095ea7b3906044016020604051808303816000875af115801562000954573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200097a9190620020d7565b505b601c54620009989030906001600160a01b0316600019620011cf565b601d54620009b49030906001600160a01b0316600019620011cf565b601d546040516000916001600160a01b0316907f8fc842bbd331dfa973645f4ed48b11683d501ebf1352708d77a5da2ab49a576e908390a3601d60009054906101000a90046001600160a01b03166001600160a01b031663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000a40573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000a669190620020b9565b6001546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af115801562000ab8573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000ade9190620020b9565b601e80546001600160a01b0319166001600160a01b039290921691909117905582516016805460208087015163ffffffff60281b1990921661ffff9485166501000000000090810261ffff60381b19169190911767010000000000000093861684021793849055604080519185048616825292909304909316928201929092526000818301819052606082015290517f95c5c99557725e816faf752c6675d63483841c28a7a009ed792470a9cb4dea239181900360800190a16040838101516016805460608088015163ffffffff60481b1990921661ffff948516690100000000000000000090810261ffff60581b1916919091176b0100000000000000000000009386168402179384905585519084048516815291909204909216602083015260008284018190529082015290517f1d6b62961d401d548eb1549c97109c0b905ccd7af9c3777d3076cc8438fdfe659181900360800190a160c08301516016805460e086015163ffffffff60681b1990911661ffff9384166d010000000000000000000000000090810261ffff60781b191691909117600160781b9285168302179283905560408051918404851682529190920490921660208201526000818301819052606082015290517f2893ef6309f9df0d45b134fcb021eb854592432db91782f02ce6b9029d1470319181900360800190a16101008301516016805461012086015163ffffffff60881b1990911661ffff938416600160881b90810261ffff60981b191691909117600160981b9285168302179283905560408051918404851682529190920490921660208201526000818301819052606082015290517f01f5c7a45d273917dfc98816f1dd17a88893a7338e7beaa4d305fc8c84f8fe259181900360800190a16080808401516016805460a087015161ffff908116630100000090810264ffff0000001961010096841687021664ffffffff00199094169390931792909217928390556040805194840482168552919092049091166020830152600090820181905260608201527f0a21d45dab14d5d2f53ae98d95d951cd627fcf1b5bc485174326568b5e0a4572910160405180910390a162000e0961271089620020f5565b601981905560408051918252600060208301527f772a06bc936eb749842080c472181e970cd4f23bd1ab7d0b84a80aec26910434910160405180910390a162000e5561271089620020f5565b86101562000ebb5760405162461bcd60e51b815260206004820152602c60248201527f6d61785472616e73616374696f6e416d6f756e74203e3d20746f74616c20737560448201526b070706c79202f2031303030360a41b6064820152608401620000dc565b62000ec961271089620020f5565b87101562000f245760405162461bcd60e51b815260206004820152602160248201527f6d617857616c6c6574203e3d20746f74616c20737570706c79202f20313030306044820152600360fc1b6064820152608401620000dc565b601a87905560408051888152600060208201527fff64d41f60feb77d52f64ae64a9fc3929d57a89d0cc55728762468bae5e0fe52910160405180910390a1601b86905560408051878152600060208201527f35eec0711af6fbe3039535323be51b57996b6945b0d55862607c7a02e52e4507910160405180910390a1600560209081527f7d509c07f0d4edcc2dd1b53aae68677132eb562dcba78e36381b63ccaf66e6ba8054600160ff19918216811790925560068054808401825560008051602062007c1c833981519152908101805461dead6001600160a01b0319918216179091553060008181526040808220805488168917905585548089019096559490930180549092168117909155601f86528282208054851686179055601780546001600160a01b0390811684528484208054871688179055601880548216855285852080548816891790558a8216808652868620805489168a1790557fef94442dfc0e910ca743614215a10fad3ff708bf5378f9c5c958c9192b3bf004805489168a1790559880527fcbaad361c71be11fa6bdbe0e740c6259be964b32182da2da47b54472477c6a17805488168917905592845284842080548716881790559054811683528383208054861687179055905481168252828220805485168617905594815220805490911682179055601e5462001122921690620012f7565b6200112d8262001436565b6040518881526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a350505050505050505050506200216e565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b038316620012335760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401620000dc565b6001600160a01b038216620012965760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401620000dc565b6001600160a01b0383811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b03821660009081526021602052604090205481151560ff9091161515036200138f5760405162461bcd60e51b815260206004820152603860248201527f4175746f6d61746564206d61726b6574206d616b65722070616972206973206160448201527f6c72656164792073657420746f20746861742076616c756500000000000000006064820152608401620000dc565b6001600160a01b0382166000908152602160205260409020805460ff19168215801591909117909155620013ce57620013c882620014f6565b620013d9565b620013d982620016fd565b6001600160a01b03821660008181526020808052604091829020805460ff191685151590811790915591519182527fffa9187bf1f18bf477bd0ea1bcbb64e93b6a98132473929edfce215cd9b16fab910160405180910390a25050565b6000546001600160a01b03163314620014815760405162461bcd60e51b8152602060048201819052602482015260008051602062007bfc8339815191526044820152606401620000dc565b6001600160a01b038116620014e85760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401620000dc565b620014f3816200117f565b50565b6000546001600160a01b03163314620015415760405162461bcd60e51b8152602060048201819052602482015260008051602062007bfc8339815191526044820152606401620000dc565b6001600160a01b03811660009081526005602052604090205460ff1615620015ac5760405162461bcd60e51b815260206004820152601b60248201527f4163636f756e7420697320616c7265616479206578636c7564656400000000006044820152606401620000dc565b600654603290620015bf9060016200210c565b11156200164b5760405162461bcd60e51b815260206004820152604d60248201527f43616e6e6f74206578636c756465206d6f7265207468616e203530206163636f60448201527f756e74732e2020496e636c75646520612070726576696f75736c79206578636c60648201526c3ab232b21030b2323932b9b99760991b608482015260a401620000dc565b6001600160a01b03811660009081526002602052604090205415620016a8576001600160a01b0381166000908152600260205260409020546200168e9062001973565b6001600160a01b0382166000908152600360205260409020555b6001600160a01b03166000818152600560205260408120805460ff1916600190811790915560068054918201815590915260008051602062007c1c8339815191520180546001600160a01b0319169091179055565b6000546001600160a01b03163314620017485760405162461bcd60e51b8152602060048201819052602482015260008051602062007bfc8339815191526044820152606401620000dc565b6001600160a01b03811660009081526005602052604090205460ff16620017b25760405162461bcd60e51b815260206004820152601760248201527f4163636f756e74206973206e6f74206578636c756465640000000000000000006044820152606401620000dc565b60005b6006548110156200196f57816001600160a01b031660068281548110620017e057620017e062001ec4565b6000918252602090912001546001600160a01b0316036200195a576001600160a01b0382166000908152600260205260409020546200181e620019fd565b6001600160a01b03841660009081526003602052604090205462001843919062002122565b6001600160a01b03841660009081526002602052604090208190556008546200186e90839062002078565b6200187a91906200210c565b6008556001600160a01b0383166000908152600560205260409020805460ff1916905560068054620018af9060019062002078565b81548110620018c257620018c262001ec4565b600091825260209091200154600680546001600160a01b039092169184908110620018f157620018f162001ec4565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060068054806200193357620019336200213c565b600082815260209020810160001990810180546001600160a01b0319169055019055505050565b80620019668162002152565b915050620017b5565b5050565b6000600854821115620019dc5760405162461bcd60e51b815260206004820152602a60248201527f416d6f756e74206d757374206265206c657373207468616e20746f74616c207260448201526965666c656374696f6e7360b01b6064820152608401620000dc565b6000620019e8620019fd565b9050620019f68184620020f5565b9392505050565b6000808062001a0b62001a23565b909250905062001a1c8183620020f5565b9250505090565b6008546007546000918291825b60065481101562001b8b5782600260006006848154811062001a565762001a5662001ec4565b60009182526020808320909101546001600160a01b03168352820192909252604001902054118062001ac5575081600360006006848154811062001a9e5762001a9e62001ec4565b60009182526020808320909101546001600160a01b03168352820192909252604001902054115b1562001adc57600854600754945094505050509091565b600260006006838154811062001af65762001af662001ec4565b60009182526020808320909101546001600160a01b0316835282019290925260400190205462001b27908462002078565b9250600360006006838154811062001b435762001b4362001ec4565b60009182526020808320909101546001600160a01b0316835282019290925260400190205462001b74908362002078565b91508062001b828162002152565b91505062001a30565b5060075460085462001b9e9190620020f5565b82101562001bb6576008546007549350935050509091565b90939092509050565b61063b80620075c183390190565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b038111828210171562001c0e5762001c0e62001bcd565b604052919050565b600082601f83011262001c2857600080fd5b81516001600160401b0381111562001c445762001c4462001bcd565b602062001c5a601f8301601f1916820162001be3565b828152858284870101111562001c6f57600080fd5b60005b8381101562001c8f57858101830151828201840152820162001c72565b506000928101909101919091529392505050565b805160ff8116811462001cb557600080fd5b919050565b80516001600160a01b038116811462001cb557600080fd5b600082601f83011262001ce457600080fd5b604051608081016001600160401b038111828210171562001d095762001d0962001bcd565b60405280608084018581111562001d1f57600080fd5b845b8181101562001d445762001d358162001cba565b83526020928301920162001d21565b509195945050505050565b8051801515811462001cb557600080fd5b600082601f83011262001d7257600080fd5b6040516101408082016001600160401b038111838210171562001d995762001d9962001bcd565b6040528301818582111562001dad57600080fd5b845b8281101562001d4457805161ffff8116811462001dcc5760008081fd5b82526020918201910162001daf565b6000806000806000806000806000806102c08b8d03121562001dfc57600080fd5b8a516001600160401b038082111562001e1457600080fd5b62001e228e838f0162001c16565b9b5060208d015191508082111562001e3957600080fd5b5062001e488d828e0162001c16565b99505062001e5960408c0162001ca3565b975060608b0151965060808b0151955060a08b0151945062001e7f8c60c08d0162001cd2565b935062001e906101408c0162001d4f565b925062001ea28c6101608d0162001d60565b915062001eb36102a08c0162001cba565b90509295989b9194979a5092959850565b634e487b7160e01b600052603260045260246000fd5b600181811c9082168062001eef57607f821691505b60208210810362001f1057634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111562001f6457600081815260208120601f850160051c8101602086101562001f3f5750805b601f850160051c820191505b8181101562001f605782815560010162001f4b565b5050505b505050565b81516001600160401b0381111562001f855762001f8562001bcd565b62001f9d8162001f96845462001eda565b8462001f16565b602080601f83116001811462001fd5576000841562001fbc5750858301515b600019600386901b1c1916600185901b17855562001f60565b600085815260208120601f198616915b82811015620020065788860151825594840194600190910190840162001fe5565b5085821015620020255787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601260045260246000fd5b6000826200205d576200205d62002035565b500690565b634e487b7160e01b600052601160045260246000fd5b818103818111156200208e576200208e62002062565b92915050565b61ffff818116838216019080821115620020b257620020b262002062565b5092915050565b600060208284031215620020cc57600080fd5b620019f68262001cba565b600060208284031215620020ea57600080fd5b620019f68262001d4f565b60008262002107576200210762002035565b500490565b808201808211156200208e576200208e62002062565b80820281158282048414176200208e576200208e62002062565b634e487b7160e01b600052603160045260246000fd5b60006001820162002167576200216762002062565b5060010190565b615443806200217e6000396000f3fe6080604052600436106103a65760003560e01c806385af30c5116101e7578063c8c8ebe41161010d578063e71dc3f5116100a0578063f420d00f1161006f578063f420d00f14610b54578063f637434214610b74578063f8b45b0514610b96578063fc59d23d14610bac57600080fd5b8063e71dc3f514610ac1578063e9481eee14610ae3578063f11a24d314610b12578063f2fde38b14610b3457600080fd5b8063dd62ed3e116100dc578063dd62ed3e14610a26578063de0aad5314610a6c578063df8408fe14610a8c578063e086e5ec14610aac57600080fd5b8063c8c8ebe4146109b0578063cf089e13146109c6578063cf188ad0146109e6578063d68f8cde14610a0657600080fd5b8063948384dc11610185578063a9059cbb11610154578063a9059cbb1461091e578063aa4980231461093e578063adb873bd1461095e578063b62496f51461098057600080fd5b8063948384dc146108a957806395d89b41146108c95780639a7a23d6146108de578063a457c2d7146108fe57600080fd5b80638da5cb5b116101c15780638da5cb5b146108415780638f0bc1671461085f57806391c1004a14610867578063921369131461088757600080fd5b806385af30c5146107c857806388f82020146107e8578063894760691461082157600080fd5b80634707c551116102cc57806370a082311161026a5780637bce5a04116102395780637bce5a04146107465780637cf84bd714610768578063809d458d146107885780638276e5b0146107a857600080fd5b806370a08231146106d1578063715018a6146106f157806373b9e82c1461070657806375f0a8741461072657600080fd5b806357e62b98116102a657806357e62b981461064c5780635c068a8c1461066d57806365b8dbc01461068f5780636b2fb124146106af57600080fd5b80634707c551146105dc57806352390c02146105fc5780635342acb41461061c57600080fd5b806323b872dd116103445780633685d419116103135780633685d4191461054457806339509351146105645780634549b039146105845780634626402b146105a457600080fd5b806323b872dd146104b85780632ae2f121146104d85780632d838119146104f8578063313ce5671461051857600080fd5b806313114a9d1161038057806313114a9d1461044257806318160ddd146104615780631c499ab0146104765780632073bd851461049857600080fd5b806306fdde03146103b2578063095ea7b3146103dd5780630cfe2f3f1461040d57600080fd5b366103ad57005b600080fd5b3480156103be57600080fd5b506103c7610bc2565b6040516103d49190614e48565b60405180910390f35b3480156103e957600080fd5b506103fd6103f8366004614e90565b610c54565b60405190151581526020016103d4565b34801561041957600080fd5b5060165461042f906301000000900461ffff1681565b60405161ffff90911681526020016103d4565b34801561044e57600080fd5b506009545b6040519081526020016103d4565b34801561046d57600080fd5b50600754610453565b34801561048257600080fd5b50610496610491366004614ebc565b610c6b565b005b3480156104a457600080fd5b506104966104b3366004614eec565b610d49565b3480156104c457600080fd5b506103fd6104d3366004614f1f565b610f48565b3480156104e457600080fd5b506104966104f3366004614f6e565b610f9b565b34801561050457600080fd5b50610453610513366004614ebc565b61107c565b34801561052457600080fd5b50600154600160a01b900460ff1660405160ff90911681526020016103d4565b34801561055057600080fd5b5061049661055f366004614fa7565b6110f9565b34801561057057600080fd5b506103fd61057f366004614e90565b611331565b34801561059057600080fd5b5061045361059f366004614fc4565b611368565b3480156105b057600080fd5b506018546105c4906001600160a01b031681565b6040516001600160a01b0390911681526020016103d4565b3480156105e857600080fd5b506104966105f7366004614f6e565b611415565b34801561060857600080fd5b50610496610617366004614fa7565b611579565b34801561062857600080fd5b506103fd610637366004614fa7565b601f6020526000908152604090205460ff1681565b34801561065857600080fd5b506017546103fd90600160a01b900460ff1681565b34801561067957600080fd5b5060165461042f90600160781b900461ffff1681565b34801561069b57600080fd5b506104966106aa366004614fa7565b611767565b3480156106bb57600080fd5b5060165461042f90600160681b900461ffff1681565b3480156106dd57600080fd5b506104536106ec366004614fa7565b611a7f565b3480156106fd57600080fd5b50610496611ade565b34801561071257600080fd5b50610496610721366004614ebc565b611b14565b34801561073257600080fd5b506017546105c4906001600160a01b031681565b34801561075257600080fd5b5060165461042f90600160581b900461ffff1681565b34801561077457600080fd5b506001546105c4906001600160a01b031681565b34801561079457600080fd5b506104966107a3366004614fa7565b611bc9565b3480156107b457600080fd5b506104966107c3366004614eec565b611d6d565b3480156107d457600080fd5b50601e546105c4906001600160a01b031681565b3480156107f457600080fd5b506103fd610803366004614fa7565b6001600160a01b031660009081526005602052604090205460ff1690565b34801561082d57600080fd5b5061049661083c366004614fa7565b611f6c565b34801561084d57600080fd5b506000546001600160a01b03166105c4565b61049661206d565b34801561087357600080fd5b50610496610882366004614fa7565b6124c5565b34801561089357600080fd5b5060165461042f90600160481b900461ffff1681565b3480156108b557600080fd5b506104966108c4366004614eec565b612788565b3480156108d557600080fd5b506103c7612983565b3480156108ea57600080fd5b506104966108f9366004614f6e565b612992565b34801561090a57600080fd5b506103fd610919366004614e90565b6129c6565b34801561092a57600080fd5b506103fd610939366004614e90565b6129fd565b34801561094a57600080fd5b50610496610959366004614ebc565b612a0a565b34801561096a57600080fd5b5060165461042f90600160881b900461ffff1681565b34801561098c57600080fd5b506103fd61099b366004614fa7565b60216020526000908152604090205460ff1681565b3480156109bc57600080fd5b50610453601b5481565b3480156109d257600080fd5b506104966109e1366004614eec565b612aea565b3480156109f257600080fd5b50601d546105c4906001600160a01b031681565b348015610a1257600080fd5b50610496610a21366004614eec565b612cef565b348015610a3257600080fd5b50610453610a41366004614fe9565b6001600160a01b03918216600090815260046020908152604080832093909416825291909152205490565b348015610a7857600080fd5b5060165461042f90610100900461ffff1681565b348015610a9857600080fd5b50610496610aa7366004614f6e565b612ef4565b348015610ab857600080fd5b50610496612fd0565b348015610acd57600080fd5b5060165461042f90600160981b900461ffff1681565b348015610aef57600080fd5b506103fd610afe366004614fa7565b602080526000908152604090205460ff1681565b348015610b1e57600080fd5b5060165461042f90600160381b900461ffff1681565b348015610b4057600080fd5b50610496610b4f366004614fa7565b613094565b348015610b6057600080fd5b50601c546105c4906001600160a01b031681565b348015610b8057600080fd5b5060165461042f90600160281b900461ffff1681565b348015610ba257600080fd5b50610453601a5481565b348015610bb857600080fd5b5061045360195481565b6060600a8054610bd190615017565b80601f0160208091040260200160405190810160405280929190818152602001828054610bfd90615017565b8015610c4a5780601f10610c1f57610100808354040283529160200191610c4a565b820191906000526020600020905b815481529060010190602001808311610c2d57829003601f168201915b5050505050905090565b6000610c6133848461312c565b5060015b92915050565b6000546001600160a01b03163314610c9e5760405162461bcd60e51b8152600401610c9590615051565b60405180910390fd5b612710600754610cae919061509c565b811015610d075760405162461bcd60e51b815260206004820152602160248201527f6d617857616c6c6574203e3d20746f74616c20737570706c79202f20313030306044820152600360fc1b6064820152608401610c95565b601a546040805183815260208101929092527fff64d41f60feb77d52f64ae64a9fc3929d57a89d0cc55728762468bae5e0fe52910160405180910390a1601a55565b6000546001600160a01b03163314610d735760405162461bcd60e51b8152600401610c9590615051565b60165461012c9061ffff6101008204811691600160681b8104821691600160481b8204811691610dac91600160281b90910416876150be565b610db691906150be565b610dc091906150be565b610dca91906150be565b61ffff161115610dec5760405162461bcd60e51b8152600401610c95906150d9565b60165461012c9061ffff63010000008204811691600160781b8104821691600160581b8204811691610e2791600160381b90910416866150be565b610e3191906150be565b610e3b91906150be565b610e4591906150be565b61ffff161115610e675760405162461bcd60e51b8152600401610c9590615108565b60968261ffff161115610e8c5760405162461bcd60e51b8152600401610c9590615136565b60968161ffff161115610eb15760405162461bcd60e51b8152600401610c959061515f565b6016546040805161ffff85811682528481166020830152600160881b8404811682840152600160981b9093049092166060830152517f01f5c7a45d273917dfc98816f1dd17a88893a7338e7beaa4d305fc8c84f8fe259181900360800190a16016805463ffffffff60881b1916600160881b61ffff9485160261ffff60981b191617600160981b9290931691909102919091179055565b6000610f55848484613250565b6001600160a01b038416600090815260046020908152604080832033808552925290912054610f90918691610f8b908690615187565b61312c565b5060015b9392505050565b6000546001600160a01b03163314610fc55760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b038216600090815260208052604090205481151560ff90911615150361101e5760405162461bcd60e51b8152602060048201526007602482015266616c726561647960c81b6044820152606401610c95565b6001600160a01b03821660008181526020808052604091829020805460ff191685151590811790915591519182527f82170bbd72c16b30c410014b7382121a699ed119a182e48a0b6cadcc89104ac991015b60405180910390a25050565b60006008548211156110e35760405162461bcd60e51b815260206004820152602a60248201527f416d6f756e74206d757374206265206c657373207468616e20746f74616c207260448201526965666c656374696f6e7360b01b6064820152608401610c95565b60006110ed61360f565b9050610f94818461509c565b6000546001600160a01b031633146111235760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b03811660009081526005602052604090205460ff1661118b5760405162461bcd60e51b815260206004820152601760248201527f4163636f756e74206973206e6f74206578636c756465640000000000000000006044820152606401610c95565b60005b60065481101561132d57816001600160a01b0316600682815481106111b5576111b561519a565b6000918252602090912001546001600160a01b03160361131b576001600160a01b0382166000908152600260205260409020546111f061360f565b6001600160a01b03841660009081526003602052604090205461121391906151b0565b6001600160a01b038416600090815260026020526040902081905560085461123c908390615187565b61124691906151c7565b6008556001600160a01b0383166000908152600560205260409020805460ff191690556006805461127990600190615187565b815481106112895761128961519a565b600091825260209091200154600680546001600160a01b0390921691849081106112b5576112b561519a565b9060005260206000200160006101000a8154816001600160a01b0302191690836001600160a01b0316021790555060068054806112f4576112f46151da565b600082815260209020810160001990810180546001600160a01b0319169055019055505050565b80611325816151f0565b91505061118e565b5050565b3360008181526004602090815260408083206001600160a01b03871684529091528120549091610c61918590610f8b9086906151c7565b60006007548311156113bc5760405162461bcd60e51b815260206004820152601f60248201527f416d6f756e74206d757374206265206c657373207468616e20737570706c79006044820152606401610c95565b60006113c661360f565b9050826113e35760006113d982866151b0565b9250610c65915050565b60006113ee85613632565b505050505090506000828261140391906151b0565b9350610c6592505050565b5092915050565b6000546001600160a01b0316331461143f5760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b0382166114955760405162461bcd60e51b815260206004820152601b60248201527f6d61726b6574696e672077616c6c65742063616e2774206265203000000000006044820152606401610c95565b6018546001600160a01b03908116908316036114c35760405162461bcd60e51b8152600401610c9590615209565b601754604080518315158152600160a01b830460ff16151560208201526001600160a01b03928316928516917fc8dfdd9b91ac62ee1bd8be3541ea02d8e584461c794c6e49e94ccf21c71ebcca910160405180910390a360178054911515600160a01b026001600160a81b03199092166001600160a01b039093169283179190911790556000908152601f60209081526040808320805460ff199081166001908117909255928052922080549091169091179055565b6000546001600160a01b031633146115a35760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b03811660009081526005602052604090205460ff161561160c5760405162461bcd60e51b815260206004820152601b60248201527f4163636f756e7420697320616c7265616479206578636c7564656400000000006044820152606401610c95565b60065460329061161d9060016151c7565b11156116a75760405162461bcd60e51b815260206004820152604d60248201527f43616e6e6f74206578636c756465206d6f7265207468616e203530206163636f60448201527f756e74732e2020496e636c75646520612070726576696f75736c79206578636c60648201526c3ab232b21030b2323932b9b99760991b608482015260a401610c95565b6001600160a01b03811660009081526002602052604090205415611701576001600160a01b0381166000908152600260205260409020546116e79061107c565b6001600160a01b0382166000908152600360205260409020555b6001600160a01b03166000818152600560205260408120805460ff191660019081179091556006805491820181559091527ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f0180546001600160a01b0319169091179055565b6000546001600160a01b031633146117915760405162461bcd60e51b8152600401610c9590615051565b601d546001600160a01b03908116908216036117fb5760405162461bcd60e51b815260206004820152602360248201527f54686520726f7574657220616c7265616479206861732074686174206164647260448201526265737360e81b6064820152608401610c95565b601d546040516001600160a01b03918216918316907f8fc842bbd331dfa973645f4ed48b11683d501ebf1352708d77a5da2ab49a576e90600090a3601d80546001600160a01b0319166001600160a01b0383169081179091556040805163c45a015560e01b815290516000929163c45a01559160048083019260209291908290030181865afa158015611892573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118b6919061525c565b6001546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af1158015611907573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061192b919061525c565b601e80546001600160a01b0319166001600160a01b0383811691909117909155601d549192506119609130911660001961312c565b601d60009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa1580156119b3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906119d7919061525c565b6001546001600160a01b03908116911614611a6857600154601d5460405163095ea7b360e01b81526001600160a01b039182166004820152600019602482015291169063095ea7b3906044016020604051808303816000875af1158015611a42573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a669190615279565b505b601e5461132d906001600160a01b0316600161369c565b6001600160a01b03811660009081526005602052604081205460ff1615611abc57506001600160a01b031660009081526003602052604090205490565b6001600160a01b038216600090815260026020526040902054610c659061107c565b6000546001600160a01b03163314611b085760405162461bcd60e51b8152600401610c9590615051565b611b1260006137cc565b565b6000546001600160a01b03163314611b3e5760405162461bcd60e51b8152600401610c9590615051565b60008111611b875760405162461bcd60e51b815260206004820152601660248201527506d696e416d6f756e74546f54616b65466565203e20360541b6044820152606401610c95565b6019546040805183815260208101929092527f772a06bc936eb749842080c472181e970cd4f23bd1ab7d0b84a80aec26910434910160405180910390a1601955565b6000546001600160a01b03163314611bf35760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b038116611c495760405162461bcd60e51b815260206004820152601a60248201527f54726561737572792077616c6c65742063616e277420626520300000000000006044820152606401610c95565b306001600160a01b03821603611cb45760405162461bcd60e51b815260206004820152602a60248201527f54726561737572792077616c6c65742063616e2774206265207468652073616d604482015269329030b9903a37b5b2b760b11b6064820152608401610c95565b6017546001600160a01b03808316911603611ce15760405162461bcd60e51b8152600401610c9590615209565b6018546040516001600160a01b03918216918316907f79a52cbec002ef70283103eb4140713100276944fca2819713130141d04df18390600090a3601880546001600160a01b039092166001600160a01b0319909216821790556000908152601f60209081526040808320805460ff199081166001908117909255928052922080549091169091179055565b6000546001600160a01b03163314611d975760405162461bcd60e51b8152600401610c9590615051565b60165461012c9061ffff600160881b82048116916101008104821691600160481b8204811691611dd091600160281b90910416876150be565b611dda91906150be565b611de491906150be565b611dee91906150be565b61ffff161115611e105760405162461bcd60e51b8152600401610c95906150d9565b60165461012c9061ffff600160981b820481169163010000008104821691600160581b8204811691611e4b91600160381b90910416866150be565b611e5591906150be565b611e5f91906150be565b611e6991906150be565b61ffff161115611e8b5760405162461bcd60e51b8152600401610c9590615108565b60968261ffff161115611eb05760405162461bcd60e51b8152600401610c9590615136565b60968161ffff161115611ed55760405162461bcd60e51b8152600401610c959061515f565b6016546040805161ffff85811682528481166020830152600160681b8404811682840152600160781b9093049092166060830152517f2893ef6309f9df0d45b134fcb021eb854592432db91782f02ce6b9029d1470319181900360800190a16016805463ffffffff60681b1916600160681b61ffff9485160261ffff60781b191617600160781b9290931691909102919091179055565b6000546001600160a01b03163314611f965760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b0381163003611fdc5760405162461bcd60e51b815260206004820152600b60248201526a139bdd08185b1b1bddd95960aa1b6044820152606401610c95565b61206a611ff16000546001600160a01b031690565b6040516370a0823160e01b81523060048201526001600160a01b038416906370a0823190602401602060405180830381865afa158015612035573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906120599190615296565b6001600160a01b038416919061381c565b50565b604080516002808252606082018352600092602083019080368337505060015482519293506001600160a01b0316918391506000906120ae576120ae61519a565b60200260200101906001600160a01b031690816001600160a01b03168152505030816001815181106120e2576120e261519a565b6001600160a01b03928316602091820292909201810191909152601d54604080516315ab88c960e31b81529051919093169263ad5c46489260048083019391928290030181865afa15801561213b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061215f919061525c565b6001600160a01b03168160008151811061217b5761217b61519a565b60200260200101516001600160a01b03160361220557601d5460185460405163b6f9de9560e01b81526001600160a01b039283169263b6f9de959234926121ce92600092889291169042906004016152f3565b6000604051808303818588803b1580156121e757600080fd5b505af11580156121fb573d6000803e3d6000fd5b505050505061230d565b6001546000906001600160a01b03166370a08231336040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602401602060405180830381865afa15801561225e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906122829190615296565b905061229c336001546001600160a01b0316903084613884565b601d54601854604051635c11d79560e01b81526001600160a01b0392831692635c11d795926122d992869260009289929116904290600401615328565b600060405180830381600087803b1580156122f357600080fd5b505af1158015612307573d6000803e3d6000fd5b50505050505b6018546001600160a01b031660009081526005602052604090205460ff16156123fb576018546001600160a01b03166000908152600360205260409020546007546123589190615187565b6007556018546001600160a01b03166000908152600260205260409020546008546123839190615187565b6008556018546001600160a01b031660008181526003602090815260408083205490519081529192916000805160206153ee833981519152910160405180910390a3601880546001600160a01b0390811660009081526002602090815260408083208390559354909216815260039091529081205550565b6018546001600160a01b031660009081526002602052604081205461241f9061107c565b90508060075461242f9190615187565b6007556018546001600160a01b031660009081526002602052604090205460085461245a9190615187565b6008556018546040518281526000916001600160a01b0316906000805160206153ee8339815191529060200160405180910390a350601880546001600160a01b0390811660009081526002602090815260408083208390559354909216815260039091529081205550565b6000546001600160a01b031633146124ef5760405162461bcd60e51b8152600401610c9590615051565b6001546001600160a01b03908116908216036125635760405162461bcd60e51b815260206004820152602d60248201527f5468652062617365546f6b656e466f725061697220616c72656164792068617360448201526c2074686174206164647265737360981b6064820152608401610c95565b600180546001600160a01b0319166001600160a01b0383811691909117909155601d546040805163c45a015560e01b81529051919092169163c45a01559160048083019260209291908290030181865afa1580156125c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906125e9919061525c565b6001546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af115801561263a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061265e919061525c565b601e80546001600160a01b0319166001600160a01b03928316179055601d54604080516315ab88c960e31b81529051919092169163ad5c46489160048083019260209291908290030181865afa1580156126bc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906126e0919061525c565b6001546001600160a01b0390811691161461277157600154601d5460405163095ea7b360e01b81526001600160a01b039182166004820152600019602482015291169063095ea7b3906044016020604051808303816000875af115801561274b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061276f9190615279565b505b601e5461206a906001600160a01b0316600161369c565b6000546001600160a01b031633146127b25760405162461bcd60e51b8152600401610c9590615051565b60165461012c9061ffff600160881b8204811691600160681b8104821691600160481b82048116916127ed91600160281b90910416876150be565b6127f791906150be565b61280191906150be565b61280b91906150be565b61ffff16111561282d5760405162461bcd60e51b8152600401610c95906150d9565b60165461012c9061ffff600160981b8204811691600160781b8104821691600160581b820481169161286891600160381b90910416866150be565b61287291906150be565b61287c91906150be565b61288691906150be565b61ffff1611156128a85760405162461bcd60e51b8152600401610c9590615108565b60968261ffff1611156128cd5760405162461bcd60e51b8152600401610c9590615136565b60968161ffff1611156128f25760405162461bcd60e51b8152600401610c959061515f565b6016546040805161ffff85811682528481166020830152610100840481168284015263010000009093049092166060830152517f0a21d45dab14d5d2f53ae98d95d951cd627fcf1b5bc485174326568b5e0a45729181900360800190a16016805464ffffffff00191661010061ffff9485160264ffff00000019161763010000009290931691909102919091179055565b6060600b8054610bd190615017565b6000546001600160a01b031633146129bc5760405162461bcd60e51b8152600401610c9590615051565b61132d828261369c565b3360008181526004602090815260408083206001600160a01b03871684529091528120549091610c61918590610f8b908690615187565b6000610c61338484613250565b6000546001600160a01b03163314612a345760405162461bcd60e51b8152600401610c9590615051565b612710600754612a44919061509c565b811015612aa85760405162461bcd60e51b815260206004820152602c60248201527f6d61785472616e73616374696f6e416d6f756e74203e3d20746f74616c20737560448201526b070706c79202f2031303030360a41b6064820152608401610c95565b601b546040805183815260208101929092527f35eec0711af6fbe3039535323be51b57996b6945b0d55862607c7a02e52e4507910160405180910390a1601b55565b6000546001600160a01b03163314612b145760405162461bcd60e51b8152600401610c9590615051565b60165461012c9061ffff600160881b8204811691600160681b81048216916101008204811691612b4d91600160281b90910416876150be565b612b5791906150be565b612b6191906150be565b612b6b91906150be565b61ffff161115612b8d5760405162461bcd60e51b8152600401610c95906150d9565b60165461012c9061ffff600160981b8204811691600160781b810482169163010000008204811691612bc891600160381b90910416866150be565b612bd291906150be565b612bdc91906150be565b612be691906150be565b61ffff161115612c085760405162461bcd60e51b8152600401610c9590615108565b60968261ffff161115612c2d5760405162461bcd60e51b8152600401610c9590615136565b60968161ffff161115612c525760405162461bcd60e51b8152600401610c959061515f565b6016546040805161ffff85811682528481166020830152600160481b8404811682840152600160581b9093049092166060830152517f1d6b62961d401d548eb1549c97109c0b905ccd7af9c3777d3076cc8438fdfe659181900360800190a1601680546cffffffff0000000000000000001916600160481b61ffff9485160261ffff60581b191617600160581b9290931691909102919091179055565b6000546001600160a01b03163314612d195760405162461bcd60e51b8152600401610c9590615051565b60165461012c9061ffff600160881b8204811691600160681b81048216916101008204811691612d5291600160481b90910416876150be565b612d5c91906150be565b612d6691906150be565b612d7091906150be565b61ffff161115612d925760405162461bcd60e51b8152600401610c95906150d9565b60165461012c9061ffff600160981b8204811691600160781b810482169163010000008204811691612dcd91600160581b90910416866150be565b612dd791906150be565b612de191906150be565b612deb91906150be565b61ffff161115612e0d5760405162461bcd60e51b8152600401610c9590615108565b60968261ffff161115612e325760405162461bcd60e51b8152600401610c9590615136565b60968161ffff161115612e575760405162461bcd60e51b8152600401610c959061515f565b6016546040805161ffff85811682528481166020830152600160281b8404811682840152600160381b9093049092166060830152517f95c5c99557725e816faf752c6675d63483841c28a7a009ed792470a9cb4dea239181900360800190a16016805468ffffffff00000000001916600160281b61ffff9485160268ffff00000000000000191617600160381b9290931691909102919091179055565b6000546001600160a01b03163314612f1e5760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b0382166000908152601f602052604090205481151560ff909116151503612f785760405162461bcd60e51b8152602060048201526007602482015266616c726561647960c81b6044820152606401610c95565b6001600160a01b0382166000818152601f6020908152604091829020805460ff191685151590811790915591519182527f2d43abd87b27cee7b0aa8c6f7e0b4a3247b683262a83cbc2318b0df398a49aa99101611070565b6000546001600160a01b03163314612ffa5760405162461bcd60e51b8152600401610c9590615051565b600080546040516001600160a01b039091169047908381818185875af1925050503d8060008114613047576040519150601f19603f3d011682016040523d82523d6000602084013e61304c565b606091505b505090508061206a5760405162461bcd60e51b815260206004820152601460248201527311985a5b1959081a5b881dda5d1a191c985dd85b60621b6044820152606401610c95565b6000546001600160a01b031633146130be5760405162461bcd60e51b8152600401610c9590615051565b6001600160a01b0381166131235760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610c95565b61206a816137cc565b6001600160a01b03831661318e5760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610c95565b6001600160a01b0382166131ef5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610c95565b6001600160a01b0383811660008181526004602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b0383166132b45760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610c95565b6001600160a01b0382166133165760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610c95565b600061332130611a7f565b6019546016549192508210159060ff1615801561333b5750805b801561335c5750601e5460009061335a906001600160a01b0316611a7f565b115b801561338057506001600160a01b03841660009081526021602052604090205460ff165b1561338d5761338d6138c2565b6133c8600c8054600d55600e8054600f5560108054601155601280546013556014805460155560009081905590819055908190559182905555565b60165460ff161580156133f457506001600160a01b0385166000908152601f602052604090205460ff16155b801561341957506001600160a01b0384166000908152601f602052604090205460ff16155b156134e8576001600160a01b03851660009081526021602052604090205460ff16156134865760165461ffff630100000082048116600c55600160381b82048116600e55600160581b82048116601055600160781b82048116601255600160981b909104166014556134e8565b6001600160a01b03841660009081526021602052604090205460ff16156134e85760165461ffff61010082048116600c55600160281b82048116600e55600160481b82048116601055600160681b82048116601255600160881b909104166014555b6134f3858585614152565b613516601554601455601354601255600d54600c55600f54600e55601154601055565b60165460ff16613608576001600160a01b038516600090815260208052604090205460ff1661359057601b5483106135905760405162461bcd60e51b815260206004820152601d60248201527f45524332303a2065786365656473207472616e73666572206c696d69740000006044820152606401610c95565b6001600160a01b038416600090815260208052604090205460ff1661360857601a546135bb85611a7f565b106136085760405162461bcd60e51b815260206004820152601f60248201527f45524332303a2065786365656473206d61782077616c6c6574206c696d6974006044820152606401610c95565b5050505050565b600080600061361c6145eb565b909250905061362b818361509c565b9250505090565b60008060008060008060006136468861476e565b905060006136538961478b565b905060006136608a61479e565b9050600061366d8b6147b1565b9050600061367a8c6147c4565b905060006136878d6147d7565b9d959c50939a50919850965094509092505050565b6001600160a01b03821660009081526021602052604090205481151560ff9091161515036137325760405162461bcd60e51b815260206004820152603860248201527f4175746f6d61746564206d61726b6574206d616b65722070616972206973206160448201527f6c72656164792073657420746f20746861742076616c756500000000000000006064820152608401610c95565b6001600160a01b0382166000908152602160205260409020805460ff1916821580159190911790915561376d5761376882611579565b613776565b613776826110f9565b6001600160a01b03821660008181526020808052604091829020805460ff191685151590811790915591519182527fffa9187bf1f18bf477bd0ea1bcbb64e93b6a98132473929edfce215cd9b16fab9101611070565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6040516001600160a01b03831660248201526044810182905261387f90849063a9059cbb60e01b906064015b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b03199093169290921790915261482a565b505050565b6040516001600160a01b03808516602483015283166044820152606481018290526138bc9085906323b872dd60e01b90608401613848565b50505050565b6016805460ff1916600117905560006138da30611a7f565b905060006024546023546022546138f191906151c7565b6138fb91906151c7565b905080158061390957508082105b15613915575050614146565b60006002602254613926919061509c565b90506000601d60009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa15801561397d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906139a1919061525c565b6001546001600160a01b03908116911614613a27576001546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa1580156139fe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613a229190615296565b613a29565b475b9050600080601760149054906101000a900460ff1615613d5557600060245460235486613a5691906151c7565b613a6091906151c7565b90508015613a7157613a71816148fc565b601d54604080516315ab88c960e31b815290516000926001600160a01b03169163ad5c46489160048083019260209291908290030181865afa158015613abb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613adf919061525c565b6001546001600160a01b03908116911614613b6f576001546040516370a0823160e01b815230600482015286916001600160a01b0316906370a0823190602401602060405180830381865afa158015613b3c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613b609190615296565b613b6a9190615187565b613b79565b613b798547615187565b905060008260235483613b8c91906151b0565b613b96919061509c565b905082613ba388846151b0565b613bad919061509c565b945084613bba8284615187565b613bc49190615187565b93508015613d4d57601d60009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa158015613c1f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613c43919061525c565b6001546001600160a01b03918216911603613cf5576017546040516000916001600160a01b03169083908381818185875af1925050503d8060008114613ca5576040519150601f19603f3d011682016040523d82523d6000602084013e613caa565b606091505b505090508015613cef576040805160008152602081018490527f6f92bce3e91466137aa4d5474fe565c002872fb18ed6af4a856959be0a81277a910160405180910390a15b50613d4d565b601754600154613d12916001600160a01b0391821691168361381c565b6040805160008152602081018390527f6f92bce3e91466137aa4d5474fe565c002872fb18ed6af4a856959be0a81277a910160405180910390a15b505050613f09565b600060245485613d6591906151c7565b90508015613d7657613d76816148fc565b601d54604080516315ab88c960e31b815290516000926001600160a01b03169163ad5c46489160048083019260209291908290030181865afa158015613dc0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613de4919061525c565b6001546001600160a01b03908116911614613e74576001546040516370a0823160e01b815230600482015286916001600160a01b0316906370a0823190602401602060405180830381865afa158015613e41573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613e659190615296565b613e6f9190615187565b613e7e565b613e7e8547615187565b905081613e8b87836151b0565b613e95919061509c565b9350613ea18482615187565b60235490935015613f0657601754602354613ec99130916001600160a01b0390911690613250565b60235460408051918252600060208301527f6f92bce3e91466137aa4d5474fe565c002872fb18ed6af4a856959be0a81277a910160405180910390a15b50505b600084118015613f195750600082115b15613f6257613f288483614abc565b60408051858152602081018490527f28fc98272ce761178794ad6768050fea1648e07f1e2ffe15afd3a290f8381486910160405180910390a15b80156140db57601d60009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa158015613fbb573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613fdf919061525c565b6001546001600160a01b0391821691160361408a576018546040516000916001600160a01b03169083908381818185875af1925050503d8060008114614041576040519150601f19603f3d011682016040523d82523d6000602084013e614046565b606091505b505090508015614084576040518281527fe3630e0003fb3e9f9d835bb839022e52ffd576f9f35c395dd17517106f78cb339060200160405180910390a15b506140db565b6018546001546140a7916001600160a01b0391821691168361381c565b6040518181527fe3630e0003fb3e9f9d835bb839022e52ffd576f9f35c395dd17517106f78cb339060200160405180910390a15b6000602381905560248190556022819055546001600160a01b0316156141245761411f306141116000546001600160a01b031690565b61411a30611a7f565b613250565b61413f565b60185461413f9030906001600160a01b031661411a82611a7f565b5050505050505b6016805460ff19169055565b60008060008060008061416487613632565b955095509550955095509550600061417a61360f565b90508160075461418a9190615187565b60075561419781836151b0565b6008546141a49190615187565b6008556040518281526000906001600160a01b038c16906000805160206153ee8339815191529060200160405180910390a3846022546141e491906151c7565b6022556023546141f59085906151c7565b6023556024546142069084906151c7565b60245560008361421686886151c7565b61422091906151c7565b905061422c82826151b0565b3060009081526002602052604090205461424691906151c7565b3060009081526002602090815260408083209390935560059052205460ff161561429657306000908152600360205260409020546142859082906151c7565b306000908152600360205260409020555b506001600160a01b038a1660009081526005602052604090205460ff1680156142d857506001600160a01b03891660009081526005602052604090205460ff16155b156143ab576001600160a01b038a16600090815260036020526040902054614301908990615187565b6001600160a01b038b1660009081526003602052604090205561432481896151b0565b6001600160a01b038b166000908152600260205260409020546143479190615187565b6001600160a01b038b1660009081526002602052604090205561436a81886151b0565b6001600160a01b038a1660009081526002602052604090205461438d91906151c7565b6001600160a01b038a16600090815260026020526040902055614591565b6001600160a01b038a1660009081526005602052604090205460ff161580156143ec57506001600160a01b03891660009081526005602052604090205460ff165b15614478576143fb81896151b0565b6001600160a01b038b1660009081526002602052604090205461441e9190615187565b6001600160a01b03808c16600090815260026020908152604080832094909455918c168152600390915220546144559088906151c7565b6001600160a01b038a1660009081526003602052604090205561436a81886151b0565b6001600160a01b038a1660009081526005602052604090205460ff1680156144b857506001600160a01b03891660009081526005602052604090205460ff165b15614504576001600160a01b038a166000908152600360205260409020546144e1908990615187565b6001600160a01b038b166000908152600360205260409020556143fb81896151b0565b61450e81896151b0565b6001600160a01b038b166000908152600260205260409020546145319190615187565b6001600160a01b038b1660009081526002602052604090205561455481886151b0565b6001600160a01b038a1660009081526002602052604090205461457791906151c7565b6001600160a01b038a166000908152600260205260409020555b6145a461459e82886151b0565b87614c7d565b886001600160a01b03168a6001600160a01b03166000805160206153ee833981519152896040516145d791815260200190565b60405180910390a350505050505050505050565b6008546007546000918291825b60065481101561473d5782600260006006848154811061461a5761461a61519a565b60009182526020808320909101546001600160a01b031683528201929092526040019020541180614685575081600360006006848154811061465e5761465e61519a565b60009182526020808320909101546001600160a01b03168352820192909252604001902054115b1561469b57600854600754945094505050509091565b60026000600683815481106146b2576146b261519a565b60009182526020808320909101546001600160a01b031683528201929092526040019020546146e19084615187565b925060036000600683815481106146fa576146fa61519a565b60009182526020808320909101546001600160a01b031683528201929092526040019020546147299083615187565b915080614735816151f0565b9150506145f8565b5060075460085461474e919061509c565b821015614765576008546007549350935050509091565b90939092509050565b60006103e8600c548361478191906151b0565b610c65919061509c565b60006103e8600e548361478191906151b0565b60006103e86010548361478191906151b0565b60006103e86012548361478191906151b0565b60006103e86014548361478191906151b0565b60006103e8601054600e54600c546012546014546103e86147f89190615187565b6148029190615187565b61480c9190615187565b6148169190615187565b6148209190615187565b61478190846151b0565b600061487f826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316614ca39092919063ffffffff16565b80519091501561387f578080602001905181019061489d9190615279565b61387f5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610c95565b60408051600280825260608201835260009260208301908036833701905050905030816000815181106149315761493161519a565b6001600160a01b03928316602091820292909201015260018054835192169183919081106149615761496161519a565b6001600160a01b03928316602091820292909201810191909152601d54604080516315ab88c960e31b81529051919093169263ad5c46489260048083019391928290030181865afa1580156149ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906149de919061525c565b6001600160a01b0316816001815181106149fa576149fa61519a565b60200260200101516001600160a01b031603614a7f57601d5460405163791ac94760e01b81526001600160a01b039091169063791ac94790614a49908590600090869030904290600401615328565b600060405180830381600087803b158015614a6357600080fd5b505af1158015614a77573d6000803e3d6000fd5b505050505050565b601c54601d54604051637274ca1b60e11b81526001600160a01b039283169263e4e9943692614a4992911690869060009087904290600401615364565b601d60009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa158015614b0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190614b33919061525c565b6001546001600160a01b03918216911603614bdb57601d5460405163f305d71960e01b815230600482015260248101849052600060448201819052606482015261dead60848201524260a48201526001600160a01b039091169063f305d71990839060c40160606040518083038185885af1158015614bb6573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019061360891906153a3565b601d5460015460405162e8e33760e81b81523060048201526001600160a01b039182166024820152604481018590526064810184905260006084820181905260a482015261dead60c48201524260e482015291169063e8e3370090610104016060604051808303816000875af1158015614c59573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061360891906153a3565b81600854614c8b9190615187565b600855600954614c9c9082906151c7565b6009555050565b6060614cb28484600085614cba565b949350505050565b606082471015614d1b5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610c95565b6001600160a01b0385163b614d725760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610c95565b600080866001600160a01b03168587604051614d8e91906153d1565b60006040518083038185875af1925050503d8060008114614dcb576040519150601f19603f3d011682016040523d82523d6000602084013e614dd0565b606091505b5091509150614de0828286614deb565b979650505050505050565b60608315614dfa575081610f94565b825115614e0a5782518084602001fd5b8160405162461bcd60e51b8152600401610c959190614e48565b60005b83811015614e3f578181015183820152602001614e27565b50506000910152565b6020815260008251806020840152614e67816040850160208701614e24565b601f01601f19169190910160400192915050565b6001600160a01b038116811461206a57600080fd5b60008060408385031215614ea357600080fd5b8235614eae81614e7b565b946020939093013593505050565b600060208284031215614ece57600080fd5b5035919050565b803561ffff81168114614ee757600080fd5b919050565b60008060408385031215614eff57600080fd5b614f0883614ed5565b9150614f1660208401614ed5565b90509250929050565b600080600060608486031215614f3457600080fd5b8335614f3f81614e7b565b92506020840135614f4f81614e7b565b929592945050506040919091013590565b801515811461206a57600080fd5b60008060408385031215614f8157600080fd5b8235614f8c81614e7b565b91506020830135614f9c81614f60565b809150509250929050565b600060208284031215614fb957600080fd5b8135610f9481614e7b565b60008060408385031215614fd757600080fd5b823591506020830135614f9c81614f60565b60008060408385031215614ffc57600080fd5b823561500781614e7b565b91506020830135614f9c81614e7b565b600181811c9082168061502b57607f821691505b60208210810361504b57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b634e487b7160e01b600052601160045260246000fd5b6000826150b957634e487b7160e01b600052601260045260246000fd5b500490565b61ffff81811683821601908082111561140e5761140e615086565b60208082526015908201527473656c6c20746f74616c20666565203c3d2033302560581b604082015260600190565b60208082526014908201527362757920746f74616c20666565203c3d2033302560601b604082015260600190565b6020808252600f908201526e73656c6c20666565203c3d2031352560881b604082015260600190565b6020808252600e908201526d62757920666565203c3d2031352560901b604082015260600190565b81810381811115610c6557610c65615086565b634e487b7160e01b600052603260045260246000fd5b8082028115828204841417610c6557610c65615086565b80820180821115610c6557610c65615086565b634e487b7160e01b600052603160045260246000fd5b60006001820161520257615202615086565b5060010190565b60208082526033908201527f6d61726b6574696e672077616c6c65742063616e27742062652073616d6520776040820152721a5d1a08151c99585cdd5c9e481dd85b1b195d606a1b606082015260800190565b60006020828403121561526e57600080fd5b8151610f9481614e7b565b60006020828403121561528b57600080fd5b8151610f9481614f60565b6000602082840312156152a857600080fd5b5051919050565b600081518084526020808501945080840160005b838110156152e85781516001600160a01b0316875295820195908201906001016152c3565b509495945050505050565b84815260806020820152600061530c60808301866152af565b6001600160a01b03949094166040830152506060015292915050565b85815284602082015260a06040820152600061534760a08301866152af565b6001600160a01b0394909416606083015250608001529392505050565b60018060a01b038616815284602082015283604082015260a06060820152600061539160a08301856152af565b90508260808301529695505050505050565b6000806000606084860312156153b857600080fd5b8351925060208401519150604084015190509250925092565b600082516153e3818460208701614e24565b919091019291505056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220f908d011d61549a95261ba0307bdfb06c9e026d82e891f1557ec89cd32e6d5c764736f6c63430008120033608060405234801561001057600080fd5b5061061b806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063e4e9943614610030575b600080fd5b61004361003e366004610438565b610045565b005b600083836100546001826104da565b81811061006357610063610501565b90506020020160208101906100789190610517565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa1580156100be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100e29190610539565b9050838360008181106100f7576100f7610501565b905060200201602081019061010c9190610517565b6040516323b872dd60e01b8152336004820152306024820152604481018890526001600160a01b0391909116906323b872dd906064016020604051808303816000875af1158015610161573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101859190610552565b508383600081811061019957610199610501565b90506020020160208101906101ae9190610517565b60405163095ea7b360e01b81526001600160a01b03898116600483015260248201899052919091169063095ea7b3906044016020604051808303816000875af11580156101ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102239190610552565b50604051635c11d79560e01b81526001600160a01b03881690635c11d7959061025a90899089908990899030908a90600401610574565b600060405180830381600087803b15801561027457600080fd5b505af1158015610288573d6000803e3d6000fd5b50600092508391508690508561029f6001826104da565b8181106102ae576102ae610501565b90506020020160208101906102c39190610517565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa158015610309573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061032d9190610539565b61033791906104da565b905084846103466001826104da565b81811061035557610355610501565b905060200201602081019061036a9190610517565b6001600160a01b031663a9059cbb8686600081811061038b5761038b610501565b90506020020160208101906103a09190610517565b6040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602481018490526044016020604051808303816000875af11580156103ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104119190610552565b505050505050505050565b80356001600160a01b038116811461043357600080fd5b919050565b60008060008060008060a0878903121561045157600080fd5b61045a8761041c565b95506020870135945060408701359350606087013567ffffffffffffffff8082111561048557600080fd5b818901915089601f83011261049957600080fd5b8135818111156104a857600080fd5b8a60208260051b85010111156104bd57600080fd5b602083019550809450505050608087013590509295509295509295565b818103818111156104fb57634e487b7160e01b600052601160045260246000fd5b92915050565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561052957600080fd5b6105328261041c565b9392505050565b60006020828403121561054b57600080fd5b5051919050565b60006020828403121561056457600080fd5b8151801515811461053257600080fd5b868152602080820187905260a0604083018190528201859052600090869060c08401835b888110156105c4576001600160a01b036105b18561041c565b1682529282019290820190600101610598565b506001600160a01b039690961660608501525050506080015294935050505056fea26469706673582212202fdf40c1cc0a89d82a3edcdef9fa736fa35afebb458b3ce807f947e1a9a4035e64736f6c634300081200334f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572f652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f" as Address