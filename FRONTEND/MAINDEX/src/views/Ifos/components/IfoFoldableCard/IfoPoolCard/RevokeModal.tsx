import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex } from 'uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { WalletIfoData, PublicIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount } from 'utils/formatBalance'
import useConfirmTransaction from 'hooks/useConfirmTransaction'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { tokenSaleAbi } from 'config/abi/tokenSale'
import { getAddress } from 'utils/addressHelpers'
import { usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'
import { TransactionReceipt } from 'viem'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  onSuccess: (amount: BigNumber, txHash: string) => void
  onDismiss?: () => void
}


const RevokeModal: React.FC<Props> = ({
  poolId,
  ifo,
  publicIfoData,
  walletIfoData,
  onDismiss,
  onSuccess,
}) => {
  const userPoolCharacteristics = walletIfoData[poolId]

  const { fgFee } = publicIfoData
  const feeString = `${fgFee.dividedBy(10)}%`
  const { amountTokenCommittedInLP } = userPoolCharacteristics
  const { t } = useTranslation()
  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)
  const client = usePublicClient({chainId: ifo.dex.chainId})


  const { isConfirmed, isConfirming, handleConfirm } = useConfirmTransaction({
    onConfirm: async () => {
   
      const { request } = await simulateContract(config, {
        abi: tokenSaleAbi,
        address: address,
        functionName: 'emergentWithdrawal',
        args: [poolId === PoolIds.poolBasic ? 0n : 1n],
      })
      const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    },
    
    onSuccess: async ({ receipt }) => {
      await onSuccess(amountTokenCommittedInLP, receipt.transactionHash)
      onDismiss()
    },
  })


  return (
    <Modal title={t('Revoke %symbol% Purchase', {symbol: ifo.token.symbol})} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">
       

        <Flex justifyContent="space-between" mb="8px">
          <Text>{t('Revoke')}:</Text>
          <Flex flexGrow={2} justifyContent="flex-end">
            <Image src="/images/tokens/0X73FD77FB26192A3FE4F5EFB9EBA5BB5F6CF96742.png" width={24} height={24}  mr="5px" />
            <Text>{client.chain.nativeCurrency.symbol}</Text>
          </Flex>
        </Flex>
       
        <Flex justifyContent="space-between" mb="16px">
          <Text>{t('%symbol% tokens To Revoke', {symbol: client.chain.nativeCurrency.symbol})}</Text>
          <Text>{getBalanceAmount(amountTokenCommittedInLP, 18).toString()}</Text>
        </Flex>
       
        <Text color="textSubtle" fontSize="12px" mb="24px">
          {t(
            'Revoking will refund you back %symbol% tokens. But you will be charged a Revoke Fee of %fee%.',
              {
                symbol: client.chain.nativeCurrency.symbol,
                fee: feeString,              
              }
          )}
        </Text>
      
        <Button
          onClick={handleConfirm}
          width="100%"
          disabled={isConfirmed || amountTokenCommittedInLP.eq(0)}
        >
          {isConfirming
            ? t('Confirming...')
            : isConfirmed || amountTokenCommittedInLP.eq(0)
            ? t('Revoked!')
            : t('Revoke')}
        </Button>
      </ModalBody>
    </Modal>
  )
}

export default RevokeModal
