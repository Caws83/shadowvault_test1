import React, { useCallback, useState } from 'react'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { Game } from 'state/types'
import { getAddress } from 'utils/addressHelpers'
import { useAppDispatch } from 'state'
import { updateGameUserApproval } from 'state/games'
import {
  useAccount,
  usePublicClient,
} from 'wagmi'
import { TransactionReceipt, maxUint256 } from 'viem'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

export const useCoinFlipApprove = (game: Game) => {
  const [requestedCoinFlipApproval, setRequestedCoinFlipApproval] = useState(false)
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  const { toastSuccess, toastError } = useToast()
  const publicClient = usePublicClient({chainId: game.chainId})

  const handleCoinFlipApprove = useCallback(async () => {
    try {
      setRequestedCoinFlipApproval(true)
      const gas = await publicClient.estimateContractGas({
        abi: ERC20_ABI,
        address: getAddress(game.payToken.address, game.chainId),
        functionName: 'approve',
        args: [getAddress(game.contractAddress, game.chainId), maxUint256],
        account
      })
      const { request } = await simulateContract(config, {
        abi: ERC20_ABI,
        address: getAddress(game.payToken.address, game.chainId),
        functionName: 'approve',
        args: [getAddress(game.contractAddress, game.chainId), maxUint256],
        gas,
      })
      const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      dispatch(updateGameUserApproval(game.GameId, account))
      if (receipt.status === 'success') {
        toastSuccess(
          t('Contract Enabled'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You can now Play the Game')}
          </ToastDescriptionWithTx>,
        )
        setRequestedCoinFlipApproval(false)
      } else {
        // user rejected tx or didn't go thru
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        setRequestedCoinFlipApproval(false)
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
    // eslint-disable-next-line
  }, [account, game.GameId])

  return { handleCoinFlipApprove, requestedCoinFlipApproval }
}
