export const migratorAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_bnbAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
				"name": "_origRouter",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_newRouter",
				"type": "address"
			}
		],
		"name": "migrate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const