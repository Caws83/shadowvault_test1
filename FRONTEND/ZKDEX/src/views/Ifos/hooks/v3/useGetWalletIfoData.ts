import { useEffect, useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { Ifo, PoolIds } from 'config/constants/types'
import useRefresh from 'hooks/useRefresh'
import { ifoV3Abi } from 'config/abi/ifoV3'
import { getAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { WalletIfoState, WalletIfoData } from '../../types'
import { useAccount } from 'wagmi'
import { readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'

/**
 * Gets all data from an IFO related to a wallet
 */
const useGetWalletIfoData = (ifo: Ifo): WalletIfoData => {
  const { slowRefresh } = useRefresh()
  const [state, setState] = useState<WalletIfoState>({
    poolBasic: {
      amountTokenCommittedInLP: BIG_ZERO,
      offeringAmountInToken: BIG_ZERO,
      refundingAmountInLP: BIG_ZERO,
      taxAmountInLP: BIG_ZERO,
      hasClaimed: false,
      isPendingTx: false,
    },
    poolUnlimited: {
      amountTokenCommittedInLP: BIG_ZERO,
      offeringAmountInToken: BIG_ZERO,
      refundingAmountInLP: BIG_ZERO,
      taxAmountInLP: BIG_ZERO,
      hasClaimed: false,
      isPendingTx: false,
    },
  })

  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)

  const { address: account } = useAccount()

  const setPendingTx = (status: boolean, poolId: PoolIds) =>
    setState((prevState) => ({
      ...prevState,
      [poolId]: {
        ...prevState[poolId],
        isPendingTx: status,
      },
    }))

  const setIsClaimed = (poolId: PoolIds) => {
    setState((prevState) => ({
      ...prevState,
      [poolId]: {
        ...prevState[poolId],
        hasClaimed: true,
      },
    }))
  }

  const fetchIfoData = useCallback(async () => {
  
    const data = await readContracts(config, {
      contracts: [
        {
          abi: ifoV3Abi,
          address,
          functionName: "viewUserInfo",
          args: [account, [0, 1]],
          chainId: ifo.dex.chainId
        },
        {
          abi: ifoV3Abi,
          address,
          functionName: "viewUserOfferingAndRefundingAmountsForPools",
          args: [account, [0, 1]],
          chainId: ifo.dex.chainId
        },

      ]
    })
    const userInfo = data[0].result
    const amounts = data[1].result
if(userInfo && amounts){
    setState((prevState) => ({
      ...prevState,
      poolBasic: {
        ...prevState.poolBasic,
        amountTokenCommittedInLP: new BigNumber(userInfo[0][0].toString()),
        offeringAmountInToken: new BigNumber(amounts[0][0].toString()),
        refundingAmountInLP: new BigNumber(amounts[0][1].toString()),
        taxAmountInLP: new BigNumber(amounts[0][2].toString()),
        hasClaimed: userInfo[1][0],
      },
      poolUnlimited: {
        ...prevState.poolUnlimited,
        amountTokenCommittedInLP: new BigNumber(userInfo[0][1].toString()),
        offeringAmountInToken: new BigNumber(amounts[1][0].toString()),
        refundingAmountInLP: new BigNumber(amounts[1][1].toString()),
        taxAmountInLP: new BigNumber(amounts[1][2].toString()),
        hasClaimed: userInfo[1][1],
      },
    }))
  }
  }, [account, address])

  useEffect(() => {
    if (account) {
      fetchIfoData()
    }
  }, [account, slowRefresh])

  return { ...state, address: addressRaw, setPendingTx, setIsClaimed, fetchIfoData }
}

export default useGetWalletIfoData
