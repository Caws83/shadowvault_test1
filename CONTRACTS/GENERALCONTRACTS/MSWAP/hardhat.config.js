require("@nomiclabs/hardhat-ethers");

module.exports = {
    solidity: {
        version: "0.6.6",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        neonDevnet: {
            //DevNet deployment RPC: https://devnet.neonevm.org | Neon EVM Devnet | Chain ID: 245022926 (0xe9ac0ce) | NEON
            url: "https://neon-mainnet.everstake.one",
            accounts: ["your_private_key"], // Private key
        },
    },
};
