/* eslint-disable no-await-in-loop */
import { Flex, Modal, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import ApproveConfirmButtons, { ButtonArrangement } from 'components/ApproveConfirmButtons'
import { ToastDescriptionWithTx } from 'components/Toast'
import contracts from 'config/constants/contracts'
import useToast from 'hooks/useToast'
import { getAddress } from 'utils/addressHelpers'
import { BigNumber } from 'bignumber.js'
import { getFullDisplayBalance } from 'utils/formatBalance'
import styled from 'styled-components'
import { getPublicClient, waitForTransactionReceipt, writeContract, simulateContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { useAccount, useReadContract } from 'wagmi'
import { airDropAbi } from 'config/abi/airDropper'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { TransactionReceipt } from 'viem'
import useRefresh from 'hooks/useRefresh'
import { useGetBnbBalanceTarget } from 'hooks/useTokenBalance'
import { useGasPrice } from 'state/user/hooks'

const BorderContainer = styled.div`
  padding: 16px;
  border: 3px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
  background: ${({ theme }) => theme.colors.background};
`


interface tInfo {
  tDec: number
  tSym: string
  tName: string
}

const ActionPanel: React.FC<{
  onDismiss?: () => void
  tokenAddress: `0x${string}`
  tokenInfo: tInfo
  addresses: string[]
  amounts: number[]
  totalAmount: BigNumber
  howMany: number
  chainId: number
  tBalance: BigNumber
}> = ({ tokenAddress, tokenInfo, addresses, amounts, totalAmount, howMany, chainId, tBalance, onDismiss }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { toastSuccess } = useToast()
  const { slowRefresh } = useRefresh()
  const userBalance = useGetBnbBalanceTarget(account, chainId);
  const gasPrice = useGasPrice()

  const [ isApproved, setIsApproved] = useState(false)
 const {data, isLoading, refetch} = useReadContract({
    abi: ERC20_ABI,
    address: tokenAddress,
    functionName: 'allowance',
    args: [account, getAddress(contracts.aridropper, chainId),],
    chainId,
  })
  useEffect(() => {
    refetch()
  },[slowRefresh])

  useEffect(() => {
    if(data && !isLoading){
      const currentAllowance = new BigNumber(data.toString())
      setIsApproved(currentAllowance.gte(totalAmount.shiftedBy(tokenInfo.tDec)))
    }
  },[data, totalAmount])

  const txCount = Math.ceil(addresses.length / howMany)
  const spender = getAddress(contracts.aridropper, chainId)
  const { isApproving, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      onApprove: async () => {
        const approveAmount = totalAmount.shiftedBy(tokenInfo.tDec).toString()
        const { request } = await simulateContract(config, {
          abi: ERC20_ABI,
          address: tokenAddress,
          functionName: 'approve',
          args: [spender, approveAmount],
          chainId

        })
        const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
      },
      onApproveSuccess: async ({ receipt }) => {
        refetch()
        toastSuccess(
          t('Contract enabled - you can Now Send your AirDrop'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash} />,
        )
      },
      onConfirm: async () => {
        let holdersToSendTo = []
        let amountsToSend = []
        const publicClient = await getPublicClient(config, {chainId})

        let last = 0
        const final = addresses.length
        let start = last
        let end = last + howMany
        end = end > final ? final : end
        const runs = txCount
        let isFinal = !(runs > 1)

        for (let a = 0; a < runs; a++) {
          holdersToSendTo = []
          amountsToSend = []
          for (let i = start; i < end; i++) {
            holdersToSendTo.push(addresses[i])
            amountsToSend.push(new BigNumber(amounts[i]).shiftedBy(tokenInfo.tDec).toFixed(0))
          }
          if (!isFinal) {
                       
            const { request } = await simulateContract(config, {
              abi: airDropAbi,
              address: getAddress(contracts.aridropper, chainId),
              functionName: 'sendAirdrop',
              args: [tokenAddress, holdersToSendTo, amountsToSend],
              chainId,
            })
            
            await writeContract(config, request)
          }
          last = end
          start += howMany
          end += howMany
          end = end > final ? final : end
          if (a === runs - 1) isFinal = true
        }

        const { request } = await simulateContract(config, {
          abi: airDropAbi,
          address: getAddress(contracts.aridropper, chainId),
          functionName: 'sendAirdrop',
          args: [tokenAddress, holdersToSendTo, amountsToSend],
          chainId,
        })

        const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
      },
      onSuccess: async ({ receipt }) => {
        toastSuccess(t('Sent'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
        onDismiss()
      },
    })

    const [ totalGas, setTotalGas] = useState<BigNumber>()

useEffect(() => {
    async function go(){
      try {
    let tGas = new BigNumber(0)
    let holdersToSendTo = []
    let amountsToSend = []
    const publicClient = await getPublicClient(config, {chainId})

    let last = 0
    const final = addresses.length
    let start = last
    let end = last + howMany
    end = end > final ? final : end
    const runs = txCount
    let isFinal = !(runs > 1)

    for (let a = 0; a < runs; a++) {
      holdersToSendTo = []
      amountsToSend = []
      for (let i = start; i < end; i++) {
        holdersToSendTo.push(addresses[i])
        amountsToSend.push(new BigNumber(amounts[i]).shiftedBy(tokenInfo.tDec).toFixed(0))
      }
      if (!isFinal) {
        
        const estimateGas = await publicClient
        .estimateContractGas({
          abi: airDropAbi,
          address: getAddress(contracts.aridropper, chainId),
          functionName: 'sendAirdrop',
          args: [tokenAddress, holdersToSendTo, amountsToSend],
          chainId,
          account
        })
        console.log(estimateGas.toString())
        tGas = new BigNumber(estimateGas.toString()).plus(tGas.toString())
      }
      last = end
      start += howMany
      end += howMany
      end = end > final ? final : end
      if (a === runs - 1) isFinal = true
    }
      const estimateGas = await publicClient
        .estimateContractGas({
          abi: airDropAbi,
          address: getAddress(contracts.aridropper, chainId),
          functionName: 'sendAirdrop',
          args: [tokenAddress, holdersToSendTo, amountsToSend],
          chainId,
          account
      })
      console.log(estimateGas.toString())
      tGas = new BigNumber(estimateGas.toString()).plus(tGas.toString())
      setTotalGas(tGas)
      }catch{
      setTotalGas(undefined)
      }
      console.log(totalGas)
    }
    go()

    },[isApproved])

  const handleDismiss = () => {
    onDismiss()
  }

  const disableBuying =
    !isApproved ||
    isConfirmed ||
    Number.isNaN(new BigNumber(totalAmount.toString()).toNumber()) ||
    addresses.length === 0 ||
    amounts.length !== addresses.length ||
    totalGas === undefined || totalGas === new BigNumber(0) ||
    new BigNumber(userBalance).lt(new BigNumber(totalGas).multipliedBy(gasPrice))

    const notEnoughGas = new BigNumber(userBalance).lt(new BigNumber(totalGas).multipliedBy(gasPrice))

  return (
    <Modal minWidth="346px" title="Approve MultiSender Transactions" onDismiss={handleDismiss} overflow="none">
      <BorderContainer>
        <Flex justifyContent="space-between">
          <Text color="secondary">{t('Token')}:</Text>
          <Text>{`${tokenInfo.tName}`}</Text>
        </Flex>
        <Flex  justifyContent="space-between">
          <Text color="textSubtle">{t(`${tokenInfo.tSym} being sent`)}:</Text>
          <Text>{`${getFullDisplayBalance(totalAmount, 0, 4)}`}</Text>
        </Flex>
        <Flex  justifyContent="space-between">
            <Text color="textSubtle">{t(`${tokenInfo.tSym} balance:`)}</Text>
            <Text>{`${getFullDisplayBalance(tBalance, tokenInfo.tDec, 4)}`}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="textSubtle">{t('How Many Wallets')}:</Text>
          <Text>{`${addresses.length}`}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="textSubtle">{t('Total TXs Needed')}:</Text>
          <Text>{`${txCount}`}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text color={notEnoughGas ? "red" : "textSubtle"}>{t('Gas Req:')}:</Text>
          <Text>{`${new BigNumber(totalGas).multipliedBy(gasPrice).shiftedBy(-18).toFixed(9).toLocaleString('en-US', {
                  maximumFractionDigits: 9,
                })}`}</Text>
        </Flex>
        {totalGas === undefined && isApproved &&
        <Flex justifyContent="space-between">
          <Text color="textSubtle">{t('ERROR')}:</Text>
          <Text color="red">Error in estimating gas.</Text>
        </Flex>
        }
      </BorderContainer>

      <ApproveConfirmButtons
        isApproveDisabled={isApproved}
        isApproving={isApproving}
        isConfirmDisabled={disableBuying}
        isConfirming={isConfirming}
        onApprove={handleApprove}
        onConfirm={handleConfirm}
        buttonArrangement={ButtonArrangement.SEQUENTIAL}
        confirmLabel={t('Send AirDrop')}
        confirmId="airdropping"
      />
    </Modal>
  )
}

export default ActionPanel
