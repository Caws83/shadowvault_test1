import { readContract } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import { cakeVaultAbi } from 'config/abi/cakeVault'
import { getCakeVaultAddress } from 'utils/addressHelpers'
import { config } from 'wagmiConfig'

const fetchVaultUser = async (account: `0x${string}`) => {
  try {
    const userContractResponse = await readContract(config, {
      abi: cakeVaultAbi,
      address: getCakeVaultAddress(),
      functionName: 'userInfo',
      args: [account],
      chainId: 109,
    })

    return {
      isLoading: false,
      userShares: new BigNumber(userContractResponse[0].toString()).toJSON(),
      lastDepositedTime: new BigNumber(userContractResponse[1].toString()).toJSON(),
      lastUserActionTime: new BigNumber(userContractResponse[3].toString()).toJSON(),
      cakeAtLastUserAction: new BigNumber(userContractResponse[2].toString()).toJSON(),
    }
  } catch (error) {
    return {
      isLoading: true,
      userShares: '0',
      lastDepositedTime: '0',
      lastUserActionTime: '0',
      cakeAtLastUserAction: '0',
    }
  }
}

export default fetchVaultUser
