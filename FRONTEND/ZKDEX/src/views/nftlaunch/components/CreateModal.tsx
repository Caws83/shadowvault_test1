import React, { useState } from 'react'
import styled from 'styled-components'
import { Modal, Text, Flex, Button, AutoRenewIcon, useTooltip } from 'uikit'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { useTranslation } from 'contexts/Localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import hosts from 'config/constants/hosts'
import SearchInput from 'components/SearchInput/SearchInput'
import QuestionHelper from 'components/QuestionHelper'
import {
  useAccount,
  usePublicClient,
} from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import { nftLaunchHostAbi } from 'config/abi/nftLaunchHost'
import contracts from 'config/constants/contracts'

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
  const chainId = chain?.id
  const showConnectButton = !account || chain.id !== chainId
  const { theme } = useTheme()
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{t('This will add your Collection to the Minting Page')}</Text>
      <Text mb="16px">
        {t(
          'Adding your collection to the minting page will allow others to MINT your NFT Collection. Being a MARSWAP Contract is required.',
        )}
      </Text>
      
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  const [lpTokenAddress, setLp] = useState<`0x${string}`>('0x0')
  const [ collectionName, SetColName ] = useState("")
  const [ projectLink, setProjectLink ] = useState("")
  const publicClient = usePublicClient()
  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      const gas = await publicClient.estimateContractGas({
        abi: nftLaunchHostAbi,
        address: getAddress(contracts.nftLaunchHost, chainId),
        functionName: 'addPool',
        args: [lpTokenAddress, collectionName, projectLink],
        chainId,
        account
      })
      const { request } = await simulateContract(config, {
        abi: nftLaunchHostAbi,
        address: getAddress(contracts.nftLaunchHost, chainId),
        functionName: 'addPool',
        args: [lpTokenAddress, collectionName, projectLink],
        gas,
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          t('Sale created'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Check Mint Page.')}
          </ToastDescriptionWithTx>,
        )
        setPendingTx(false)
        onDismiss()
      }
    } catch (error) {
      console.log(error)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      setPendingTx(false)
    }
  }

  const handleChangeQueryCollection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLp(event.target.value as `0x${string}`)
  }
  const handleChangeQueryColName = (event: React.ChangeEvent<HTMLInputElement>) => {
    SetColName(event.target.value)
  }
  const handleChangeQueryWebsite = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectLink(event.target.value)
  }
  

  return (
    <Modal
      title={t('Add NFT for Minting')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      
      <Divider />
      <Flex alignItems="flex-start">
        <Flex flexDirection="row">
          <QuestionHelper
            text={
                <Text>Add this Collection to the Mint Page</Text>
            }
            ml="4px"
          />
          <Text>{t('NFT Collection:')}</Text>
        </Flex>
      </Flex>
      <Flex m="1px" justifyContent="center">
      <SearchInput onChange={handleChangeQueryCollection} placeholder="Enter NFT Address" />
      </Flex>
      <Flex m="1px" justifyContent="center">
      <SearchInput onChange={handleChangeQueryColName} placeholder="Enter Collection Name" />
      </Flex>
      <Flex m="1px" justifyContent="center">
      <SearchInput onChange={handleChangeQueryWebsite} placeholder="Enter project Website" />
      </Flex>
     

      {!showConnectButton ? (
        <Button
          isLoading={pendingTx}
          disabled={
            lpTokenAddress === '0x0'
          }
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          onClick={handleConfirmClick}
          mb="28px"
          mt="14px"
          id="ConfirmCreateSale"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      ) : (
        <ConnectWalletButton chain={chainId}/>
      )}
      
    </Modal>
  )
}

export default CreateModal
