

check default token list for proper addresses and names

---------------------------------------------------------------------------------------


BELOW IS WHAT WILL NEED TOP BE DONE LAUNCH DAY!

change info info

deploy all contracts - ensure deploy wallet has funds.
        ALWAYS ENSURE TO DELETE ITERABLE MAPPING INFO AND FOLDERS BEFORE DEPLOYING NEW CHAIN
        check settings in deploy script and rpc etc.

    ** 1 - npm run compile                                 -- compile contracts
    2 - yarn hardhat deploy-zksync:libraries            -- deploy the libraries
    3 - npm run compile                                 -- compile contracts
    4 - npx hardhat deploy-zksync --script deployAll.ts -- deploy all stuff

on mswap front end:
    1 - edit contracts file
    2 - add dex to dex.ts ** ( ensure to add at botom )
    ** 3 - confirm default dex on dex.ts
    ** 4 - confirm defaultchainid and defaultchain on chain.ts
    ** 5 - copy tokenlist from mainnet.json file

    create the vUSD - zkCRO pair for top pairs.

make pairs - add top pairs to home page


edit api code and add CHAIN etc info.