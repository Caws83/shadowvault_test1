import React from 'react'
import { AutoRenewIcon, Button, Flex } from 'uikit'
import { Ifo, PoolIds } from 'config/constants/types'
import { WalletIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import { tokenSaleAbi } from 'config/abi/tokenSale'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import { config } from 'wagmiConfig'

interface Props {
  poolId: PoolIds
  walletIfoData: WalletIfoData
  isRefund: boolean
  ifo: Ifo
}

const ClaimButton: React.FC<Props> = ({ poolId, walletIfoData, isRefund, ifo }) => {
  const userPoolCharacteristics = walletIfoData[poolId]
  const chainId = ifo.dex.chainId
  const { t } = useTranslation()
  const { toastError, toastSuccess } = useToast()

  const setPendingTx = (isPending: boolean) => walletIfoData.setPendingTx(isPending, poolId)

  const handleClaim = async () => {
    try {
      setPendingTx(true)
      const { request } = await simulateContract(config, {
        abi: tokenSaleAbi,
        address: getAddress(ifo.address, chainId),
        functionName: 'harvestPool',
        args: [poolId === PoolIds.poolBasic ? 0n : 1n],
        chainId
      })
      const data = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, {hash: data})
      const txHash = receipt.transactionHash

      walletIfoData.setIsClaimed(poolId)
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={txHash}>
          {t('You have successfully claimed your rewards.')}
        </ToastDescriptionWithTx>,
      )
    } catch (error) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      console.error(error)
    } finally {
      setPendingTx(false)
    }
  }

  const handleRefund = async () => {
    try {
      setPendingTx(true)

      const { request } = await simulateContract(config, {
        abi: tokenSaleAbi,
        address: getAddress(ifo.address, chainId),
        functionName: 'ReclaimFunds',
        args: [poolId === PoolIds.poolBasic ? 0 : 1],
        chainId
      })
      const data = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, {hash: data})
      const txHash = receipt.transactionHash

      walletIfoData.setIsClaimed(poolId)
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={txHash}>
          {t('You have successfully Withdrawn your refund.')}
        </ToastDescriptionWithTx>,
      )
    } catch (error) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      console.error(error)
    } finally {
      setPendingTx(false)
    }
  }

  return (
    <Flex justifyContent="center" alignItems="center" m="8px">
    <Button
      onClick={!isRefund ? handleClaim : handleRefund}
      disabled={userPoolCharacteristics.isPendingTx}
      width="75%"
      isLoading={userPoolCharacteristics.isPendingTx}
      endIcon={userPoolCharacteristics.isPendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
    >
      {!isRefund ? t('Claim Tokens') : t('Claim Refund')}
    </Button>
    </Flex>
  )
}

export default ClaimButton
