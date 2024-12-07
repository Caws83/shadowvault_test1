import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Card, CardBody, Text, Flex, HelpIcon, Button, AutoRenewIcon, Box, useTooltip, Modal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import SearchInput from 'components/SearchInput/SearchInput'
import { useAccount } from 'wagmi'
import useTheme from 'hooks/useTheme'
import { config } from 'wagmiConfig'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { Address, TransactionReceipt } from 'viem'
import { erc404Token } from 'config/abi/tokens/erc404Token2'
import useToast from 'hooks/useToast'


const StyledCard = styled(Card)`
  min-width: 350px;
`
interface CreateModalProps {
  colAddress: Address
  tokenId: BigInt
  chainId: number
  onDismiss?: () => void
}


const SendNFTModal: React.FC<CreateModalProps> = ({ colAddress, tokenId, chainId, onDismiss }) => {
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
  const { toastError, toastSuccess } = useToast()
  const { theme } = useTheme()


  const TooltipComponent = () => (
      <Text mb="16px">{t('Send the NFT to another wallet.')}</Text>
  )

  const [rAddress, setRAddress] = useState<`0x${string}`>('0x0')
  const handleChangeQueryRecipient = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRAddress(event.target.value as `0x${string}`)
  }


  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom-end',
    tooltipOffset: [20, 10],
  })

  const [pendingTx, setPendingTx] = useState(false)

  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      const { request } = await simulateContract(config, {
        abi: erc404Token,
        address: colAddress,
        functionName: 'transferFrom',
        args: [account, rAddress, tokenId],
        chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(
          t('Sent!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Token Id Transfered')}
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
  const showConnectButton = !account || chain.id !== chainId

  return (
    <Modal
      title={t('Transfer NFT to:')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      <StyledCard>
        <CardBody>
          
          <SearchInput onChange={handleChangeQueryRecipient} placeholder="Enter Recipient Address" />

          <Flex alignItems="center" justifyContent="space-between">
            {!showConnectButton ? (
        <Button
          isLoading={pendingTx}
          disabled={!account}
          endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
          onClick={handleConfirmClick}
          mb="28px"
          id="ConfirmCreatePool"
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      ) : (
        <ConnectWalletButton chain={25} />
      )}
            <Box ref={targetRef}>
              <HelpIcon color="textSubtle" />
            </Box>
          </Flex>
        </CardBody>
      </StyledCard>
      </Modal>
  )
}

export default SendNFTModal
