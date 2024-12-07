import { Address } from "viem"

export const erc404Token = [
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
				"internalType": "string",
				"name": "_baseURI",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_extension",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "maxTotalSupplyERC721_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_costBNB",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_payToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_costToken",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_mintOnDeploy",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyExists",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "DecimalsTooLow",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidApproval",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidExemption",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidRecipient",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidSender",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidSigner",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidTokenId",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "MintLimitReached",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotFound",
		"type": "error"
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
		"name": "OwnedIndexOverflow",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "PermitDeadlineExpired",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "QueueEmpty",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "QueueFull",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "QueueOutOfBounds",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "RecipientIsERC721TransferExempt",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "Unauthorized",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "UnsafeRecipient",
		"type": "error"
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
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"name": "mintedIds",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DOMAIN_SEPARATOR",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FGAdmin",
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
				"name": "newFGAdmin",
				"type": "address"
			}
		],
		"name": "FGSetFGAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_fgFee",
				"type": "uint256"
			}
		],
		"name": "FGSetFeePercent",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"inputs": [],
		"name": "ID_ENCODING_PREFIX",
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
		"name": "PayToken",
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
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_howMany",
				"type": "uint256"
			}
		],
		"name": "addFreeWhitelistUserOrAddMoreSpots",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "amountMinted",
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
				"name": "spender_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "valueOrId_",
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
		"inputs": [],
		"name": "autoExemptAmount",
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
				"name": "",
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
		"name": "baseExtension",
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
		"name": "baseURI",
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
		"name": "costBNB",
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
		"name": "costToken",
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
		"name": "currentSupply",
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
				"name": "spender_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value_",
				"type": "uint256"
			}
		],
		"name": "erc20Approve",
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
				"name": "owner_",
				"type": "address"
			}
		],
		"name": "erc20BalanceOf",
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
		"name": "erc20TotalSupply",
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
				"name": "from_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value_",
				"type": "uint256"
			}
		],
		"name": "erc20TransferFrom",
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
				"name": "spender_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id_",
				"type": "uint256"
			}
		],
		"name": "erc721Approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner_",
				"type": "address"
			}
		],
		"name": "erc721BalanceOf",
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
		"name": "erc721TotalSupply",
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
				"name": "target_",
				"type": "address"
			}
		],
		"name": "erc721TransferExempt",
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
				"name": "from_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id_",
				"type": "uint256"
			}
		],
		"name": "erc721TransferFrom",
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
			}
		],
		"name": "getApproved",
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
		"name": "getERC721QueueLength",
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
				"name": "start_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "count_",
				"type": "uint256"
			}
		],
		"name": "getERC721TokensInQueue",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "goPublic",
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
		"name": "howMany",
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
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
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
		"name": "maxMintAmount",
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
		"name": "maxSupply",
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
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_mintAmount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "minted",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "nonces",
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
				"name": "owner_",
				"type": "address"
			}
		],
		"name": "owned",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
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
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_mintAmount",
				"type": "uint256"
			}
		],
		"name": "ownerMint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ownerMintAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id_",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "erc721Owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pageInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_MaxSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_CurrentSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_MaxMint",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_PayToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_CostBNB",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_CostToken",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_goPublic",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_subOp",
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
				"name": "owner_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value_",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline_",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "v_",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r_",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s_",
				"type": "bytes32"
			}
		],
		"name": "permit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "removeFreeWhitelistUser",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "from_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id_",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "id_",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data_",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator_",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved_",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newAutoExemptAmount",
				"type": "uint256"
			}
		],
		"name": "setAutoExemptAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_newBaseExtension",
				"type": "string"
			}
		],
		"name": "setBaseExtension",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_newBaseURI",
				"type": "string"
			}
		],
		"name": "setBaseURI",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newCost",
				"type": "uint256"
			}
		],
		"name": "setCostBNB",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newCost",
				"type": "uint256"
			}
		],
		"name": "setCostToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account_",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "value_",
				"type": "bool"
			}
		],
		"name": "setERC721TransferExempt",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "setGoPublic",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newToken",
				"type": "address"
			}
		],
		"name": "setPayToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "state_",
				"type": "bool"
			}
		],
		"name": "setSelfERC721TransferExempt",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newSubOperator",
				"type": "address"
			}
		],
		"name": "setSubOperator",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newmaxMintAmount",
				"type": "uint256"
			}
		],
		"name": "setmaxMintAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "subOperator",
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
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
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
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
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
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value_",
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
				"name": "from_",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to_",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "valueOrId_",
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
		"name": "units",
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
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "walletOfOwner",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "whiteMint",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "ids",
				"type": "uint256[]"
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
		"name": "whitelisted",
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
		"name": "withdrawBNB",
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

export const byteCode =
"610140604052600561010090815264173539b7b760d91b6101205260109062000029908262000e27565b506004601455600360155560006016556018805460ff19169055601f80546001600160a01b03191673449183e39d76fa4c1f516d3ea2feed3e8c99e8f117905560405162005259388190039081908339810160408190526200008b9162000fd1565b8989893380620000b657604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b620000c1816200027e565b506003620000d0848262000e27565b506004620000df838262000e27565b5060ff81166080819052620000f690600a620011eb565b60a0524660c05262000107620002ce565b60e052505034159050620001c75760405160009073449183e39d76fa4c1f516d3ea2feed3e8c99e8f19034908381818185875af1925050503d80600081146200016d576040519150601f19603f3d011682016040523d82523d6000602084013e62000172565b606091505b5050905080620001c55760405162461bcd60e51b815260206004820152601460248201527f6661696c20746f207472616e73666572206665650000000000000000000000006044820152606401620000ad565b505b6010620001d5878262000e27565b50600f620001e4888262000e27565b50601385905560118490556012829055601d805473449183e39d76fa4c1f516d3ea2feed3e8c99e8f16001600160a01b031991821617909155601c80549091166001600160a01b03851617905580156200025957620002533360a051836200024d919062001203565b6200036a565b60168190555b60a0516200026a906101f462001203565b601755506200133298505050505050505050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60036040516200030291906200121d565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b6001600160a01b0382166200039257604051634e46966960e11b815260040160405180910390fd5b600160ff1b81600554620003a791906200129b565b1115620003c75760405163303b682f60e01b815260040160405180910390fd5b620003d560008383620003da565b505050565b6000601754821115620003f457620003f483600162000409565b620004018484846200047f565b949350505050565b6001600160a01b038216620004315760405163a41e3d3f60e01b815260040160405180910390fd5b8015620004495762000443826200072e565b62000454565b620004548262000766565b6001600160a01b03919091166000908152600d60205260409020805460ff1916911515919091179055565b6001600160a01b03838116600090815260076020526040808220549285168252812054909190620004b2868686620007ef565b6000620004bf87620008a1565b90506000620004ce87620008a1565b9050818015620004db5750805b620007205781156200055757600060a05184620004f99190620012b1565b60a0516001600160a01b038a16600090815260076020526040902054620005219190620012b1565b6200052d9190620012d4565b905060005b818110156200054f576200054689620008d8565b60010162000532565b505062000720565b8015620005c45760a0516001600160a01b03891660009081526007602052604081205490916200058791620012b1565b60a051620005969087620012b1565b620005a29190620012d4565b905060005b818110156200054f57620005bb8a620009ce565b600101620005a7565b600060a05187620005d69190620012b1565b905060005b8181101562000668576001600160a01b038a166000908152600c60205260408120546200060b90600190620012d4565b6001600160a01b038c166000908152600c6020526040812080549293509091839081106200063d576200063d620012ea565b906000526020600020015490506200065d8c8c8362000a6360201b60201c565b5050600101620005db565b5060a05181906200068e8b6001600160a01b031660009081526007602052604090205490565b6200069a9190620012b1565b60a051620006a99088620012b1565b620006b59190620012d4565b1115620006c757620006c789620009ce565b8060a05185620006d89190620012b1565b60a0516001600160a01b038b16600090815260076020526040902054620007009190620012b1565b6200070c9190620012d4565b11156200071e576200071e88620008d8565b505b506001979650505050505050565b6001600160a01b0381166000908152600c6020526040812054905b81811015620003d5576200075d83620009ce565b60010162000749565b60a0516000906200078c836001600160a01b031660009081526007602052604090205490565b620007989190620012b1565b90506000620007bc836001600160a01b03166000908152600c602052604090205490565b905060005b620007cd8284620012d4565b811015620007e957620007e084620008d8565b600101620007c1565b50505050565b6001600160a01b0383166200081e5780600560008282546200081291906200129b565b909155506200084e9050565b6001600160a01b0383166000908152600760205260408120805483929062000848908490620012d4565b90915550505b6001600160a01b03808316600081815260076020526040908190208054850190555190918516906000805160206200523983398151915290620008949085815260200190565b60405180910390a3505050565b60006001600160a01b0382161580620008d257506001600160a01b0382166000908152600d602052604090205460ff165b92915050565b6001600160a01b0381166200090057604051634e46966960e11b815260040160405180910390fd5b600062000921600154600160801b81046001600160801b0390811691161490565b6200093a5762000932600162000c3f565b905062000989565b6006600081546200094b9062001300565b90915550600654600101620009735760405163303b682f60e01b815260040160405180910390fd5b6006546200098690600160ff1b6200129b565b90505b6000818152600b60205260409020546001600160a01b03168015620009c15760405163119b4fd360e11b815260040160405180910390fd5b620003d581848462000a63565b6001600160a01b038116620009f657604051636edaef2f60e11b815260040160405180910390fd5b6001600160a01b0381166000908152600c60205260408120805462000a1e90600190620012d4565b8154811062000a315762000a31620012ea565b9060005260206000200154905062000a528260008362000a6360201b60201c565b62000a5f60018262000cb0565b5050565b6001600160a01b0383161562000b7d57600081815260096020908152604080832080546001600160a01b03191690556001600160a01b0386168352600c9091528120805462000ab590600190620012d4565b8154811062000ac85762000ac8620012ea565b9060005260206000200154905081811462000b3b576000828152600b602052604081205460a01c6001600160a01b0386166000908152600c60205260409020805491925083918390811062000b215762000b21620012ea565b60009182526020909120015562000b39828262000d1b565b505b6001600160a01b0384166000908152600c6020526040902080548062000b655762000b656200131c565b60019003818190600052602060002001600090559055505b6001600160a01b0382161562000bfa576000818152600b6020908152604080832080546001600160a01b0319166001600160a01b038716908101909155808452600c8352908320805460018181018355828652938520018590559252905462000bf491839162000bee9190620012d4565b62000d1b565b62000c0a565b6000818152600b60205260408120555b80826001600160a01b0316846001600160a01b03166000805160206200523983398151915260405160405180910390a4505050565b80546000906001600160801b03600160801b820481169116810362000c77576040516375e52f4f60e01b815260040160405180910390fd5b600019016001600160801b039081166000818152600185016020526040812080549190558454909216600160801b909102179092555090565b81546001600160801b038082166000190191600160801b900481169082160362000ced57604051638acb5f2760e01b815260040160405180910390fd5b6001600160801b0316600081815260018401602052604090209190915581546001600160801b031916179055565b6000828152600b60205260409020546001600160601b0382111562000d5357604051633f2cd0e360e21b815260040160405180910390fd5b6000928352600b60205260409092206001600160a01b039290921660a09190911b6001600160a01b031916019055565b634e487b7160e01b600052604160045260246000fd5b600181811c9082168062000dae57607f821691505b60208210810362000dcf57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620003d557600081815260208120601f850160051c8101602086101562000dfe5750805b601f850160051c820191505b8181101562000e1f5782815560010162000e0a565b505050505050565b81516001600160401b0381111562000e435762000e4362000d83565b62000e5b8162000e54845462000d99565b8462000dd5565b602080601f83116001811462000e93576000841562000e7a5750858301515b600019600386901b1c1916600185901b17855562000e1f565b600085815260208120601f198616915b8281101562000ec45788860151825594840194600190910190840162000ea3565b508582101562000ee35787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600082601f83011262000f0557600080fd5b81516001600160401b038082111562000f225762000f2262000d83565b604051601f8301601f19908116603f0116810190828211818310171562000f4d5762000f4d62000d83565b8160405283815260209250868385880101111562000f6a57600080fd5b600091505b8382101562000f8e578582018301518183018401529082019062000f6f565b600093810190920192909252949350505050565b805160ff8116811462000fb457600080fd5b919050565b80516001600160a01b038116811462000fb457600080fd5b6000806000806000806000806000806101408b8d03121562000ff257600080fd5b8a516001600160401b03808211156200100a57600080fd5b620010188e838f0162000ef3565b9b5060208d01519150808211156200102f57600080fd5b6200103d8e838f0162000ef3565b9a506200104d60408e0162000fa2565b995060608d01519150808211156200106457600080fd5b620010728e838f0162000ef3565b985060808d01519150808211156200108957600080fd5b50620010988d828e0162000ef3565b96505060a08b0151945060c08b01519350620010b760e08c0162000fb9565b92506101008b015191506101208b015190509295989b9194979a5092959850565b634e487b7160e01b600052601160045260246000fd5b600181815b808511156200112f578160001904821115620011135762001113620010d8565b808516156200112157918102915b93841c9390800290620010f3565b509250929050565b6000826200114857506001620008d2565b816200115757506000620008d2565b81600181146200117057600281146200117b576200119b565b6001915050620008d2565b60ff8411156200118f576200118f620010d8565b50506001821b620008d2565b5060208310610133831016604e8410600b8410161715620011c0575081810a620008d2565b620011cc8383620010ee565b8060001904821115620011e357620011e3620010d8565b029392505050565b6000620011fc60ff84168362001137565b9392505050565b8082028115828204841417620008d257620008d2620010d8565b60008083546200122d8162000d99565b600182811680156200124857600181146200125e576200128f565b60ff19841687528215158302870194506200128f565b8760005260208060002060005b85811015620012865781548a8201529084019082016200126b565b50505082870194505b50929695505050505050565b80820180821115620008d257620008d2620010d8565b600082620012cf57634e487b7160e01b600052601260045260246000fd5b500490565b81810381811115620008d257620008d2620010d8565b634e487b7160e01b600052603260045260246000fd5b600060018201620013155762001315620010d8565b5060010190565b634e487b7160e01b600052603160045260246000fd5b60805160a05160c05160e051613e64620013d56000396000611220015260006111f0015260008181610aa1015281816116c60152818161186d01528181611b1d015281816126c5015281816127e901528181612f0b01528181612fe0015281816130240152818161309d015281816130c70152818161311b015281816131c70152818161321401528181613258015261327f015260006106cc0152613e646000f3fe6080604052600436106104615760003560e01c8063771282f61161023f578063bc47fdcf11610139578063da3ef23f116100b6578063e985e9c51161007a578063e985e9c514610dfd578063f2fde38b14610e38578063f60f49bb14610e58578063f6a15d7114610e78578063f780bc1a14610e9857600080fd5b8063da3ef23f14610d50578063dd62ed3e14610d70578063dd63769914610da8578063dfabc03314610dc8578063e4fd349314610de857600080fd5b8063cc0f4ecc116100fd578063cc0f4ecc14610caa578063d505accf14610cca578063d5abeb0114610cea578063d936547e14610d00578063d96ca0b914610d3057600080fd5b8063bc47fdcf14610bd9578063c5ab3ba614610c40578063c668286214610c55578063c6e672b914610c6a578063c87b56dd14610c8a57600080fd5b806395d89b41116101c7578063abaf9d021161018b578063abaf9d0214610b23578063ac5cad5614610b43578063b1ab931714610b63578063b3f9ea3414610b83578063b88d4fde14610bb957600080fd5b806395d89b4114610a7a578063976a843514610a8f5780639b05387714610ac3578063a22cb46514610ae3578063a9059cbb14610b0357600080fd5b80638417fa2f1161020e5780638417fa2f146109e057806389fb4c66146109fa5780638a696e5014610a0f5780638da5cb5b14610a2f578063926df1b214610a4d57600080fd5b8063771282f6146109685780637b6e74ba1461097e5780637ecebe00146109935780637f00c7a6146109c057600080fd5b80633644e5151161035b578063602977ad116102d85780636f96e99c1161029c5780636f96e99c146108db57806370a08231146108fb578063715018a6146109285780637479b6b61461093d57806374a349d21461095257600080fd5b8063602977ad1461084157806361d027b31461086e5780636352211e1461088e5780636c0360eb146108ae5780636e8f624b146108c357600080fd5b8063438b63001161031f578063438b6300146107ab578063484b973c146107cb5780634d966072146107eb5780634f02c4201461080b57806355f804b31461082157600080fd5b80633644e5151461071657806339bfaa5e1461072b5780633b8d3c561461074b57806340c10f191461076b57806342842e0e1461078b57600080fd5b80631bf8b7f2116103e95780632a555c4f116103ad5780632a555c4f146106645780632a72d90a1461067a5780632e124ec31461069a578063313ce567146106ba578063319987ac1461070057600080fd5b80631bf8b7f2146105e35780631d111d13146106035780631f927dcb14610618578063239c70ae1461062e57806323b872dd1461064457600080fd5b8063081812fc11610430578063081812fc1461052a578063095ea7b31461057857806309674eb01461059857806309f0ef65146105ad57806318160ddd146105cd57600080fd5b806301ffc9a71461046d57806302519da3146104a257806306fdde03146104e6578063078185d71461050857600080fd5b3661046857005b600080fd5b34801561047957600080fd5b5061048d610488366004613696565b610eb8565b60405190151581526020015b60405180910390f35b3480156104ae57600080fd5b506104d86104bd3660046136ca565b6001600160a01b031660009081526007602052604090205490565b604051908152602001610499565b3480156104f257600080fd5b506104fb610f25565b6040516104999190613735565b34801561051457600080fd5b50610528610523366004613748565b610fb3565b005b34801561053657600080fd5b50610560610545366004613748565b6009602052600090815260409020546001600160a01b031681565b6040516001600160a01b039091168152602001610499565b34801561058457600080fd5b5061048d610593366004613761565b610fe4565b3480156105a457600080fd5b506104d861101d565b3480156105b957600080fd5b5061048d6105c83660046136ca565b611047565b3480156105d957600080fd5b506104d860055481565b3480156105ef57600080fd5b50601d54610560906001600160a01b031681565b34801561060f57600080fd5b50610528611079565b34801561062457600080fd5b506104d860155481565b34801561063a57600080fd5b506104d860145481565b34801561065057600080fd5b5061048d61065f36600461378b565b6110a7565b34801561067057600080fd5b506104d860115481565b34801561068657600080fd5b50610528610695366004613748565b6110e4565b3480156106a657600080fd5b506105286106b53660046136ca565b61113f565b3480156106c657600080fd5b506106ee7f000000000000000000000000000000000000000000000000000000000000000081565b60405160ff9091168152602001610499565b34801561070c57600080fd5b506104d860175481565b34801561072257600080fd5b506104d86111ec565b34801561073757600080fd5b50610528610746366004613761565b611242565b34801561075757600080fd5b50610528610766366004613748565b6112b4565b61077e610779366004613761565b6112e5565b6040516104999190613802565b34801561079757600080fd5b506105286107a636600461378b565b61179b565b3480156107b757600080fd5b5061077e6107c63660046136ca565b6117bb565b3480156107d757600080fd5b506105286107e6366004613761565b6117c6565b3480156107f757600080fd5b5061048d610806366004613761565b6118ae565b34801561081757600080fd5b506104d860065481565b34801561082d57600080fd5b5061052861083c3660046138a1565b61193b565b34801561084d57600080fd5b506104d861085c3660046136ca565b601a6020526000908152604090205481565b34801561087a57600080fd5b50601f54610560906001600160a01b031681565b34801561089a57600080fd5b506105606108a9366004613748565b611953565b3480156108ba57600080fd5b506104fb6119bd565b3480156108cf57600080fd5b506104d8600160ff1b81565b3480156108e757600080fd5b506105286108f63660046136ca565b6119ca565b34801561090757600080fd5b506104d86109163660046136ca565b60076020526000908152604090205481565b34801561093457600080fd5b50610528611a18565b34801561094957600080fd5b5061077e611a2a565b34801561095e57600080fd5b506104d860125481565b34801561097457600080fd5b506104d860165481565b34801561098a57600080fd5b50610528611c1c565b34801561099f57600080fd5b506104d86109ae3660046136ca565b600e6020526000908152604090205481565b3480156109cc57600080fd5b506105286109db366004613748565b611ca0565b3480156109ec57600080fd5b5060185461048d9060ff1681565b348015610a0657600080fd5b506005546104d8565b348015610a1b57600080fd5b50610528610a2a3660046138f8565b611cd1565b348015610a3b57600080fd5b506000546001600160a01b0316610560565b348015610a5957600080fd5b506104d8610a68366004613748565b601b6020526000908152604090205481565b348015610a8657600080fd5b506104fb611cde565b348015610a9b57600080fd5b506104d87f000000000000000000000000000000000000000000000000000000000000000081565b348015610acf57600080fd5b50610528610ade3660046136ca565b611ceb565b348015610aef57600080fd5b50610528610afe366004613915565b611d24565b348015610b0f57600080fd5b5061048d610b1e366004613761565b611db7565b348015610b2f57600080fd5b50610528610b3e366004613748565b611deb565b348015610b4f57600080fd5b50610528610b5e3660046136ca565b611df8565b348015610b6f57600080fd5b5061077e610b7e3660046136ca565b611ee1565b348015610b8f57600080fd5b506104d8610b9e3660046136ca565b6001600160a01b03166000908152600c602052604090205490565b348015610bc557600080fd5b50610528610bd436600461394c565b611f4d565b348015610be557600080fd5b50610bee61203b565b60408051998a5260208a0198909852968801959095526001600160a01b039384166060880152608087019290925260a0860152151560c085015290811660e08401521661010082015261012001610499565b348015610c4c57600080fd5b506006546104d8565b348015610c6157600080fd5b506104fb6120c3565b348015610c7657600080fd5b50610528610c85366004613915565b6120d0565b348015610c9657600080fd5b506104fb610ca5366004613748565b6120e2565b348015610cb657600080fd5b50610528610cc53660046136ca565b6121db565b348015610cd657600080fd5b50610528610ce53660046139c8565b61227c565b348015610cf657600080fd5b506104d860135481565b348015610d0c57600080fd5b5061048d610d1b3660046136ca565b60196020526000908152604090205460ff1681565b348015610d3c57600080fd5b5061048d610d4b36600461378b565b6124bf565b348015610d5c57600080fd5b50610528610d6b3660046138a1565b61257f565b348015610d7c57600080fd5b506104d8610d8b366004613a3b565b600860209081526000928352604080842090915290825290205481565b348015610db457600080fd5b50610528610dc336600461378b565b612593565b348015610dd457600080fd5b50610528610de3366004613761565b6126f4565b348015610df457600080fd5b506105286127b9565b348015610e0957600080fd5b5061048d610e18366004613a3b565b600a60209081526000928352604080842090915290825290205460ff1681565b348015610e4457600080fd5b50610528610e533660046136ca565b612828565b348015610e6457600080fd5b50601c54610560906001600160a01b031681565b348015610e8457600080fd5b50601e54610560906001600160a01b031681565b348015610ea457600080fd5b5061077e610eb3366004613a6e565b612863565b60006001600160e01b0319821663caf91ff560e01b1480610ee957506001600160e01b031982166301ffc9a760e01b145b80610f0457506380ac58cd60e01b6001600160e01b03198316145b80610f1f5750635b5e139f60e01b6001600160e01b03198316145b92915050565b60038054610f3290613a90565b80601f0160208091040260200160405190810160405280929190818152602001828054610f5e90613a90565b8015610fab5780601f10610f8057610100808354040283529160200191610fab565b820191906000526020600020905b815481529060010190602001808311610f8e57829003601f168201915b505050505081565b601e546001600160a01b0316331480610fd657506000546001600160a01b031633145b610fdf57600080fd5b601255565b6000610fef82612900565b1561100357610ffe83836126f4565b611014565b61100d83836118ae565b9050610f1f565b50600192915050565b60006110426001546001600160801b03808216600160801b9092048116919091031690565b905090565b60006001600160a01b0382161580610f1f5750506001600160a01b03166000908152600d602052604090205460ff1690565b611081612919565b60405133904780156108fc02916000818181858888f193505050506110a557600080fd5b565b60006110b282612900565b156110c7576110c2848484612593565b6110d9565b6110d28484846124bf565b90506110dd565b5060015b9392505050565b601d546001600160a01b031633146110fb57600080fd5b6032811061113a5760405162461bcd60e51b81526020600482015260076024820152666d61782035302560c81b60448201526064015b60405180910390fd5b601555565b601e546001600160a01b031633148061116257506000546001600160a01b031633145b61116b57600080fd5b6001600160a01b03811660009081526019602052604090205460ff166111c05760405162461bcd60e51b815260206004820152600a6024820152691b9bdd08131a5cdd195960b21b6044820152606401611131565b6001600160a01b03166000908152601960209081526040808320805460ff19169055601a909152812055565b60007f0000000000000000000000000000000000000000000000000000000000000000461461121d57611042612946565b507f000000000000000000000000000000000000000000000000000000000000000090565b601e546001600160a01b031633148061126557506000546001600160a01b031633145b61126e57600080fd5b6001600160a01b0382166000908152601960209081526040808320805460ff19166001179055601a909152812080548392906112ab908490613ae0565b90915550505050565b601e546001600160a01b03163314806112d757506000546001600160a01b031633145b6112e057600080fd5b601155565b60185460609060ff166113335760405162461bcd60e51b81526020600482015260166024820152752737ba10283ab13634b1b63c902634bb32902cb2ba1760511b6044820152606401611131565b601c546012546001600160a01b03909116901561150957600060646015548560125461135f9190613af3565b6113699190613af3565b6113739190613b0a565b9050600081856012546113869190613af3565b6113909190613b2c565b601f546040516323b872dd60e01b81523360048201526001600160a01b039182166024820152604481018590529192508416906323b872dd906064016020604051808303816000875af11580156113eb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061140f9190613b3f565b61144f5760405162461bcd60e51b81526020600482015260116024820152704e6f7420456e6f75676820546f6b656e7360781b6044820152606401611131565b6040516323b872dd60e01b8152336004820152306024820152604481018290526001600160a01b038416906323b872dd906064016020604051808303816000875af11580156114a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114c69190613b3f565b6115065760405162461bcd60e51b81526020600482015260116024820152704e6f7420456e6f75676820546f6b656e7360781b6044820152606401611131565b50505b601154156115bd578260115461151f9190613af3565b34101561155f5760405162461bcd60e51b815260206004820152600e60248201526d2737ba1022b737bab3b41021272160911b6044820152606401611131565b60006064601554856011546115749190613af3565b61157e9190613af3565b6115889190613b0a565b601f546040519192506001600160a01b03169082156108fc029083906000818181858888f193505050506115bb57600080fd5b505b601654836116045760405162461bcd60e51b81526020600482015260146024820152734d757374206d696e74206174206c65617374203160601b6044820152606401611131565b60145484111561164d5760405162461bcd60e51b815260206004820152601460248201527309ad2dce840c2dadeeadce840a8dede4090d2ced60631b6044820152606401611131565b60135461165a8583613ae0565b11156116785760405162461bcd60e51b815260040161113190613b5c565b8367ffffffffffffffff81111561169157611691613815565b6040519080825280602002602001820160405280156116ba578160200160208202803683370190505b5092506116f0336116eb7f000000000000000000000000000000000000000000000000000000000000000087613af3565b6129e0565b60015b84811161174157806016546117089190613ae0565b84611714600184613b2c565b8151811061172457611724613b88565b60209081029190910101528061173981613b9e565b9150506116f3565b5083601660008282546117549190613ae0565b90915550506040517f807353be1b17c00f363c8d635aef4d159ccc6e5e2412ffbe1aab88c3df5c9e8c9061178b9087908690613bb7565b60405180910390a1505092915050565b6117b683838360405180602001604052806000815250611f4d565b505050565b6060610f1f82611ee1565b601e546001600160a01b03163314806117e957506000546001600160a01b031633145b6117f257600080fd5b601654816118395760405162461bcd60e51b81526020600482015260146024820152734d757374206d696e74206174206c65617374203160601b6044820152606401611131565b6013546118468383613ae0565b11156118645760405162461bcd60e51b815260040161113190613b5c565b611892836116eb7f000000000000000000000000000000000000000000000000000000000000000085613af3565b81601660008282546118a49190613ae0565b9091555050505050565b60006001600160a01b0383166118d757604051635461585f60e01b815260040160405180910390fd5b3360008181526008602090815260408083206001600160a01b03881680855290835292819020869055518581529192917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a350600192915050565b611943612919565b600f61194f8282613c29565b5050565b6000818152600b60205260409020546001600160a01b031661197482612900565b611991576040516307ed98ed60e31b815260040160405180910390fd5b6001600160a01b0381166119b85760405163c5723b5160e01b815260040160405180910390fd5b919050565b600f8054610f3290613a90565b601e546001600160a01b03163314806119ed57506000546001600160a01b031633145b6119f657600080fd5b601c80546001600160a01b0319166001600160a01b0392909216919091179055565b611a20612919565b6110a56000612a45565b60165460135460609190611a3f826001613ae0565b1115611a5d5760405162461bcd60e51b815260040161113190613b5c565b3360009081526019602052604090205460ff16611aae5760405162461bcd60e51b815260206004820152600f60248201526e139bdd0815da1a5d195b1a5cdd1959608a1b6044820152606401611131565b336000908152601a6020526040902054611af45760405162461bcd60e51b815260206004820152600760248201526614985b8813dd5d60ca1b6044820152606401611131565b6040805160018082528183019092529060208083019080368337019050509150611b43336116eb7f00000000000000000000000000000000000000000000000000000000000000006001613af3565b601654611b51906001613ae0565b82600081518110611b6457611b64613b88565b602090810291909101810191909152336000908152601a90915260408120805460019290611b93908490613b2c565b9091555050336000908152601a60205260408120549003611bc657336000908152601960205260409020805460ff191690555b600160166000828254611bd99190613ae0565b90915550506040517f807353be1b17c00f363c8d635aef4d159ccc6e5e2412ffbe1aab88c3df5c9e8c90611c109033908590613bb7565b60405180910390a15090565b601e546001600160a01b0316331480611c3f57506000546001600160a01b031633145b611c4857600080fd5b60185460ff1615611c915760405162461bcd60e51b8152602060048201526013602482015272616c726561647920676f6e65207075626c696360681b6044820152606401611131565b6018805460ff19166001179055565b601e546001600160a01b0316331480611cc357506000546001600160a01b031633145b611ccc57600080fd5b601455565b611cdb3382612a95565b50565b60048054610f3290613a90565b601d546001600160a01b03163314611d0257600080fd5b601d80546001600160a01b0319166001600160a01b0392909216919091179055565b6001600160a01b038216611d4b5760405163ccea9e6f60e01b815260040160405180910390fd5b336000818152600a602090815260408083206001600160a01b03871680855290835292819020805460ff191686151590811790915590519081529192917f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a35050565b60006001600160a01b038316611de057604051634e46966960e11b815260040160405180910390fd5b6110dd338484612b04565b611df3612919565b601755565b611e00612919565b6040516370a0823160e01b81523060048201526001600160a01b0382169063a9059cbb90339083906370a0823190602401602060405180830381865afa158015611e4e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611e729190613ce9565b6040516001600160e01b031960e085901b1681526001600160a01b03909216600483015260248201526044016020604051808303816000875af1158015611ebd573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061194f9190613b3f565b6001600160a01b0381166000908152600c6020908152604091829020805483518184028101840190945280845260609392830182828015611f4157602002820191906000526020600020905b815481526020019060010190808311611f2d575b50505050509050919050565b611f5682612900565b611f73576040516307ed98ed60e31b815260040160405180910390fd5b611f7e8484846110a7565b506001600160a01b0383163b158015906120175750604051630a85bd0160e11b808252906001600160a01b0385169063150b7a0290611fc7903390899088908890600401613d02565b6020604051808303816000875af1158015611fe6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061200a9190613d3f565b6001600160e01b03191614155b1561203557604051633da6393160e01b815260040160405180910390fd5b50505050565b6000806000806000806000806000601354601654601454601c60009054906101000a90046001600160a01b0316601154601254601860009054906101000a900460ff166120906000546001600160a01b031690565b601e60009054906101000a90046001600160a01b0316985098509850985098509850985098509850909192939495969798565b60108054610f3290613a90565b6120d8612919565b61194f8282612a95565b60606000600f80546120f390613a90565b80601f016020809104026020016040519081016040528092919081815260200182805461211f90613a90565b801561216c5780601f106121415761010080835404028352916020019161216c565b820191906000526020600020905b81548152906001019060200180831161214f57829003601f168201915b505050505090506000600160ff1b846121859190613b2c565b905060008251116121a557604051806020016040528060008152506121d3565b816121af82612b26565b60106040516020016121c393929190613dcf565b6040516020818303038152906040525b949350505050565b601e546001600160a01b03163314806121fe57506000546001600160a01b031633145b61220757600080fd5b601e546001600160a01b0380831691160361225a5760405162461bcd60e51b8152602060048201526013602482015272416c72656164792073657420746f207468697360681b6044820152606401611131565b601e80546001600160a01b0319166001600160a01b0392909216919091179055565b4284101561229d576040516305787bdf60e01b815260040160405180910390fd5b6122a685612900565b156122c4576040516303e7c1bd60e31b815260040160405180910390fd5b6001600160a01b0386166122eb57604051635461585f60e01b815260040160405180910390fd5b600060016122f76111ec565b6001600160a01b038a81166000818152600e602090815260409182902080546001810190915582517f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98184015280840194909452938d166060840152608083018c905260a083019390935260c08083018b90528151808403909101815260e08301909152805192019190912061190160f01b6101008301526101028201929092526101228101919091526101420160408051601f198184030181528282528051602091820120600084529083018083525260ff871690820152606081018590526080810184905260a0016020604051602081039080840390855afa158015612403573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811615806124385750876001600160a01b0316816001600160a01b031614155b1561245657604051632057875960e21b815260040160405180910390fd5b6001600160a01b0390811660009081526008602090815260408083208a8516808552908352928190208990555188815291928a16917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a350505050505050565b60006001600160a01b0384166124e857604051636edaef2f60e11b815260040160405180910390fd5b6001600160a01b03831661250f57604051634e46966960e11b815260040160405180910390fd5b6001600160a01b0384166000908152600860209081526040808320338452909152902054600019811461256b576125468382613b2c565b6001600160a01b03861660009081526008602090815260408083203384529091529020555b612576858585612b04565b95945050505050565b612587612919565b601061194f8282613c29565b6001600160a01b0383166125ba57604051636edaef2f60e11b815260040160405180910390fd5b6001600160a01b0382166125e157604051634e46966960e11b815260040160405180910390fd5b6000818152600b60205260409020546001600160a01b0384811691161461261a576040516282b42960e81b815260040160405180910390fd5b336001600160a01b0384161480159061265757506001600160a01b0383166000908152600a6020908152604080832033845290915290205460ff16155b801561267a57506000818152600960205260409020546001600160a01b03163314155b15612697576040516282b42960e81b815260040160405180910390fd5b6126a082611047565b156126be57604051635ce7539760e01b815260040160405180910390fd5b6126e983837f0000000000000000000000000000000000000000000000000000000000000000612bb9565b6117b6838383612c75565b6000818152600b60205260409020546001600160a01b031633811480159061274057506001600160a01b0381166000908152600a6020908152604080832033845290915290205460ff16155b1561275d576040516282b42960e81b815260040160405180910390fd5b60008281526009602052604080822080546001600160a01b0319166001600160a01b0387811691821790925591518593918516917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a4505050565b6127c1612919565b6127cc336001612a95565b60006016546013546127de9190613b2c565b905061280e336116eb7f000000000000000000000000000000000000000000000000000000000000000084613af3565b80601660008282546128209190613ae0565b909155505050565b612830612919565b6001600160a01b03811661285a57604051631e4fbdf760e01b815260006004820152602401611131565b611cdb81612a45565b606060008267ffffffffffffffff81111561288057612880613815565b6040519080825280602002602001820160405280156128a9578160200160208202803683370190505b509050835b6128b88486613ae0565b8110156128f8576128ca600182612e4d565b826128d58784613b2c565b815181106128e5576128e5613b88565b60209081029190910101526001016128ae565b509392505050565b6000600160ff1b82118015610f1f575050600019141590565b6000546001600160a01b031633146110a55760405163118cdaa760e01b8152336004820152602401611131565b60007f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60036040516129789190613e0c565b6040805191829003822060208301939093528101919091527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260c00160405160208183030381529060405280519060200120905090565b6001600160a01b038216612a0757604051634e46966960e11b815260040160405180910390fd5b600160ff1b81600554612a1a9190613ae0565b1115612a395760405163303b682f60e01b815260040160405180910390fd5b6117b660008383612b04565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b038216612abc5760405163a41e3d3f60e01b815260040160405180910390fd5b8015612ad057612acb82612eb8565b612ad9565b612ad982612eec565b6001600160a01b03919091166000908152600d60205260409020805460ff1916911515919091179055565b6000601754821115612b1b57612b1b836001612a95565b6121d3848484612f7a565b60606000612b33836132f0565b600101905060008167ffffffffffffffff811115612b5357612b53613815565b6040519080825280601f01601f191660200182016040528015612b7d576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084612b8757509392505050565b6001600160a01b038316612be4578060056000828254612bd99190613ae0565b90915550612c129050565b6001600160a01b03831660009081526007602052604081208054839290612c0c908490613b2c565b90915550505b6001600160a01b03808316600081815260076020526040908190208054850190555190918516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90612c689085815260200190565b60405180910390a3505050565b6001600160a01b03831615612d8057600081815260096020908152604080832080546001600160a01b03191690556001600160a01b0386168352600c90915281208054612cc490600190613b2c565b81548110612cd457612cd4613b88565b90600052602060002001549050818114612d41576000828152600b602052604081205460a01c6001600160a01b0386166000908152600c602052604090208054919250839183908110612d2957612d29613b88565b600091825260209091200155612d3f82826133c8565b505b6001600160a01b0384166000908152600c60205260409020805480612d6857612d68613e18565b60019003818190600052602060002001600090559055505b6001600160a01b03821615612df7576000818152600b6020908152604080832080546001600160a01b0319166001600160a01b038716908101909155808452600c83529083208054600181810183558286529385200185905592529054612df2918391612ded9190613b2c565b6133c8565b612e07565b6000818152600b60205260408120555b80826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b6000612e7183546001600160801b03808216600160801b9092048116919091031690565b8210612e905760405163580821e760e01b815260040160405180910390fd5b5081546001600160801b03908116820116600090815260018301602052604090205492915050565b6001600160a01b0381166000908152600c6020526040812054905b818110156117b657612ee483613434565b600101612ed3565b6001600160a01b038116600090815260076020526040812054612f30907f000000000000000000000000000000000000000000000000000000000000000090613b0a565b90506000612f53836001600160a01b03166000908152600c602052604090205490565b905060005b612f628284613b2c565b81101561203557612f72846134b5565b600101612f58565b6001600160a01b03838116600090815260076020526040808220549285168252812054909190612fab868686612bb9565b6000612fb687611047565b90506000612fc387611047565b9050818015612fcf5750805b6132e25781156130785760006130057f000000000000000000000000000000000000000000000000000000000000000085613b0a565b6001600160a01b038916600090815260076020526040902054613049907f000000000000000000000000000000000000000000000000000000000000000090613b0a565b6130539190613b2c565b905060005b8181101561307157613069896134b5565b600101613058565b50506132e2565b8015613114576001600160a01b0388166000908152600760205260408120546130c2907f000000000000000000000000000000000000000000000000000000000000000090613b0a565b6130ec7f000000000000000000000000000000000000000000000000000000000000000087613b0a565b6130f69190613b2c565b905060005b818110156130715761310c8a613434565b6001016130fb565b60006131407f000000000000000000000000000000000000000000000000000000000000000088613b0a565b905060005b818110156131c3576001600160a01b038a166000908152600c602052604081205461317290600190613b2c565b6001600160a01b038c166000908152600c6020526040812080549293509091839081106131a1576131a1613b88565b906000526020600020015490506131b98c8c83612c75565b5050600101613145565b50807f00000000000000000000000000000000000000000000000000000000000000006132058b6001600160a01b031660009081526007602052604090205490565b61320f9190613b0a565b6132397f000000000000000000000000000000000000000000000000000000000000000088613b0a565b6132439190613b2c565b11156132525761325289613434565b8061327d7f000000000000000000000000000000000000000000000000000000000000000086613b0a565b7f00000000000000000000000000000000000000000000000000000000000000006132bd8b6001600160a01b031660009081526007602052604090205490565b6132c79190613b0a565b6132d19190613b2c565b11156132e0576132e0886134b5565b505b506001979650505050505050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b831061332f5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef8100000000831061335b576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc10000831061337957662386f26fc10000830492506010015b6305f5e1008310613391576305f5e100830492506008015b61271083106133a557612710830492506004015b606483106133b7576064830492506002015b600a8310610f1f5760010192915050565b6000828152600b60205260409020546bffffffffffffffffffffffff82111561340457604051633f2cd0e360e21b815260040160405180910390fd5b6000928352600b60205260409092206001600160a01b039290921660a09190911b6001600160a01b031916019055565b6001600160a01b03811661345b57604051636edaef2f60e11b815260040160405180910390fd5b6001600160a01b0381166000908152600c60205260408120805461348190600190613b2c565b8154811061349157613491613b88565b906000526020600020015490506134aa82600083612c75565b61194f60018261359d565b6001600160a01b0381166134dc57604051634e46966960e11b815260040160405180910390fd5b60006134fc600154600160801b81046001600160801b0390811691161490565b6135115761350a6001613610565b905061355b565b60066000815461352090613b9e565b909155506006546001016135475760405163303b682f60e01b815260040160405180910390fd5b60065461355890600160ff1b613ae0565b90505b6000818152600b60205260409020546001600160a01b031680156135925760405163119b4fd360e11b815260040160405180910390fd5b6117b6818484612c75565b81546001600160801b038082166000190191600160801b90048116908216036135d957604051638acb5f2760e01b815260040160405180910390fd5b6001600160801b0316600081815260018401602052604090209190915581546fffffffffffffffffffffffffffffffff1916179055565b80546000906001600160801b03600160801b8204811691168103613647576040516375e52f4f60e01b815260040160405180910390fd5b600019016001600160801b039081166000818152600185016020526040812080549190558454909216600160801b909102179092555090565b6001600160e01b031981168114611cdb57600080fd5b6000602082840312156136a857600080fd5b81356110dd81613680565b80356001600160a01b03811681146119b857600080fd5b6000602082840312156136dc57600080fd5b6110dd826136b3565b60005b838110156137005781810151838201526020016136e8565b50506000910152565b600081518084526137218160208601602086016136e5565b601f01601f19169290920160200192915050565b6020815260006110dd6020830184613709565b60006020828403121561375a57600080fd5b5035919050565b6000806040838503121561377457600080fd5b61377d836136b3565b946020939093013593505050565b6000806000606084860312156137a057600080fd5b6137a9846136b3565b92506137b7602085016136b3565b9150604084013590509250925092565b600081518084526020808501945080840160005b838110156137f7578151875295820195908201906001016137db565b509495945050505050565b6020815260006110dd60208301846137c7565b634e487b7160e01b600052604160045260246000fd5b600067ffffffffffffffff8084111561384657613846613815565b604051601f8501601f19908116603f0116810190828211818310171561386e5761386e613815565b8160405280935085815286868601111561388757600080fd5b858560208301376000602087830101525050509392505050565b6000602082840312156138b357600080fd5b813567ffffffffffffffff8111156138ca57600080fd5b8201601f810184136138db57600080fd5b6121d38482356020840161382b565b8015158114611cdb57600080fd5b60006020828403121561390a57600080fd5b81356110dd816138ea565b6000806040838503121561392857600080fd5b613931836136b3565b91506020830135613941816138ea565b809150509250929050565b6000806000806080858703121561396257600080fd5b61396b856136b3565b9350613979602086016136b3565b925060408501359150606085013567ffffffffffffffff81111561399c57600080fd5b8501601f810187136139ad57600080fd5b6139bc8782356020840161382b565b91505092959194509250565b600080600080600080600060e0888a0312156139e357600080fd5b6139ec886136b3565b96506139fa602089016136b3565b95506040880135945060608801359350608088013560ff81168114613a1e57600080fd5b9699959850939692959460a0840135945060c09093013592915050565b60008060408385031215613a4e57600080fd5b613a57836136b3565b9150613a65602084016136b3565b90509250929050565b60008060408385031215613a8157600080fd5b50508035926020909101359150565b600181811c90821680613aa457607f821691505b602082108103613ac457634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b80820180821115610f1f57610f1f613aca565b8082028115828204841417610f1f57610f1f613aca565b600082613b2757634e487b7160e01b600052601260045260246000fd5b500490565b81810381811115610f1f57610f1f613aca565b600060208284031215613b5157600080fd5b81516110dd816138ea565b60208082526012908201527113585e081cdd5c1c1b1e481c995858da195960721b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b600060018201613bb057613bb0613aca565b5060010190565b6001600160a01b03831681526040602082018190526000906121d3908301846137c7565b601f8211156117b657600081815260208120601f850160051c81016020861015613c025750805b601f850160051c820191505b81811015613c2157828155600101613c0e565b505050505050565b815167ffffffffffffffff811115613c4357613c43613815565b613c5781613c518454613a90565b84613bdb565b602080601f831160018114613c8c5760008415613c745750858301515b600019600386901b1c1916600185901b178555613c21565b600085815260208120601f198616915b82811015613cbb57888601518255948401946001909101908401613c9c565b5085821015613cd95787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b600060208284031215613cfb57600080fd5b5051919050565b6001600160a01b0385811682528416602082015260408101839052608060608201819052600090613d3590830184613709565b9695505050505050565b600060208284031215613d5157600080fd5b81516110dd81613680565b60008154613d6981613a90565b60018281168015613d815760018114613d9657613dc5565b60ff1984168752821515830287019450613dc5565b8560005260208060002060005b85811015613dbc5781548a820152908401908201613da3565b50505082870194505b5050505092915050565b60008451613de18184602089016136e5565b845190830190613df58183602089016136e5565b613e0181830186613d5c565b979650505050505050565b60006110dd8284613d5c565b634e487b7160e01b600052603160045260246000fdfea26469706673582212203eaef9d534175772d5baee3cc6d7a5eac321fa1d0dbfa94be61b3dea8a83e68c64736f6c63430008130033ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" as Address
