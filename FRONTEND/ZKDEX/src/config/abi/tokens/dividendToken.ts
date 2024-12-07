import { Address } from "viem"

export const dividendToken = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol_",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "decimals_",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "totalSupply_",
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
				"internalType": "address[5]",
				"name": "addrs",
				"type": "address[5]"
			},
			{
				"internalType": "uint16[6]",
				"name": "feeSettings",
				"type": "uint16[6]"
			},
			{
				"internalType": "uint256",
				"name": "minimumTokenBalanceForDividends_",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "_tokenForMarketingFee",
				"type": "uint8"
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
		"inputs": [],
		"name": "ERC1167FailedCreateClone",
		"type": "error"
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
				"name": "isExcluded",
				"type": "bool"
			}
		],
		"name": "ExcludeFromFees",
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
				"indexed": true,
				"internalType": "uint256",
				"name": "newValue",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "oldValue",
				"type": "uint256"
			}
		],
		"name": "GasForProcessingUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newLiquidityWallet",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldLiquidityWallet",
				"type": "address"
			}
		],
		"name": "LiquidityWalletUpdated",
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
				"indexed": true,
				"internalType": "address",
				"name": "oldMarketingWallet",
				"type": "address"
			}
		],
		"name": "MarketingWalletUpdated",
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
				"indexed": false,
				"internalType": "uint256",
				"name": "iterations",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "claims",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "lastProcessedIndex",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "bool",
				"name": "automatic",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "gas",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "processor",
				"type": "address"
			}
		],
		"name": "ProcessedDividendTracker",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokensSwapped",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "SendDividends",
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
				"name": "tokensSwapped",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ethReceived",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokensIntoLiqudity",
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
				"name": "newTokenForMarketingFee",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldTokenForMarketingFee",
				"type": "address"
			}
		],
		"name": "TokenForMarketingFeeUpdated",
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
				"indexed": true,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldAddress",
				"type": "address"
			}
		],
		"name": "UpdateDividendTracker",
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
				"internalType": "uint256",
				"name": "newSwapTokensAtAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldSwapTokensAtAmount",
				"type": "uint256"
			}
		],
		"name": "UpdateSwapTokensAtAmount",
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
				"name": "oldAddress",
				"type": "address"
			}
		],
		"name": "UpdateUniswapV2Router",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "_marketingWalletAddress",
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
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
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
			}
		],
		"name": "dividendTokenBalanceOf",
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
		"name": "dividendTracker",
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
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "excludeFromDividends",
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
				"name": "excluded",
				"type": "bool"
			}
		],
		"name": "excludeFromFees",
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
		"inputs": [],
		"name": "gasForProcessing",
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
				"name": "account",
				"type": "address"
			}
		],
		"name": "getAccountDividendsInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
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
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getAccountDividendsInfoAtIndex",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
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
		"name": "getClaimWait",
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
		"name": "getLastProcessedIndex",
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
		"name": "getMinimumTokenBalanceForDividends",
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
		"name": "getNumberOfDividendTokenHolders",
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
		"name": "getTotalDividendsDistributed",
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
				"name": "account",
				"type": "address"
			}
		],
		"name": "isExcludedFromDividends",
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
		"name": "isExcludedFromFees",
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
				"name": "gas",
				"type": "uint256"
			}
		],
		"name": "processDividendTracker",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "rewardToken",
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
		"inputs": [
			{
				"internalType": "address payable",
				"name": "wallet",
				"type": "address"
			}
		],
		"name": "setMarketingWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "setSwapTokensAtAmount",
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
		"name": "swapTokensAtAmount",
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
		"inputs": [],
		"name": "tokenForMarketingFee",
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
				"name": "to",
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
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
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
		"name": "uniswapV2Pair",
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
		"name": "uniswapV2Router",
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
				"name": "claimWait",
				"type": "uint256"
			}
		],
		"name": "updateClaimWait",
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
		"name": "updateDividendTracker",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newValue",
				"type": "uint256"
			}
		],
		"name": "updateGasForProcessing",
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
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "updateMinimumTokenBalanceForDividends",
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
				"internalType": "address",
				"name": "_tokenForMarketingFee",
				"type": "address"
			}
		],
		"name": "updateTokenForMarketingFee",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "withdrawableDividendOf",
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
		"stateMutability": "payable",
		"type": "receive"
	}
] as const

export const byteCode =
"60806040526040516200655338038062006553833981016040819052620000269162001348565b8a8a6003620000368382620014d0565b506004620000458282620014d0565b505050620000626200005c62000c2660201b60201c565b62000c2a565b60405160009073449183e39d76fa4c1f516d3ea2feed3e8c99e8f19034908381818185875af1925050503d8060008114620000ba576040519150601f19603f3d011682016040523d82523d6000602084013e620000bf565b606091505b5050905080620001165760405162461bcd60e51b815260206004820152601460248201527f6661696c20746f207472616e736665722066656500000000000000000000000060448201526064015b60405180910390fd5b604051620001249062001142565b604051809103906000f08015801562000141573d6000803e3d6000fd5b50600680546001600160a01b03199081166001600160a01b03938416179091556007805460ff60a01b1916600160a01b60ff8f16021790558751600c8054909216908316179055604080880151600e80546001600160601b03166c010000000000000000000000009285168302179081905591516000939190920416907f8616c7a330e3cf61290821331585511f1e2778171e2b005fb5ec60cfe874dc67908390a3606086810151600880546001600160a01b0319166001600160a01b039092169190911790558551600e80546020808a015163ffffffff60201b1990921661ffff94851664010000000090810261ffff60301b19169190911766010000000000009386168402179384905560408051918504861682529290930490931692820192909252600081830181905292810192909252517f95c5c99557725e816faf752c6675d63483841c28a7a009ed792470a9cb4dea239181900360800190a1604085810151600e80546060808a015163ffffffff60401b1990921661ffff9485166801000000000000000090810261ffff60501b1916919091176a01000000000000000000009386168402179384905585519084048516815291909204909216602083015260008284018190529082015290517f1d6b62961d401d548eb1549c97109c0b905ccd7af9c3777d3076cc8438fdfe659181900360800190a1608085810151600e805460a089015161ffff93841663ffffffff19909216821762010000918516820290811793849055604080519186169093178152920490921660208201526000818301819052606082015290517f0a21d45dab14d5d2f53ae98d95d951cd627fcf1b5bc485174326568b5e0a4572929181900390910190a1600e5460c89061ffff80821691620003ee91680100000000000000008204811691640100000000900416620015b2565b620003fa9190620015b2565b61ffff1611156200043f5760405162461bcd60e51b815260206004820152600e60248201526d73656c6c20666565203c2032302560901b60448201526064016200010d565b600e5460c89061ffff62010000820481169162000478916a010000000000000000000082048116916601000000000000900416620015b2565b620004849190620015b2565b61ffff161115620004c85760405162461bcd60e51b815260206004820152600d60248201526c62757920666565203c2032302560981b60448201526064016200010d565b8260ff16600003620004ec57600780546001600160a01b0319163017905562000543565b8260ff166001036200052057600854600780546001600160a01b0319166001600160a01b0390921691909117905562000543565b600c54600780546001600160a01b0319166001600160a01b039092169190911790555b6007546040516000916001600160a01b0316907fe2b5774aa87aa100c6ec40513e7bc1d6f3c22e7abfdcd1e87401c3c791bde9ae908390a3620005896127108a620015d7565b600d81905560408051918252600060208301527f1d3afd1a2942d06995fdb024306050a7b24ad00572be70ce8b1bea325780d28b910160405180910390a1620493e0600f819055604051600091907f40d7e40e79af4e8e5a9b3c57030d8ea93f13d669c06d448c4d631d4ae7d23db7908390a360808601516200060c9062000c7c565b600b80546001600160a01b0319166001600160a01b03929092169182179055604051600091907f90c7d74461c613da5efa97d90740869367d74ab3aa5837aa4ae9a975f954b7a8908390a3600b54600c5460405163cd6dc68760e01b81526001600160a01b0391821660048201526024810187905291169063cd6dc68790604401600060405180830381600087803b158015620006a857600080fd5b505af1158015620006bd573d6000803e3d6000fd5b5050505060008711620007135760405162461bcd60e51b815260206004820152601a60248201527f6d6178207472616e73616374696f6e20616d6f756e74203e203000000000000060448201526064016200010d565b60008811620007555760405162461bcd60e51b815260206004820152600d60248201526c06d61782077616c6c6574203e3609c1b60448201526064016200010d565b601088905560408051898152600060208201527fff64d41f60feb77d52f64ae64a9fc3929d57a89d0cc55728762468bae5e0fe52910160405180910390a1601187905560408051888152600060208201527f35eec0711af6fbe3039535323be51b57996b6945b0d55862607c7a02e52e4507910160405180910390a16020860151600980546001600160a01b0319166001600160a01b039092169182179055604051600091907f8fc842bbd331dfa973645f4ed48b11683d501ebf1352708d77a5da2ab49a576e908390a3600960009054906101000a90046001600160a01b03166001600160a01b031663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000874573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200089a9190620015fa565b6008546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af1158015620008ec573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620009129190620015fa565b600a80546001600160a01b0319166001600160a01b039290921691821790556200093e90600162000cef565b600b5460405163031e79db60e41b81526001600160a01b0390911660048201819052906331e79db090602401600060405180830381600087803b1580156200098557600080fd5b505af11580156200099a573d6000803e3d6000fd5b5050600b5460405163031e79db60e41b81523060048201526001600160a01b0390911692506331e79db09150602401600060405180830381600087803b158015620009e457600080fd5b505af1158015620009f9573d6000803e3d6000fd5b5050600b5460405163031e79db60e41b81526001600160a01b03868116600483015290911692506331e79db09150602401600060405180830381600087803b15801562000a4557600080fd5b505af115801562000a5a573d6000803e3d6000fd5b5050600b5460405163031e79db60e41b815261dead60048201526001600160a01b0390911692506331e79db09150602401600060405180830381600087803b15801562000aa657600080fd5b505af115801562000abb573d6000803e3d6000fd5b5050600b5460095460405163031e79db60e41b81526001600160a01b039182166004820152911692506331e79db09150602401600060405180830381600087803b15801562000b0957600080fd5b505af115801562000b1e573d6000803e3d6000fd5b5050505062000b3582600162000ef460201b60201c565b600e5462000b5e906c0100000000000000000000000090046001600160a01b0316600162000ef4565b62000b6b30600162000ef4565b62000b7a61dead600162000ef4565b60136020527f2264e2d7bacabe6058f5009f42467b9be28015e7760f87409562384c94ac271c8054600160ff19918216811790925530600090815260408082208054841685179055600e546001600160a01b036c010000000000000000000000009091048116835281832080548516861790558616825290208054909116909117905562000c09828a62000f98565b62000c14826200107d565b5050505050505050505050506200165f565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6000763d602d80600a3d3981f3363d3d373d3d3d363d730000008260601b60e81c176000526e5af43d82803e903d91602b57fd5bf38260781b17602052603760096000f090506001600160a01b03811662000cea576040516330be1a3d60e21b815260040160405180910390fd5b919050565b6001600160a01b03821660009081526016602052604090205481151560ff90911615150362000d875760405162461bcd60e51b815260206004820152603860248201527f4175746f6d61746564206d61726b6574206d616b65722070616972206973206160448201527f6c72656164792073657420746f20746861742076616c7565000000000000000060648201526084016200010d565b6001600160a01b038216600090815260166020908152604080832080548515801560ff1992831681179093556013909452919093208054909116909217909155819062000e425750600b5460405163c705c56960e01b81526001600160a01b0384811660048301529091169063c705c56990602401602060405180830381865afa15801562000e1a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000e4091906200161f565b155b1562000eaa57600b5460405163031e79db60e41b81526001600160a01b038481166004830152909116906331e79db090602401600060405180830381600087803b15801562000e9057600080fd5b505af115801562000ea5573d6000803e3d6000fd5b505050505b816001600160a01b03167fffa9187bf1f18bf477bd0ea1bcbb64e93b6a98132473929edfce215cd9b16fab8260405162000ee8911515815260200190565b60405180910390a25050565b6005546001600160a01b0316331462000f3f5760405162461bcd60e51b815260206004820181905260248201526000805160206200653383398151915260448201526064016200010d565b6001600160a01b038216600081815260126020908152604091829020805460ff191685151590811790915591519182527f9d8f7706ea1113d1a167b526eca956215946dd36cc7df39eb16180222d8b5df7910162000ee8565b6001600160a01b03821662000ff05760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064016200010d565b806002600082825462001004919062001643565b90915550506001600160a01b038216600090815260208190526040812080548392906200103390849062001643565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6005546001600160a01b03163314620010c85760405162461bcd60e51b815260206004820181905260248201526000805160206200653383398151915260448201526064016200010d565b6001600160a01b0381166200112f5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016200010d565b6200113a8162000c2a565b50565b505050565b61063b8062005ef883390190565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b038111828210171562001191576200119162001150565b604052919050565b600082601f830112620011ab57600080fd5b81516001600160401b03811115620011c757620011c762001150565b6020620011dd601f8301601f1916820162001166565b8281528582848701011115620011f257600080fd5b60005b8381101562001212578581018301518282018401528201620011f5565b506000928101909101919091529392505050565b805160ff8116811462000cea57600080fd5b80516001600160a01b038116811462000cea57600080fd5b600082601f8301126200126257600080fd5b60405160a081016001600160401b038111828210171562001287576200128762001150565b6040528060a08401858111156200129d57600080fd5b845b81811015620012c257620012b38162001238565b8352602092830192016200129f565b509195945050505050565b600082601f830112620012df57600080fd5b60405160c081016001600160401b038111828210171562001304576200130462001150565b6040528060c08401858111156200131a57600080fd5b845b81811015620012c257805161ffff81168114620013395760008081fd5b8352602092830192016200131c565b60008060008060008060008060008060006102808c8e0312156200136b57600080fd5b8b516001600160401b038111156200138257600080fd5b620013908e828f0162001199565b60208e0151909c5090506001600160401b03811115620013af57600080fd5b620013bd8e828f0162001199565b9a5050620013ce60408d0162001226565b985060608c0151975060808c0151965060a08c01519550620013f48d60c08e0162001250565b9450620014068d6101608e01620012cd565b93506102208c015192506200141f6102408d0162001226565b9150620014306102608d0162001238565b90509295989b509295989b9093969950565b600181811c908216806200145757607f821691505b6020821081036200147857634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200113d57600081815260208120601f850160051c81016020861015620014a75750805b601f850160051c820191505b81811015620014c857828155600101620014b3565b505050505050565b81516001600160401b03811115620014ec57620014ec62001150565b6200150481620014fd845462001442565b846200147e565b602080601f8311600181146200153c5760008415620015235750858301515b600019600386901b1c1916600185901b178555620014c8565b600085815260208120601f198616915b828110156200156d578886015182559484019460019091019084016200154c565b50858210156200158c5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b61ffff818116838216019080821115620015d057620015d06200159c565b5092915050565b600082620015f557634e487b7160e01b600052601260045260246000fd5b500490565b6000602082840312156200160d57600080fd5b620016188262001238565b9392505050565b6000602082840312156200163257600080fd5b815180151581146200161857600080fd5b808201808211156200165957620016596200159c565b92915050565b614889806200166f6000396000f3fe6080604052600436106103d25760003560e01c806392136913116101fd578063c8c8ebe411610118578063e98030c7116100ab578063f2fde38b1161007a578063f2fde38b14610bfc578063f420d00f14610c1c578063f637434214610c3c578063f7c618c114610c5f578063f8b45b0514610c7f57600080fd5b8063e98030c714610b7a578063f0a568c014610b9a578063f11a24d314610bba578063f27fd25414610bdc57600080fd5b8063de0aad53116100e7578063de0aad5314610b04578063e2f4560514610b1f578063e7841ec014610b35578063e9481eee14610b4a57600080fd5b8063c8c8ebe414610a68578063cf089e1314610a7e578063d68f8cde14610a9e578063dd62ed3e14610abe57600080fd5b8063a9059cbb11610190578063b62496f51161015f578063b62496f5146109e3578063bdd4f29f14610a13578063c024666814610a28578063c705c56914610a4857600080fd5b8063a9059cbb1461091e578063aa4980231461093e578063ad56c13c1461095e578063afa4f3b2146109c357600080fd5b80639c1b8af5116101cc5780639c1b8af5146108b3578063a26579ad146108c9578063a457c2d7146108de578063a8b9d240146108fe57600080fd5b8063921369131461083c578063948384dc1461085e57806395d89b411461087e5780639a7a23d61461089357600080fd5b806349bd5a5e116102ed57806370a0823111610280578063871c128d1161024f578063871c128d146107be57806388bdd9be146107de5780638da5cb5b146107fe57806391c1004a1461081c57600080fd5b806370a0823114610731578063715018a6146107675780637bce5a041461077c5780637cf84bd71461079e57600080fd5b806364b0f653116102bc57806364b0f653146106bc57806365b8dbc0146106d15780636843cd84146106f1578063700bb1911461071157600080fd5b806349bd5a5e1461062e5780634e71d92d1461064e5780634fbee193146106635780635d098b381461069c57600080fd5b80632ae2f1211161036557806331e79db01161033457806331e79db0146105a757806339509351146105c75780633ad3e6ff146105e75780634144d9e41461060757600080fd5b80632ae2f121146105265780632c1f52161461054657806330bb4cff14610566578063313ce5671461057b57600080fd5b80631694505e116103a15780631694505e1461048f57806318160ddd146104c75780631c499ab0146104e657806323b872dd1461050657600080fd5b806306fdde03146103de578063095ea7b3146104095780630cfe2f3f146104395780630dcb2e891461046d57600080fd5b366103d957005b600080fd5b3480156103ea57600080fd5b506103f3610c95565b60405161040091906142c7565b60405180910390f35b34801561041557600080fd5b5061042961042436600461432a565b610d27565b6040519015158152602001610400565b34801561044557600080fd5b50600e5461045a9062010000900461ffff1681565b60405161ffff9091168152602001610400565b34801561047957600080fd5b5061048d610488366004614356565b610d41565b005b34801561049b57600080fd5b506009546104af906001600160a01b031681565b6040516001600160a01b039091168152602001610400565b3480156104d357600080fd5b506002545b604051908152602001610400565b3480156104f257600080fd5b5061048d610501366004614356565b610dd6565b34801561051257600080fd5b5061042961052136600461436f565b610e80565b34801561053257600080fd5b5061048d6105413660046143be565b610ea4565b34801561055257600080fd5b50600b546104af906001600160a01b031681565b34801561057257600080fd5b506104d8610f6e565b34801561058757600080fd5b50600754600160a01b900460ff1660405160ff9091168152602001610400565b3480156105b357600080fd5b5061048d6105c23660046143f7565b610fe1565b3480156105d357600080fd5b506104296105e236600461432a565b61103d565b3480156105f357600080fd5b506007546104af906001600160a01b031681565b34801561061357600080fd5b50600e546104af90600160601b90046001600160a01b031681565b34801561063a57600080fd5b50600a546104af906001600160a01b031681565b34801561065a57600080fd5b5061048d61107c565b34801561066f57600080fd5b5061042961067e3660046143f7565b6001600160a01b031660009081526012602052604090205460ff1690565b3480156106a857600080fd5b5061048d6106b73660046143f7565b6110f4565b3480156106c857600080fd5b506104d86111c0565b3480156106dd57600080fd5b5061048d6106ec3660046143f7565b61120a565b3480156106fd57600080fd5b506104d861070c3660046143f7565b6114ce565b34801561071d57600080fd5b5061048d61072c366004614356565b61153e565b34801561073d57600080fd5b506104d861074c3660046143f7565b6001600160a01b031660009081526020819052604090205490565b34801561077357600080fd5b5061048d611610565b34801561078857600080fd5b50600e5461045a90600160501b900461ffff1681565b3480156107aa57600080fd5b506008546104af906001600160a01b031681565b3480156107ca57600080fd5b5061048d6107d9366004614356565b611646565b3480156107ea57600080fd5b5061048d6107f93660046143f7565b611788565b34801561080a57600080fd5b506005546001600160a01b03166104af565b34801561082857600080fd5b5061048d6108373660046143f7565b611b71565b34801561084857600080fd5b50600e5461045a90600160401b900461ffff1681565b34801561086a57600080fd5b5061048d610879366004614432565b611cc0565b34801561088a57600080fd5b506103f3611e0f565b34801561089f57600080fd5b5061048d6108ae3660046143be565b611e1e565b3480156108bf57600080fd5b506104d8600f5481565b3480156108d557600080fd5b506104d8611eda565b3480156108ea57600080fd5b506104296108f936600461432a565b611f24565b34801561090a57600080fd5b506104d86109193660046143f7565b611fb6565b34801561092a57600080fd5b5061042961093936600461432a565b611fe9565b34801561094a57600080fd5b5061048d610959366004614356565b611ff7565b34801561096a57600080fd5b5061097e6109793660046143f7565b6120ac565b604080516001600160a01b0390991689526020890197909752958701949094526060860192909252608085015260a084015260c083015260e082015261010001610400565b3480156109cf57600080fd5b5061048d6109de366004614356565b612147565b3480156109ef57600080fd5b506104296109fe3660046143f7565b60166020526000908152604090205460ff1681565b348015610a1f57600080fd5b506104d86121fc565b348015610a3457600080fd5b5061048d610a433660046143be565b612246565b348015610a5457600080fd5b50610429610a633660046143f7565b6122c8565b348015610a7457600080fd5b506104d860115481565b348015610a8a57600080fd5b5061048d610a99366004614432565b612337565b348015610aaa57600080fd5b5061048d610ab9366004614432565b61249b565b348015610aca57600080fd5b506104d8610ad9366004614465565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b348015610b1057600080fd5b50600e5461045a9061ffff1681565b348015610b2b57600080fd5b506104d8600d5481565b348015610b4157600080fd5b506104d86125ff565b348015610b5657600080fd5b50610429610b653660046143f7565b60136020526000908152604090205460ff1681565b348015610b8657600080fd5b5061048d610b95366004614356565b612649565b348015610ba657600080fd5b5061048d610bb53660046143f7565b6126a4565b348015610bc657600080fd5b50600e5461045a90600160301b900461ffff1681565b348015610be857600080fd5b5061097e610bf7366004614356565b612758565b348015610c0857600080fd5b5061048d610c173660046143f7565b61279a565b348015610c2857600080fd5b506006546104af906001600160a01b031681565b348015610c4857600080fd5b50600e5461045a90640100000000900461ffff1681565b348015610c6b57600080fd5b50600c546104af906001600160a01b031681565b348015610c8b57600080fd5b506104d860105481565b606060038054610ca490614493565b80601f0160208091040260200160405190810160405280929190818152602001828054610cd090614493565b8015610d1d5780601f10610cf257610100808354040283529160200191610d1d565b820191906000526020600020905b815481529060010190602001808311610d0057829003601f168201915b5050505050905090565b600033610d35818585612832565b60019150505b92915050565b6005546001600160a01b03163314610d745760405162461bcd60e51b8152600401610d6b906144cd565b60405180910390fd5b600b54604051630dcb2e8960e01b8152600481018390526001600160a01b0390911690630dcb2e89906024015b600060405180830381600087803b158015610dbb57600080fd5b505af1158015610dcf573d6000803e3d6000fd5b5050505050565b6005546001600160a01b03163314610e005760405162461bcd60e51b8152600401610d6b906144cd565b60008111610e3e5760405162461bcd60e51b815260206004820152600b60248201526a06d617857616c6c65743e360ac1b6044820152606401610d6b565b6010546040805183815260208101929092527fff64d41f60feb77d52f64ae64a9fc3929d57a89d0cc55728762468bae5e0fe52910160405180910390a1601055565b600033610e8e858285612956565b610e998585856129e8565b506001949350505050565b6005546001600160a01b03163314610ece5760405162461bcd60e51b8152600401610d6b906144cd565b6001600160a01b03821660009081526013602052604090205481151560ff909116151503610f0e5760405162461bcd60e51b8152600401610d6b90614502565b6001600160a01b038216600081815260136020908152604091829020805460ff191685151590811790915591519182527f82170bbd72c16b30c410014b7382121a699ed119a182e48a0b6cadcc89104ac991015b60405180910390a25050565b600b54604080516342d359d760e11b815290516000926001600160a01b0316916385a6b3ae9160048083019260209291908290030181865afa158015610fb8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fdc9190614523565b905090565b6005546001600160a01b0316331461100b5760405162461bcd60e51b8152600401610d6b906144cd565b600b5460405163031e79db60e41b81526001600160a01b038381166004830152909116906331e79db090602401610da1565b3360008181526001602090815260408083206001600160a01b0387168452909152812054909190610d359082908690611077908790614552565b612832565b600b5460405163bc4c4b3760e01b8152336004820152600060248201526001600160a01b039091169063bc4c4b37906044016020604051808303816000875af11580156110cd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110f19190614565565b50565b6005546001600160a01b0316331461111e5760405162461bcd60e51b8152600401610d6b906144cd565b600e546001600160a01b03808316600160601b90920416036111525760405162461bcd60e51b8152600401610d6b90614502565b600e546040516001600160a01b0380841692600160601b900416907f8616c7a330e3cf61290821331585511f1e2778171e2b005fb5ec60cfe874dc6790600090a3600e80546001600160a01b03909216600160601b026bffffffffffffffffffffffff909216919091179055565b600b54604080516304ddf6ef60e11b815290516000926001600160a01b0316916309bbedde9160048083019260209291908290030181865afa158015610fb8573d6000803e3d6000fd5b6005546001600160a01b031633146112345760405162461bcd60e51b8152600401610d6b906144cd565b6009546001600160a01b039081169082160361129e5760405162461bcd60e51b815260206004820152602360248201527f54686520726f7574657220616c7265616479206861732074686174206164647260448201526265737360e81b6064820152608401610d6b565b6009546040516001600160a01b03918216918316907f8fc842bbd331dfa973645f4ed48b11683d501ebf1352708d77a5da2ab49a576e90600090a3806001600160a01b031663c45a01556040518163ffffffff1660e01b8152600401602060405180830381865afa158015611317573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061133b9190614582565b6008546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af115801561138c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906113b09190614582565b600a80546001600160a01b039283166001600160a01b03199182161790915560098054848416921682179055600b5460405163c705c56960e01b815292169163c705c56991611410916004016001600160a01b0391909116815260200190565b602060405180830381865afa15801561142d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114519190614565565b6114b757600b5460095460405163031e79db60e41b81526001600160a01b0391821660048201529116906331e79db090602401600060405180830381600087803b15801561149e57600080fd5b505af11580156114b2573d6000803e3d6000fd5b505050505b600a546110f1906001600160a01b03166001613033565b600b546040516370a0823160e01b81526001600160a01b03838116600483015260009216906370a08231906024015b602060405180830381865afa15801561151a573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d3b9190614523565b600b546040516001624d3b8760e01b0319815260048101839052600091829182916001600160a01b03169063ffb2c479906024016060604051808303816000875af1158015611591573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115b5919061459f565b604080518481526020810184905290810182905260608101889052929550909350915033906000907fc864333d6121033635ab41b29ae52f10a22cf4438c3e4f1c4c68518feb2f8a989060800160405180910390a350505050565b6005546001600160a01b0316331461163a5760405162461bcd60e51b8152600401610d6b906144cd565b6116446000613222565b565b6005546001600160a01b031633146116705760405162461bcd60e51b8152600401610d6b906144cd565b62030d40811015801561168657506207a1208111155b6116ef5760405162461bcd60e51b815260206004820152603460248201527f676173466f7250726f63657373696e67206d757374206265206265747765656e6044820152730203230302c30303020616e64203530302c3030360641b6064820152608401610d6b565b600f5481036117555760405162461bcd60e51b815260206004820152602c60248201527f43616e6e6f742075706461746520676173466f7250726f63657373696e67207460448201526b6f2073616d652076616c756560a01b6064820152608401610d6b565b600f5460405182907f40d7e40e79af4e8e5a9b3c57030d8ea93f13d669c06d448c4d631d4ae7d23db790600090a3600f55565b6005546001600160a01b031633146117b25760405162461bcd60e51b8152600401610d6b906144cd565b600b546001600160a01b03908116908216036118265760405162461bcd60e51b815260206004820152602d60248201527f546865206469766964656e6420747261636b657220616c72656164792068617360448201526c2074686174206164647265737360981b6064820152608401610d6b565b6000819050306001600160a01b0316816001600160a01b0316638da5cb5b6040518163ffffffff1660e01b8152600401602060405180830381865afa158015611873573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118979190614582565b6001600160a01b0316146119275760405162461bcd60e51b815260206004820152604b60248201527f546865206e6577206469766964656e6420747261636b6572206d75737420626560448201527f206f776e656420627920746865204449564944454e4544544f4b454e20746f6b60648201526a195b8818dbdb9d1c9858dd60aa1b608482015260a401610d6b565b60405163031e79db60e41b81526001600160a01b03821660048201819052906331e79db090602401600060405180830381600087803b15801561196957600080fd5b505af115801561197d573d6000803e3d6000fd5b505060405163031e79db60e41b81523060048201526001600160a01b03841692506331e79db09150602401600060405180830381600087803b1580156119c257600080fd5b505af11580156119d6573d6000803e3d6000fd5b50505050806001600160a01b03166331e79db06119fb6005546001600160a01b031690565b6040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602401600060405180830381600087803b158015611a3c57600080fd5b505af1158015611a50573d6000803e3d6000fd5b505060095460405163031e79db60e41b81526001600160a01b03918216600482015290841692506331e79db09150602401600060405180830381600087803b158015611a9b57600080fd5b505af1158015611aaf573d6000803e3d6000fd5b5050600a5460405163031e79db60e41b81526001600160a01b03918216600482015290841692506331e79db09150602401600060405180830381600087803b158015611afa57600080fd5b505af1158015611b0e573d6000803e3d6000fd5b5050600b546040516001600160a01b03918216935090851691507f90c7d74461c613da5efa97d90740869367d74ab3aa5837aa4ae9a975f954b7a890600090a3600b80546001600160a01b0319166001600160a01b039290921691909117905550565b6005546001600160a01b03163314611b9b5760405162461bcd60e51b8152600401610d6b906144cd565b600880546001600160a01b0319166001600160a01b03838116919091179091556009546040805163c45a015560e01b81529051919092169163c45a01559160048083019260209291908290030181865afa158015611bfd573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c219190614582565b6008546040516364e329cb60e11b81523060048201526001600160a01b03918216602482015291169063c9c65396906044016020604051808303816000875af1158015611c72573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611c969190614582565b600a80546001600160a01b0319166001600160a01b039290921691821790556110f1906001613033565b6005546001600160a01b03163314611cea5760405162461bcd60e51b8152600401610d6b906144cd565b600e5460c89061ffff600160401b8204811691611d119164010000000090910416856145cd565b611d1b91906145cd565b61ffff161115611d3d5760405162461bcd60e51b8152600401610d6b906145ef565b600e5460c89061ffff600160501b8204811691611d6391600160301b90910416846145cd565b611d6d91906145cd565b61ffff161115611d8f5760405162461bcd60e51b8152600401610d6b90614618565b600e546040805161ffff8581168252848116602083015280841682840152620100009093049092166060830152517f0a21d45dab14d5d2f53ae98d95d951cd627fcf1b5bc485174326568b5e0a45729181900360800190a1600e805461ffff928316620100000263ffffffff199091169290931691909117919091179055565b606060048054610ca490614493565b6005546001600160a01b03163314611e485760405162461bcd60e51b8152600401610d6b906144cd565b600a546001600160a01b0390811690831603611ecc5760405162461bcd60e51b815260206004820152603e60248201527f546865206d61696e20706169722063616e6e6f742062652072656d6f7665642060448201527f66726f6d206175746f6d617465644d61726b65744d616b6572506169727300006064820152608401610d6b565b611ed68282613033565b5050565b600b5460408051631bc9e27b60e21b815290516000926001600160a01b031691636f2789ec9160048083019260209291908290030181865afa158015610fb8573d6000803e3d6000fd5b3360008181526001602090815260408083206001600160a01b038716845290915281205490919083811015611fa95760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610d6b565b610e998286868403612832565b600b546040516302a2e74960e61b81526001600160a01b038381166004830152600092169063a8b9d240906024016114fd565b600033610d358185856129e8565b6005546001600160a01b031633146120215760405162461bcd60e51b8152600401610d6b906144cd565b6000811161206a5760405162461bcd60e51b815260206004820152601660248201527506d61785472616e73616374696f6e416d6f756e743e360541b6044820152606401610d6b565b6011546040805183815260208101929092527f35eec0711af6fbe3039535323be51b57996b6945b0d55862607c7a02e52e4507910160405180910390a1601155565b600b5460405163fbcbc0f160e01b81526001600160a01b038381166004830152600092839283928392839283928392839291169063fbcbc0f1906024015b61010060405180830381865afa158015612108573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061212c9190614640565b97509750975097509750975097509750919395975091939597565b6005546001600160a01b031633146121715760405162461bcd60e51b8152600401610d6b906144cd565b600081116121ba5760405162461bcd60e51b8152602060048201526016602482015275073776170546f6b656e734174416d6f756e74203e20360541b6044820152606401610d6b565b600d546040805183815260208101929092527f1d3afd1a2942d06995fdb024306050a7b24ad00572be70ce8b1bea325780d28b910160405180910390a1600d55565b600b5460408051632f842d8560e21b815290516000926001600160a01b03169163be10b6149160048083019260209291908290030181865afa158015610fb8573d6000803e3d6000fd5b6005546001600160a01b031633146122705760405162461bcd60e51b8152600401610d6b906144cd565b6001600160a01b038216600081815260126020908152604091829020805460ff191685151590811790915591519182527f9d8f7706ea1113d1a167b526eca956215946dd36cc7df39eb16180222d8b5df79101610f62565b600b5460405163c705c56960e01b81526001600160a01b038381166004830152600092169063c705c56990602401602060405180830381865afa158015612313573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d3b9190614565565b6005546001600160a01b031633146123615760405162461bcd60e51b8152600401610d6b906144cd565b600e5460c89061ffff808216916123829164010000000090910416856145cd565b61238c91906145cd565b61ffff1611156123ae5760405162461bcd60e51b8152600401610d6b906145ef565b600e5460c89061ffff6201000082048116916123d391600160301b90910416846145cd565b6123dd91906145cd565b61ffff1611156123ff5760405162461bcd60e51b8152600401610d6b90614618565b600e546040805161ffff85811682528481166020830152600160401b8404811682840152600160501b9093049092166060830152517f1d6b62961d401d548eb1549c97109c0b905ccd7af9c3777d3076cc8438fdfe659181900360800190a1600e80546bffffffff00000000000000001916600160401b61ffff9485160261ffff60501b191617600160501b9290931691909102919091179055565b6005546001600160a01b031633146124c55760405162461bcd60e51b8152600401610d6b906144cd565b600e5460c89061ffff808216916124e591600160401b90910416856145cd565b6124ef91906145cd565b61ffff1611156125115760405162461bcd60e51b8152600401610d6b906145ef565b600e5460c89061ffff62010000820481169161253691600160501b90910416846145cd565b61254091906145cd565b61ffff1611156125625760405162461bcd60e51b8152600401610d6b90614618565b600e546040805161ffff858116825284811660208301526401000000008404811682840152600160301b9093049092166060830152517f95c5c99557725e816faf752c6675d63483841c28a7a009ed792470a9cb4dea239181900360800190a1600e805467ffffffff00000000191664010000000061ffff9485160267ffff000000000000191617600160301b9290931691909102919091179055565b600b546040805163039e107b60e61b815290516000926001600160a01b03169163e7841ec09160048083019260209291908290030181865afa158015610fb8573d6000803e3d6000fd5b6005546001600160a01b031633146126735760405162461bcd60e51b8152600401610d6b906144cd565b600b5460405163e98030c760e01b8152600481018390526001600160a01b039091169063e98030c790602401610da1565b6005546001600160a01b031633146126ce5760405162461bcd60e51b8152600401610d6b906144cd565b6007546001600160a01b038083169116036126fb5760405162461bcd60e51b8152600401610d6b90614502565b6007546040516001600160a01b03918216918316907fe2b5774aa87aa100c6ec40513e7bc1d6f3c22e7abfdcd1e87401c3c791bde9ae90600090a3600780546001600160a01b0319166001600160a01b0392909216919091179055565b600b54604051635183d6fd60e01b81526004810183905260009182918291829182918291829182916001600160a01b0390911690635183d6fd906024016120ea565b6005546001600160a01b031633146127c45760405162461bcd60e51b8152600401610d6b906144cd565b6001600160a01b0381166128295760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610d6b565b6110f181613222565b6001600160a01b0383166128945760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610d6b565b6001600160a01b0382166128f55760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610d6b565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b0383811660009081526001602090815260408083209386168352929052205460001981146129e257818110156129d55760405162461bcd60e51b815260206004820152601d60248201527f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000006044820152606401610d6b565b6129e28484848403612832565b50505050565b6001600160a01b038316612a0e5760405162461bcd60e51b8152600401610d6b906146aa565b6001600160a01b038216612a345760405162461bcd60e51b8152600401610d6b906146ef565b80600003612a4d57612a4883836000613274565b505050565b30600090815260208190526040902054600d5481108015908190612a7b5750600a54600160a01b900460ff16155b8015612aa057506001600160a01b03851660009081526016602052604090205460ff16155b8015612aba57506005546001600160a01b03868116911614155b8015612ad457506005546001600160a01b03858116911614155b15612b4a57600a805460ff60a01b1916600160a01b17905560155415612aff57612aff6015546133c8565b60145415612b1257612b126014546138c8565b306000908152602081905260409020548015612b3157612b3181613b4d565b5060006015819055601455600a805460ff60a01b191690555b600a546001600160a01b03861660009081526012602052604090205460ff600160a01b909204821615911680612b9857506001600160a01b03851660009081526012602052604090205460ff165b15612ba1575060005b60008060008315612d3b576001600160a01b03891660009081526016602052604090205460ff1615612c4b57600e546103e890612be89062010000900461ffff1689614732565b612bf29190614749565b600e549091506103e890612c1190600160301b900461ffff1689614732565b612c1b9190614749565b600e549093506103e890612c3a90600160501b900461ffff1689614732565b612c449190614749565b9150612ce1565b6001600160a01b03881660009081526016602052604090205460ff1615612ce157600e546103e890612c819061ffff1689614732565b612c8b9190614749565b600e549091506103e890612cab90640100000000900461ffff1689614732565b612cb59190614749565b600e549093506103e890612cd490600160401b900461ffff1689614732565b612cde9190614749565b91505b82601454612cef9190614552565b601455601554612d00908390614552565b601555600082612d108584614552565b612d1a9190614552565b9050612d26818961476b565b97508015612d3957612d398a3083613274565b505b612d46898989613274565b600b546001600160a01b031663e30443bc8a612d77816001600160a01b031660009081526020819052604090205490565b6040516001600160e01b031960e085901b1681526001600160a01b0390921660048301526024820152604401600060405180830381600087803b158015612dbd57600080fd5b505af1925050508015612dce575060015b50600b546001600160a01b031663e30443bc89612e00816001600160a01b031660009081526020819052604090205490565b6040516001600160e01b031960e085901b1681526001600160a01b0390921660048301526024820152604401600060405180830381600087803b158015612e4657600080fd5b505af1925050508015612e57575060015b50600a54600160a01b900460ff16613028576001600160a01b03891660009081526013602052604090205460ff16612eda576011548710612eda5760405162461bcd60e51b815260206004820152601d60248201527f45524332303a2065786365656473207472616e73666572206c696d69740000006044820152606401610d6b565b6001600160a01b03881660009081526013602052604090205460ff16612f63576010546001600160a01b03891660009081526020819052604090205410612f635760405162461bcd60e51b815260206004820152601f60248201527f45524332303a2065786365656473206d61782077616c6c6574206c696d6974006044820152606401610d6b565b600f54600b546040516001624d3b8760e01b03198152600481018390526001600160a01b039091169063ffb2c479906024016060604051808303816000875af1925050508015612fd0575060408051601f3d908101601f19168201909252612fcd9181019061459f565b60015b156130265760408051848152602081018490529081018290526060810185905233906001907fc864333d6121033635ab41b29ae52f10a22cf4438c3e4f1c4c68518feb2f8a989060800160405180910390a35050505b505b505050505050505050565b6001600160a01b03821660009081526016602052604090205481151560ff9091161515036130c95760405162461bcd60e51b815260206004820152603860248201527f4175746f6d61746564206d61726b6574206d616b65722070616972206973206160448201527f6c72656164792073657420746f20746861742076616c756500000000000000006064820152608401610d6b565b6001600160a01b038216600090815260166020908152604080832080548515801560ff199283168117909355601390945291909320805490911690921790915581906131805750600b5460405163c705c56960e01b81526001600160a01b0384811660048301529091169063c705c56990602401602060405180830381865afa15801561315a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061317e9190614565565b155b156131e557600b5460405163031e79db60e41b81526001600160a01b038481166004830152909116906331e79db090602401600060405180830381600087803b1580156131cc57600080fd5b505af11580156131e0573d6000803e3d6000fd5b505050505b816001600160a01b03167fffa9187bf1f18bf477bd0ea1bcbb64e93b6a98132473929edfce215cd9b16fab82604051610f62911515815260200190565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b03831661329a5760405162461bcd60e51b8152600401610d6b906146aa565b6001600160a01b0382166132c05760405162461bcd60e51b8152600401610d6b906146ef565b6001600160a01b038316600090815260208190526040902054818110156133385760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610d6b565b6001600160a01b0380851660009081526020819052604080822085850390559185168152908120805484929061336f908490614552565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516133bb91815260200190565b60405180910390a36129e2565b600c546007546001600160a01b0391821691160361355657600c546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a0823190602401602060405180830381865afa158015613429573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061344d9190614523565b905061345882613ce7565b600c546040516370a0823160e01b815230600482015260009183916001600160a01b03909116906370a0823190602401602060405180830381865afa1580156134a5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906134c99190614523565b6134d3919061476b565b600c54600e5460405163a9059cbb60e01b81526001600160a01b03600160601b9092048216600482015260248101849052929350169063a9059cbb906044015b6020604051808303816000875af1158015613532573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906129e29190614565565b6008546007546001600160a01b039182169116036138a957600954604080516315ab88c960e31b815290516000926001600160a01b03169163ad5c46489160048083019260209291908290030181865afa1580156135b8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906135dc9190614582565b6008546001600160a01b03908116911614613662576008546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa158015613639573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061365d9190614523565b613664565b475b905061366f82613ef6565b600954604080516315ab88c960e31b815290516000926001600160a01b03169163ad5c46489160048083019260209291908290030181865afa1580156136b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906136dd9190614582565b6008546001600160a01b0390811691161461376d576008546040516370a0823160e01b815230600482015283916001600160a01b0316906370a0823190602401602060405180830381865afa15801561373a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061375e9190614523565b613768919061476b565b613777565b613777824761476b565b9050600960009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa1580156137cc573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906137f09190614582565b6008546001600160a01b0391821691160361386757600e54604051600091600160601b90046001600160a01b03169083908381818185875af1925050503d8060008114613859576040519150601f19603f3d011682016040523d82523d6000602084013e61385e565b606091505b50505050505050565b600854600e5460405163a9059cbb60e01b81526001600160a01b03600160601b909204821660048201526024810184905291169063a9059cbb90604401613513565b600e546110f1903090600160601b90046001600160a01b0316836129e8565b60006138d5600283614749565b905060006138e3828461476b565b90506000600960009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa15801561393a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061395e9190614582565b6008546001600160a01b039081169116146139e4576008546040516370a0823160e01b81523060048201526001600160a01b03909116906370a0823190602401602060405180830381865afa1580156139bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906139df9190614523565b6139e6565b475b90506139f183613ef6565b600954604080516315ab88c960e31b815290516000926001600160a01b03169163ad5c46489160048083019260209291908290030181865afa158015613a3b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613a5f9190614582565b6008546001600160a01b03908116911614613aef576008546040516370a0823160e01b815230600482015283916001600160a01b0316906370a0823190602401602060405180830381865afa158015613abc573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613ae09190614523565b613aea919061476b565b613af9565b613af9824761476b565b9050613b058382614074565b60408051858152602081018390529081018490527f17bbfb9a6069321b6ded73bd96327c9e6b7212a5cd51ff219cd61370acafb5619060600160405180910390a15050505050565b613b5681613ce7565b600c546040516370a0823160e01b81523060048201526000916001600160a01b0316906370a0823190602401602060405180830381865afa158015613b9f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613bc39190614523565b600c54600b5460405163a9059cbb60e01b81526001600160a01b0391821660048201526024810184905292935060009291169063a9059cbb906044016020604051808303816000875af1158015613c1e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613c429190614565565b90508015612a4857600b5460405163ba72a95560e01b8152600481018490526001600160a01b039091169063ba72a95590602401600060405180830381600087803b158015613c9057600080fd5b505af1158015613ca4573d6000803e3d6000fd5b505060408051868152602081018690527f80195cc573b02cc48460cbca6e6e4cc85ddb91959d946e1c3025ea3d87942dc3935001905060405180910390a1505050565b600c546008546001600160a01b03908116911614613e2d5760408051600380825260808201909252600091602082016060803683370190505090503081600081518110613d3657613d3661477e565b6001600160a01b039283166020918202929092010152600854825191169082906001908110613d6757613d6761477e565b6001600160a01b039283166020918202929092010152600c54825191169082906002908110613d9857613d9861477e565b6001600160a01b039283166020918202929092010152600954613dbe9130911684612832565b600954604051635c11d79560e01b81526001600160a01b0390911690635c11d79590613df79085906000908690309042906004016147d8565b600060405180830381600087803b158015613e1157600080fd5b505af1158015613e25573d6000803e3d6000fd5b505050505050565b6040805160028082526060820183526000926020830190803683370190505090503081600081518110613e6257613e6261477e565b6001600160a01b039283166020918202929092010152600c54825191169082906001908110613e9357613e9361477e565b6001600160a01b039283166020918202929092010152600654613eb99130911684612832565b600654600954604051637274ca1b60e11b81526001600160a01b039283169263e4e9943692613df792911690869060009087904290600401614814565b6040805160028082526060820183526000926020830190803683370190505090503081600081518110613f2b57613f2b61477e565b6001600160a01b039283166020918202929092010152600854825191169082906001908110613f5c57613f5c61477e565b6001600160a01b03928316602091820292909201810191909152600954604080516315ab88c960e31b81529051919093169263ad5c46489260048083019391928290030181865afa158015613fb5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190613fd99190614582565b6001600160a01b031681600181518110613ff557613ff561477e565b60200260200101516001600160a01b03160361405c576009546140239030906001600160a01b031684612832565b60095460405163791ac94760e01b81526001600160a01b039091169063791ac94790613df79085906000908690309042906004016147d8565b600654613eb99030906001600160a01b031684612832565b60095461408c9030906001600160a01b031684612832565b600960009054906101000a90046001600160a01b03166001600160a01b031663ad5c46486040518163ffffffff1660e01b8152600401602060405180830381865afa1580156140df573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906141039190614582565b6008546001600160a01b039182169116036141ab5760095460405163f305d71960e01b815230600482015260248101849052600060448201819052606482015261dead60848201524260a48201526001600160a01b039091169063f305d71990839060c40160606040518083038185885af1158015614186573d6000803e3d6000fd5b50505050506040513d601f19601f82011682018060405250810190610dcf919061459f565b60085460095460405163095ea7b360e01b81526001600160a01b0391821660048201526024810184905291169063095ea7b3906044016020604051808303816000875af1158015614200573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906142249190614565565b5060095460085460405162e8e33760e81b81523060048201526001600160a01b039182166024820152604481018590526064810184905260006084820181905260a482015261dead60c48201524260e482015291169063e8e3370090610104016060604051808303816000875af11580156142a3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610dcf919061459f565b600060208083528351808285015260005b818110156142f4578581018301518582016040015282016142d8565b506000604082860101526040601f19601f8301168501019250505092915050565b6001600160a01b03811681146110f157600080fd5b6000806040838503121561433d57600080fd5b823561434881614315565b946020939093013593505050565b60006020828403121561436857600080fd5b5035919050565b60008060006060848603121561438457600080fd5b833561438f81614315565b9250602084013561439f81614315565b929592945050506040919091013590565b80151581146110f157600080fd5b600080604083850312156143d157600080fd5b82356143dc81614315565b915060208301356143ec816143b0565b809150509250929050565b60006020828403121561440957600080fd5b813561441481614315565b9392505050565b803561ffff8116811461442d57600080fd5b919050565b6000806040838503121561444557600080fd5b61444e8361441b565b915061445c6020840161441b565b90509250929050565b6000806040838503121561447857600080fd5b823561448381614315565b915060208301356143ec81614315565b600181811c908216806144a757607f821691505b6020821081036144c757634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b602080825260079082015266616c726561647960c81b604082015260600190565b60006020828403121561453557600080fd5b5051919050565b634e487b7160e01b600052601160045260246000fd5b80820180821115610d3b57610d3b61453c565b60006020828403121561457757600080fd5b8151614414816143b0565b60006020828403121561459457600080fd5b815161441481614315565b6000806000606084860312156145b457600080fd5b8351925060208401519150604084015190509250925092565b61ffff8181168382160190808211156145e8576145e861453c565b5092915050565b6020808252600f908201526e73656c6c20666565203c3d2032302560881b604082015260600190565b6020808252600e908201526d62757920666565203c3d2032302560901b604082015260600190565b600080600080600080600080610100898b03121561465d57600080fd5b885161466881614315565b809850506020890151965060408901519550606089015194506080890151935060a0890151925060c0890151915060e089015190509295985092959890939650565b60208082526025908201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604082015264647265737360d81b606082015260800190565b60208082526023908201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260408201526265737360e81b606082015260800190565b8082028115828204841417610d3b57610d3b61453c565b60008261476657634e487b7160e01b600052601260045260246000fd5b500490565b81810381811115610d3b57610d3b61453c565b634e487b7160e01b600052603260045260246000fd5b600081518084526020808501945080840160005b838110156147cd5781516001600160a01b0316875295820195908201906001016147a8565b509495945050505050565b85815284602082015260a0604082015260006147f760a0830186614794565b6001600160a01b0394909416606083015250608001529392505050565b60018060a01b038616815284602082015283604082015260a06060820152600061484160a0830185614794565b9050826080830152969550505050505056fea2646970667358221220126fde41817b5364fc3f9e36039f43617b969452a142e21bb31dd27a0285640064736f6c63430008130033608060405234801561001057600080fd5b5061061b806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063e4e9943614610030575b600080fd5b61004361003e366004610438565b610045565b005b600083836100546001826104da565b81811061006357610063610501565b90506020020160208101906100789190610517565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa1580156100be573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100e29190610539565b9050838360008181106100f7576100f7610501565b905060200201602081019061010c9190610517565b6040516323b872dd60e01b8152336004820152306024820152604481018890526001600160a01b0391909116906323b872dd906064016020604051808303816000875af1158015610161573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101859190610552565b508383600081811061019957610199610501565b90506020020160208101906101ae9190610517565b60405163095ea7b360e01b81526001600160a01b03898116600483015260248201899052919091169063095ea7b3906044016020604051808303816000875af11580156101ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102239190610552565b50604051635c11d79560e01b81526001600160a01b03881690635c11d7959061025a90899089908990899030908a90600401610574565b600060405180830381600087803b15801561027457600080fd5b505af1158015610288573d6000803e3d6000fd5b50600092508391508690508561029f6001826104da565b8181106102ae576102ae610501565b90506020020160208101906102c39190610517565b6040516370a0823160e01b81523060048201526001600160a01b0391909116906370a0823190602401602060405180830381865afa158015610309573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061032d9190610539565b61033791906104da565b905084846103466001826104da565b81811061035557610355610501565b905060200201602081019061036a9190610517565b6001600160a01b031663a9059cbb8686600081811061038b5761038b610501565b90506020020160208101906103a09190610517565b6040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602481018490526044016020604051808303816000875af11580156103ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104119190610552565b505050505050505050565b80356001600160a01b038116811461043357600080fd5b919050565b60008060008060008060a0878903121561045157600080fd5b61045a8761041c565b95506020870135945060408701359350606087013567ffffffffffffffff8082111561048557600080fd5b818901915089601f83011261049957600080fd5b8135818111156104a857600080fd5b8a60208260051b85010111156104bd57600080fd5b602083019550809450505050608087013590509295509295509295565b818103818111156104fb57634e487b7160e01b600052601160045260246000fd5b92915050565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561052957600080fd5b6105328261041c565b9392505050565b60006020828403121561054b57600080fd5b5051919050565b60006020828403121561056457600080fd5b8151801515811461053257600080fd5b868152602080820187905260a0604083018190528201859052600090869060c08401835b888110156105c4576001600160a01b036105b18561041c565b1682529282019290820190600101610598565b506001600160a01b039690961660608501525050506080015294935050505056fea2646970667358221220634e0aa2b1d2f358d1f5c1a385d461a06e8923eb203948622e0ae36dcf45974864736f6c634300081300334f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572" as Address