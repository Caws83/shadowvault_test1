
export const lanchManagerAbi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_creationFee",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_platformFeePercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_prizeFeePercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_burnFeePercentage",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_burnToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_treasury",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_prizeTreasury",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_router",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_sponsorshipFee",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Contributed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "nativeCoinAmount",
				"type": "uint256"
			}
		],
		"name": "LiquidityAdded",
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
				"internalType": "address",
				"name": "tokenContract",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endEpoch",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "RoundStarted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokensCollected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalDistributed",
				"type": "uint256"
			}
		],
		"name": "TokensDistributed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "burnFeePercentage",
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
		"name": "burnToken",
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
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "collect",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "contribute",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "creationFee",
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
		"name": "deadAddress",
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
				"name": "roundId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_website",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_telegram",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_logo",
				"type": "string"
			}
		],
		"name": "editProjectInfo",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "finalizeHowMany",
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
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "finalizeRound",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "pageNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pageSize",
				"type": "uint256"
			}
		],
		"name": "getFinishedRounds",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "roundId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "symbol",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endEpoch",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "softCap",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isFinished",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isGraduated",
						"type": "bool"
					},
					{
						"internalType": "string[4]",
						"name": "projectInfo",
						"type": "string[4]"
					},
					{
						"internalType": "bool",
						"name": "sponsored",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "tokenContract",
						"type": "address"
					}
				],
				"internalType": "struct PreLaunchManager3.Round[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "total",
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
				"name": "pageNumber",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pageSize",
				"type": "uint256"
			}
		],
		"name": "getLiveRounds",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "roundId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "symbol",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endEpoch",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "softCap",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isFinished",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isGraduated",
						"type": "bool"
					},
					{
						"internalType": "string[4]",
						"name": "projectInfo",
						"type": "string[4]"
					},
					{
						"internalType": "bool",
						"name": "sponsored",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "tokenContract",
						"type": "address"
					}
				],
				"internalType": "struct PreLaunchManager3.Round[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "total",
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
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "getRoundContributions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "collected",
						"type": "bool"
					}
				],
				"internalType": "struct PreLaunchManager3.RoundUserContribution[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			}
		],
		"name": "getRoundDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "roundId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "symbol",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endEpoch",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "softCap",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isFinished",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isGraduated",
						"type": "bool"
					},
					{
						"internalType": "string[4]",
						"name": "projectInfo",
						"type": "string[4]"
					},
					{
						"internalType": "bool",
						"name": "sponsored",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "tokenContract",
						"type": "address"
					}
				],
				"internalType": "struct PreLaunchManager3.Round",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "howMany",
				"type": "uint256"
			}
		],
		"name": "getTop",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "roundId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "symbol",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endEpoch",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "softCap",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isFinished",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isGraduated",
						"type": "bool"
					},
					{
						"internalType": "string[4]",
						"name": "projectInfo",
						"type": "string[4]"
					},
					{
						"internalType": "bool",
						"name": "sponsored",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "tokenContract",
						"type": "address"
					}
				],
				"internalType": "struct PreLaunchManager3.Round[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "total",
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
				"name": "howMany",
				"type": "uint256"
			}
		],
		"name": "getTopLiveWithSponsorship",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "roundId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "symbol",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalRaised",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "endEpoch",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "softCap",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isFinished",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isGraduated",
						"type": "bool"
					},
					{
						"internalType": "string[4]",
						"name": "projectInfo",
						"type": "string[4]"
					},
					{
						"internalType": "bool",
						"name": "sponsored",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "address",
						"name": "tokenContract",
						"type": "address"
					}
				],
				"internalType": "struct PreLaunchManager3.Round[]",
				"name": "",
				"type": "tuple[]"
			},
			{
				"internalType": "uint256",
				"name": "total",
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
				"name": "roundId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserContributionAndAllocation",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "contribution",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenAllocation",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "collected",
				"type": "bool"
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
		"inputs": [],
		"name": "platformFeePercentage",
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
		"name": "prizeFeePercentage",
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
		"name": "prizeTreasury",
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
		"name": "roundContributions",
		"outputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "collected",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rounds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "roundId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "totalSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRaised",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endEpoch",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "softCap",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isFinished",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isGraduated",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "sponsored",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenContract",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "router",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "newBurnToken",
				"type": "address"
			}
		],
		"name": "setBurnToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newCreationFee",
				"type": "uint256"
			}
		],
		"name": "setCreationFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newPlatformPercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newBurnPercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newPrizePercentage",
				"type": "uint256"
			}
		],
		"name": "setFeePercentages",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newRouter",
				"type": "address"
			}
		],
		"name": "setRouter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newSponsorshipFee",
				"type": "uint256"
			}
		],
		"name": "setSponsorshipFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newTreasury",
				"type": "address"
			}
		],
		"name": "setTreasury",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "sponsorshipFee",
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
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_endEpoch",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_softCap",
				"type": "uint256"
			},
			{
				"internalType": "string[4]",
				"name": "_projectInfo",
				"type": "string[4]"
			},
			{
				"internalType": "bool",
				"name": "_sponsored",
				"type": "bool"
			}
		],
		"name": "startRound",
		"outputs": [],
		"stateMutability": "payable",
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
		"name": "withdrawPlatformFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const
