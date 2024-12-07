# How to add a Dex

### To be completed in the SDK library
1. In src/constants.ts add *DEXNAME*_CODE_HASH information found on the factory contract
1. in src/utils.ts add the new dex output for the hash to the function at the end
1. Manually increment version in package.json file
1. Build and release a new version of the SDK

### To be completed in the frontend library
1. run Yarn up @FarmageddonFarm/sdk in command prompt to get newest sdk version
1. Add the router and factory contracts to src/config/constants/contracts
1. Get the ABI from the contract and save it in src/config/abi as *DEXNAME*.json
1. Add entry to the src/config/constants/dex.ts for the new dex.
