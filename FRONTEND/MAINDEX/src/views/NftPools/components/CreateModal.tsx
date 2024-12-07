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
import SearchInput from 'components/SearchInput/SearchInput'
import QuestionHelper from 'components/QuestionHelper'
import {
  useReadContract,
  useAccount
} from 'wagmi'
import { simulateContract, writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { TransactionReceipt } from 'viem'
import { nftPoolFactoryAbi } from 'config/abi/nftPoolFactory'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI'

interface CreateModalProps {
  onDismiss?: () => void
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const CreateModal: React.FC<CreateModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const chainId = chain.id
  const showConnectButton = !account 
  const { theme } = useTheme()
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const { balance: balanceRaw } = useGetBnbBalance(chainId)
  const balance = new BigNumber(balanceRaw.toString())
  const [fee, setFee] = useState(new BigNumber(0))
  const isOwner = account === getAddress(contracts.farmWallet, chainId)


      const {data} = useReadContract({
        abi: nftPoolFactoryAbi,
        address: getAddress(contracts.nftPoolFactoryV3, chainId),
        functionName: 'subFee',
        chainId
      })
   
      useEffect(() => {
        if(data) setFee(new BigNumber(data.toString()))
      },[data])
  


  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('Use this to create a new NFT Staking Pool!')}</Text>
      <Text mb="16px">{t('Creating a NFT staking pool will add it to the list below.')}</Text>
      <Text style={{ fontWeight: 'bold' }}>
        {t('The cost to create a pool is: %fee% %native%.', { fee: parseFloat(fee.shiftedBy(-18).toFixed(6)), native: chain.nativeCurrency.symbol })}
      </Text>
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  const [stakingToken, setStake] = useState<`0x${string}`>('0x0')
  const [earningToken, setEarn] = useState<`0x${string}`>('0x0')

  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      const cost = fee
      const { request } = await simulateContract(config, {
        abi: nftPoolFactoryAbi,
        address: getAddress(contracts.nftPoolFactoryV3, chainId),
        functionName: isOwner ? 'createNFTPoolAdmin' : 'createNFTPool',
        args: [stakingToken, earningToken],
        value: isOwner ? BigInt(0) : cost,
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          t('Pool created'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('See Manager Tab in the created pool.')}
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

  const [stakeIsToken, setStakeIsToken] = useState(false)
  const [earnIsToken, setEarnIsToken] = useState(false)

  const isToken = async (tAddress) => {
    try {
      const dec = await readContract(config, { abi: ERC20_ABI, address: tAddress, functionName: 'decimals', chainId })
      if (new BigNumber(dec.toString()).gt(0)) return true
      return false
    } catch {
      return false
    }
  }
  const isNFT = async (tAddress) => {
    try {
      await readContract(config, { abi: nftCollectionAbi, address: tAddress, functionName: 'supportsInterface', args: ["0x80ac58cd"], chainId })
      return true
    } catch {
      return false
    }
  }

  const handleChangeQueryStake = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setStake(event.target.value as `0x${string}`)
    setStakeIsToken(await isNFT(event.target.value))
  }
  const handleChangeQueryEarn = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setEarn(event.target.value as `0x${string}`)
    setEarnIsToken(await isToken(event.target.value))
  }

  return (
    <Modal
      title={t('Create NEW Staking Pool')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      <Flex flexDirection="column">
        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Text>{t('%native% Balance:', {native: chain.nativeCurrency.name})}</Text>
          <Balance bold value={balance.shiftedBy(-18).toNumber()} decimals={2} unit={` ${chain.nativeCurrency.symbol}`} />
        </Flex>
        <Flex alignItems="flex-start" justifyContent="space-between" flexDirection="row">
          <Text>{t('Creation Fee:')}</Text>
          <Balance bold value={fee.shiftedBy(-18).toNumber()} decimals={2} unit={` ${chain.nativeCurrency.symbol}`} />
        </Flex>
        <Flex flexDirection="row">
          <Text fontSize="12px" color="secondary">
            Sufficent Balance:
          </Text>
          <Text fontSize="12px" color={new BigNumber(balance).gt(fee) ? 'success' : 'warning'}>{`:  ${new BigNumber(
            balance,
          ).gt(fee)}`}</Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex alignItems="flex-start">
        <Flex flexDirection="row">
          <QuestionHelper
            text={
              <>
                <Text>Token address for the staking token.</Text>
              </>
            }
            ml="4px"
          />
          <Text>{t('Staking Token:')}</Text>
        </Flex>
      </Flex>
      <SearchInput onChange={handleChangeQueryStake} placeholder="Enter stake token address" />
      <Flex flexDirection="row">
        <Text fontSize="12px" color="secondary">
          NFT confirmed
        </Text>
        <Text fontSize="12px" color={stakeIsToken ? 'success' : 'warning'}>{`:  ${stakeIsToken}`}</Text>
      </Flex>
      <Divider />
      <Flex alignItems="flex-start">
        <Flex flexDirection="row">
          <QuestionHelper
            text={
              <>
                <Text>Reward token address.</Text>
                <Text>After creating pool you will</Text>
                <Text>need to send tokens to the pool.</Text>
                <Text>Find pool in finished area and</Text>
                <Text>enter manager tab for more info.</Text>
              </>
            }
            ml="4px"
          />
          <Text>{t('Reward Token:')}</Text>
        </Flex>
      </Flex>
      <SearchInput onChange={handleChangeQueryEarn} placeholder="Enter reward token address" />
      <Flex flexDirection="row">
        <Text fontSize="12px" color="secondary">
          Token confirmed
        </Text>
        <Text fontSize="12px" color={earnIsToken ? 'success' : 'warning'}>{`:  ${earnIsToken}`}</Text>
      </Flex>
      <Divider />
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Text>Your pool will show up in the </Text>
        <Text color="warning">Community pools section. Under Finished.</Text>
      </Flex>

      {!showConnectButton ? (
        <Button
          isLoading={pendingTx}
          disabled={new BigNumber(balance).lt(fee) || !stakeIsToken || !earnIsToken}
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          onClick={handleConfirmClick}
          mb="28px"
          id="ConfirmCreatePool"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      ) : (
        <ConnectWalletButton chain={chainId} />
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
