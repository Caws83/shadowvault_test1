import React from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Link, useModal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import useToast from 'hooks/useToast'
import { ToastDescriptionWithTx } from 'components/Toast'
import ContributeModal from './ContributeModal'
import { useChainId } from 'wagmi'
import useConfirmTransaction from 'hooks/useConfirmTransaction'
import { config } from 'wagmiConfig'
import { lanchManagerAbi } from 'config/abi/launchManager'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { Scale, Variant } from 'uikit/components/Button/types'
import CollectModal from './CollectModal'
import { useState } from 'react'

export interface userData {
  user: string
  amount: bigint
  collected: boolean
}

interface Props {
  poolId: number
  chainId: number
  isFinished: boolean
  canFinalize: boolean
  account?: string
  userData?: userData
  outToken: string
  variantType: Variant
  variantSize: Scale
}
const ContributeButton: React.FC<Props> = ({ poolId, chainId, isFinished, canFinalize, account, userData, outToken, variantType, variantSize }) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { balance: userCurrencyBalanceRaw } = useGetBnbBalance(chainId)
  const userCurrencyBalance = new BigNumber(userCurrencyBalanceRaw.toString())
  const [txHash, setTxHash] = useState('')
  const connectedChainId = useChainId()
  

  const canCollect = userData && account && !userData[2] && userData[1] > 0n && isFinished

  // Refetch all the data, and display a message when fetching is done
  const handleContributeSuccess = async (amount: BigNumber, txHash: string) => {
   /* toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have contributed %amount% %symbol% tokens to this Sale!', {
          amount: getBalanceNumber(amount),
          symbol: client.chain.nativeCurrency.symbol
        })}
      </ToastDescriptionWithTx>,
    )*/
  }
  const handleFinalizeSuccess = async (txHash: string) => {
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have finalized the Sale.')}
      </ToastDescriptionWithTx>,
    )
  }
  const handleCollectSuccess = async (txHash: string) => {
    toastSuccess(
      t('Success!'),
      <ToastDescriptionWithTx txHash={txHash}>
        {t('You have Collected your tokens.')}
      </ToastDescriptionWithTx>,
    )
  }

  const { handleConfirm } = useConfirmTransaction({
    onConfirm: async () => {
      try {
      const { request } = await simulateContract(config, {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'finalizeRound',
        args: [poolId],
        chainId
      })
      const hash = await writeContract(config, request)
      return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    } catch (e) {
      console.log(e)
    }
    },
    
    onSuccess: async ({ receipt }) => {
      await handleCollectSuccess(receipt.transactionHash)
    },
  })

  const { handleConfirm: handleCollect } = useConfirmTransaction({
    onConfirm: async () => {
      try {
      const { request } = await simulateContract(config, {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'collect',
        args: [poolId],
        chainId
      })
      const hash = await writeContract(config, request)
      return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    } catch (e) {
      console.log(e)
    }
    },
    
    onSuccess: async ({ receipt }) => {
      setTxHash(receipt.transactionHash)
      await onPresentCollectModal()
    },
  })

  const [onPresentCollectModal] = useModal(
    <CollectModal
      txHash={txHash}
      chainId={chainId} />,
    false,
  )

  const [onPresentContributeModal] = useModal(
    <ContributeModal
      poolId={poolId}
      onSuccess={handleContributeSuccess}
      userCurrencyBalance={userCurrencyBalance}
      chainId={chainId}   />,
    false,
  )

  const isDisabled = (!canCollect && isFinished) || (chainId !== connectedChainId)

  return (
    <Flex justifyContent="center" alignItems="center" mt="10px" mb="10px">
      {isDisabled ? (
        <Link href={`/#/swap?outputToken=${outToken}`} p="4px">
              <Button style={{textDecoration: "none"}}  scale={variantSize} variant={'primary'} disabled={!account || (chainId !== connectedChainId)}>
                {t('Swap')}
              </Button>
        </Link>
      ): (
      <Button 
        onClick={canCollect ? handleCollect : canFinalize ? handleConfirm : onPresentContributeModal} 
        scale={variantSize}
        disabled={!account || isDisabled}
        variant={variantType}
      >
      {canCollect ? t('Collect') : canFinalize ? t(`Finalize`) : t('Purchase') }
    </Button>
      )}
    </Flex>
  )
}

export default ContributeButton
