import React, { useState } from 'react'
import styled from 'styled-components'
import { Modal, Text, Button, useTooltip } from '../uikit'
import useTheme from '../hooks/useTheme'
import useToast from '../hooks/useToast'
import { ToastDescriptionWithTx } from './Toast'
import SearchInput from './SearchInput/SearchInput'
import {
  useAccount
} from 'wagmi'
import { nftMarketAbi } from '../config/abi/nftMarket'
import { CHAINID, NFT_MARKETPLACE } from '../config/marketPlace'
import { writeContract, simulateContract, waitForTransactionReceipt } from '@wagmi/core'

import { config } from 'wagmiConfig'

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
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const { toastError, toastSuccess } = useToast()
  const [pendingTx, setPendingTx] = useState(false)

  const TooltipComponent = () => (
    <>
      <Text mb="16px">{'Using this will Add a NFT Collection'}</Text>
      <Text mb="16px">
        
          Adding a collection will add it to the list to allow listing of NFTs for sale.
        
      </Text>
      <Text style={{ fontWeight: 'bold' }}>{'There is no Charge to adding a collection.'}</Text>
    </>
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(<TooltipComponent />, {
    placement: 'bottom',
    tooltipPadding: { right: 15 },
  })

  const [collAddress, setCol] = useState<`0x${string}`>('0x0')
  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
      const { request } = await simulateContract(config, {
        abi: nftMarketAbi,
        address: NFT_MARKETPLACE,
        functionName: 'addCollectionUser',
        args: [collAddress],
        chainId: CHAINID,
      })
      const data = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, {hash: data})
      
      if (receipt.status === 'success') {
        toastSuccess(
          'Added new collection.',
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {'Your Locker will show up on the next Refresh.'}
          </ToastDescriptionWithTx>,
        )
        setPendingTx(false)
        if(onDismiss) onDismiss()
      }
    } catch (error) {
      toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
      setPendingTx(false)
    }
  }

  const handleChangeQueryLP = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCol(event.target.value as `0x${string}`)
  }
 

  return (
    <Modal
      title={'Add NFT Collection'}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {tooltipVisible && tooltip}
      
      <SearchInput onChange={handleChangeQueryLP} placeholder="Enter NFT Address" />
      <Divider />
     

      {account && 
        <Button
          isLoading={pendingTx}
          onClick={handleConfirmClick}
          mb="28px"
          id="ConfirmCreateLPLocker"
        >
          {pendingTx ? 'Confirming' : 'Confirm'}
        </Button>
      }
      

    </Modal>
  )
}

export default CreateModal
