import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Modal, Text, Flex, Button, HelpIcon, AutoRenewIcon, useTooltip } from 'uikit'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { useTranslation } from 'contexts/Localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import Balance from 'components/Balance'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import hosts from 'config/constants/hosts'
import SearchInput from 'components/SearchInput/SearchInput'
import NumberInput from 'components/NumberInput/NumberInput'
import QuestionHelper from 'components/QuestionHelper'
import {
  useReadContract,
  useAccount,
  usePublicClient,
} from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import { Host } from 'config/constants/types'

interface CreateModalProps {
  host: Host
  onDismiss?: () => void
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const CreateModal: React.FC<CreateModalProps> = ({ onDismiss, host }) => {
  const { t } = useTranslation()
  const { address: account, chainId } = useAccount()
 
  const showConnectButton = !account || chainId !== host.chainId
  const { theme } = useTheme()
  const { toastError, toastSuccess } = useToast()
  // const LockerChefContract = getMasterChefFromHost(hosts.locker, library.getSigner())
  const [pendingTx, setPendingTx] = useState(false)
  // const { callWithGasPrice } = useCallWithGasPrice()
  const { balance } = useGetBnbBalance(host.chainId)
  const [fee, setFee] = useState(new BigNumber(0))

  
      const {data, isLoading} = useReadContract({
        abi: host.chefAbi,
        address: getAddress(host.masterChef, host.chainId),
        functionName: 'lockFee',
        chainId: host.chainId
      })
      useEffect(() => {
        if(data && !isLoading) setFee(new BigNumber(data.toString()))
      },[data])
      


  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('Use this to Create a New LP Locker!')}</Text>
      <Text mb="16px">
        {t(
          'Creating an LP Locker will add it to the list Below. On the first Deposit you will start the Lock Time.  Creator of LP Locker can also Extend the Lock Time. All LP deposited is subject to the lock.',
        )}
      </Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('The Cost to Create a locker is: %fee% zkCRO, Then %fee% zkCRO on first Deposit.', {
          fee: fee.shiftedBy(-18).toFixed(0),
        })}
      </Text>
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  const [lpTokenAddress, setLp] = useState<`0x${string}`>('0x0')
  const [lockLength, setLength] = useState(90n * 86400n)
  const publicClient = usePublicClient()
  const nativeSymbol = publicClient.chain.nativeCurrency.symbol
  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      const cost = fee
      const gas = await publicClient.estimateContractGas({
        abi: host.chefAbi,
        address: getAddress(host.masterChef, host.chainId),
        functionName: 'add',
        args: [lpTokenAddress, lockLength],
        value: cost,
        chainId: host.chainId,
        account
      })
      const { request } = await simulateContract(config, {
        abi: host.chefAbi,
        address: getAddress(host.masterChef, host.chainId),
        functionName: 'add',
        args: [lpTokenAddress, lockLength],
        gas,
        value: cost,
        chainId: host.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          t('Locker created'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your Locker will show up on the next Refresh.')}
          </ToastDescriptionWithTx>,
        )
        setPendingTx(false)
        onDismiss()
      }
    } catch (error) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
    }
  }

  const handleChangeQueryLP = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLp(event.target.value as `0x${string}`)
  }
  const handleChangeQueryLength = (event: React.ChangeEvent<HTMLInputElement>) => {
    const days = new BigNumber(event.target.value)
    const epochDays = days.multipliedBy(86400).toNumber()
    setLength(BigInt(epochDays))
  }

  return (
    <Modal
      title={t('Create NEW LP Locker')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      <Flex flexDirection="column">
        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Text>{t('%symbol% Balance:', {symbol: nativeSymbol })}</Text>
          <Balance bold value={new BigNumber(balance.toString()).shiftedBy(-18).toNumber()} decimals={2} unit={`${nativeSymbol}`} />
        </Flex>
        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Text>{t('Creation Fee:')}</Text>
          <Balance bold value={fee.shiftedBy(-18).toNumber()} decimals={2} unit={`${nativeSymbol}`} />
        </Flex>
      </Flex>
      <Divider />
      <Flex alignItems="flex-start">
        <Flex flexDirection="row">
          <QuestionHelper
            text={
              <>
                <Text>This is the LP Token Address</Text>
                <Text>NOT the token. You can find</Text>
                <Text>This using our analytics page.</Text>
                <Text>Or sometimes on your tokens</Text>
                <Text>READ functions. ie: SwapPair.</Text>
              </>
            }
            ml="4px"
          />
          <Text>{t('Lp Token:')}</Text>
        </Flex>
      </Flex>
      <SearchInput onChange={handleChangeQueryLP} placeholder="Enter LP Token Address" />
      <Divider />
      <Flex alignItems="flex-start">
        <Flex flexDirection="row">
          <QuestionHelper
            text={
              <>
                <Text>How many days to lock your LP.</Text>
                <Text>This can be extended by the</Text>
                <Text>original creator of the lock.</Text>
                <Text>Actual lock period, will not</Text>
                <Text>start until the initial deposit.</Text>
              </>
            }
            ml="4px"
          />
          <Text>{t('How Many Days to Lock:')}</Text>
        </Flex>
      </Flex>
      <NumberInput onChange={handleChangeQueryLength} placeholder="Days to Lock For" />
      <Divider />
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Text>Your Locker will Show in the</Text>
        <Text color="warning">Your Locker will Show in the Unlocked!!</Text>
      </Flex>

      {!showConnectButton ? (
        <Button
          isLoading={pendingTx}
          disabled={
            new BigNumber(balance.toString()).lt(fee) ||
            lpTokenAddress === '0x0' ||
            lockLength < 30 * 86400 ||
            Number.isNaN(lockLength)
          }
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          onClick={handleConfirmClick}
          mb="28px"
          id="ConfirmCreateLPLocker"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      ) : (
        <ConnectWalletButton chain={host.chainId}/>
      )}
      <Flex justifyContent="center" alignItems="center">
        <Text fontSize="16px" bold color="textSubtle" mr="4px">
          {t('What’s this?')}
        </Text>
        <span ref={targetRef}>
          <HelpIcon color="textSubtle" />
        </span>
      </Flex>
    </Modal>
  )
}

export default CreateModal
