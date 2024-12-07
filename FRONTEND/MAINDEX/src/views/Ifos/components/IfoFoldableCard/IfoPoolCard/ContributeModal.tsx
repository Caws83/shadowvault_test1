import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex } from 'uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { WalletIfoData, PublicIfoData } from 'views/Ifos/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount } from 'utils/formatBalance'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import useConfirmTransaction from 'hooks/useConfirmTransaction'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { ifoV2Abi } from 'config/abi/ifoV2'
import { getAddress } from 'utils/addressHelpers'
import { usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'
import { TransactionReceipt } from 'viem'
import hosts from 'config/constants/hosts'
import tokens from 'config/constants/tokens'
import { TokenImage } from 'components/TokenImage'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  userCurrencyBalance: BigNumber
  onSuccess: (amount: BigNumber, txHash: string) => void
  onDismiss?: () => void
}

const multiplierValues = [0.1, 0.25, 0.5, 0.75, 1]

const ContributeModal: React.FC<Props> = ({
  poolId,
  ifo,
  publicIfoData,
  walletIfoData,
  userCurrencyBalance,
  onDismiss,
  onSuccess,
}) => {
  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]

  const { limitPerUserInLP, totalAmountPool, raisingAmountPool } = publicPoolCharacteristics
  const { amountTokenCommittedInLP } = userPoolCharacteristics
  const [value, setValue] = useState('')
  const { t } = useTranslation()
  const valueWithTokenDecimals = new BigNumber(value).times(new BigNumber(DEFAULT_TOKEN_DECIMAL.toString()))
  const atMax = totalAmountPool.gte(raisingAmountPool)
  const leftToCommit = raisingAmountPool.minus(totalAmountPool)
  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)
  const client = usePublicClient({chainId: ifo.dex.chainId})


  const { isConfirmed, isConfirming, handleConfirm } = useConfirmTransaction({
    onConfirm: async () => {
   
      const { request } = await simulateContract(config, {
        abi: ifoV2Abi,
        address: address,
        functionName: 'depositPool',
        args: [poolId === PoolIds.poolBasic ? 0n : 1n],
        value: valueWithTokenDecimals
      })
      const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    },
    
    onSuccess: async ({ receipt }) => {
      await onSuccess(valueWithTokenDecimals, receipt.transactionHash)
      onDismiss()
    },
  })

  const maximumLpCommitable = (() => {
    const maxAmount = leftToCommit.lt(userCurrencyBalance) ? leftToCommit : userCurrencyBalance

    if (limitPerUserInLP.isGreaterThan(0)) {
      return limitPerUserInLP.minus(amountTokenCommittedInLP).isLessThanOrEqualTo(maxAmount)
        ? limitPerUserInLP
        : maxAmount
    }
    return maxAmount
  })()

  return (
    <Modal title={t('Contribute %symbol%', {symbol: client.chain.nativeCurrency.symbol})} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">
        {limitPerUserInLP.isGreaterThan(0) && (
          <Flex justifyContent="space-between" mb="16px">
            <Text>{t('Max. %symbol% token entry', {symbol: client.chain.nativeCurrency.symbol})}</Text>
            <Text>{getBalanceAmount(limitPerUserInLP, 18).toString()}</Text>
          </Flex>
        )}

        <Flex justifyContent="space-between" mb="8px">
          <Text>{t('Commit')}:</Text>
          <Flex flexGrow={1} justifyContent="flex-end">
            <TokenImage token={tokens.wNative} host={hosts.marswap} chainId={ifo.dex.chainId} height={25} width={25} mr="5px" />
            <Text>{client.chain.nativeCurrency.symbol}</Text>
          </Flex>
        </Flex>
        <BalanceInput
          value={value}
          currencyValue={publicIfoData.currencyPriceInUSD.times(value || 0).toFixed(2)}
          onUserInput={setValue}
          isWarning={valueWithTokenDecimals.isGreaterThan(maximumLpCommitable)}
          decimals={18}
          mb="8px"
        />
        <Text color="textSubtle" textAlign="right" fontSize="12px" mb="16px">
          {t('Balance: %balance%', {
            balance: getBalanceAmount(userCurrencyBalance, 18).toString(),
          })}
        </Text>
        {!atMax && (
          <Text color="textSubtle" textAlign="right" fontSize="12px" mb="16px">
            {`Max: ${leftToCommit.shiftedBy(-18)} ${client.chain.nativeCurrency.symbol}`}
          </Text>
        )}
        <Flex justifyContent="space-between" mb="16px">
          {multiplierValues.map((multiplierValue, index) => (
            <Button
              key={multiplierValue}
              scale="xs"
              variant="tertiary"
              onClick={() => setValue(getBalanceAmount(maximumLpCommitable.times(multiplierValue)).toString())}
              mr={index < multiplierValues.length - 1 ? '8px' : 0}
            >
              {multiplierValue * 100}%
            </Button>
          ))}
        </Flex>
      
        <Button
          onClick={handleConfirm}
          width="100%"
          disabled={isConfirmed || valueWithTokenDecimals.isNaN() || valueWithTokenDecimals.eq(0)}
        >
          {isConfirming
            ? t('Confirming...')
            : isConfirmed || valueWithTokenDecimals.isNaN() || valueWithTokenDecimals.eq(0)
            ? t('Max. Committed')
            : t('Buy Tokens')}
        </Button>
      </ModalBody>
    </Modal>
  )
}

export default ContributeModal
