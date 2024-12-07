import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Modal, Text, Flex, Button, Image, BoneIcon } from '../uikit'
import useTheme from '../hooks/useTheme'
import useToast from '../hooks/useToast'
import NumberInput from '../components/NumberInput/NumberInput'
import useMarket from '../hooks/useNftMarket'
import { nftCollectionAbi } from '../config/abi/nftCollection'
import { NATIVESYMBOL, NFT_MARKETPLACE } from '../config/marketPlace'
import useRefresh from 'hooks/useRefresh'
import { Address } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

interface CreateModalProps {
  collectionAddress: Address
  nftId:  bigint
  chainId: number
  image: string
  type: number
  askPrice: bigint
  onDismiss?: () => void
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const SellModal: React.FC<CreateModalProps> = ({ collectionAddress, nftId, chainId, image, type, askPrice, onDismiss }) => {
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const { toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const [pendingTx2, setPendingTx2] = useState(false)

  const [ sellPrice, setSellPrice] = useState(new BigNumber(askPrice.toString()).shiftedBy(-18).toFixed(2))
  const { nftSell, nftApprove, nftModify, nftCancel } = useMarket(collectionAddress, chainId)
  const [isApprove, setApprove] = useState(false)
  
const {data,isLoading,refetch} = useReadContracts({
  contracts: [
    {
      address: collectionAddress,
      abi: nftCollectionAbi,
      functionName: "getApproved",
      args: [nftId],
    },
    {
      address: collectionAddress,
      abi: nftCollectionAbi,
      functionName: "isApprovedForAll",
      args: [account ?? "0x0", NFT_MARKETPLACE],
    },
  ],
})

useEffect(() => {
  if(data && !isLoading){
    const single = data[0].result === NFT_MARKETPLACE
    const all = data[1].result as boolean ?? false
    const isApproved = single || all
    setApprove(isApproved)
  }
},[data])

const { slowRefresh } = useRefresh()

useEffect(() => {
    refetch()
},[slowRefresh])



  const handleConfirmClick = async () => {
    setPendingTx(true)
    try {
    const actualSellPrice = new BigNumber(sellPrice).shiftedBy(18).toString()
    if(!isApprove && type === 2){
      nftApprove()
    } else if(type === 1) {
      nftModify(nftId, BigInt(actualSellPrice))
    }else {
      nftSell(nftId, BigInt(actualSellPrice))
    }
    setPendingTx(false)
    } catch (error) {
      toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
      setPendingTx(false)
    }
    if(onDismiss) onDismiss()
  }

  const handleCancelClick = async () => {
    setPendingTx2(true)
    try {
    
    nftCancel(nftId)
    
    setPendingTx2(false)
    } catch (error) {
      toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
      setPendingTx2(false)
    }
    if(onDismiss) onDismiss()
  }

  const handleChangeQueryPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSellPrice(event.target.value)
  }

  return (
    <Modal
      title={type === 2 ? 'Create New Sale' : 'Modify Ask Price'}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
     
        <Text fontSize="12px" color="secondary" textTransform="uppercase" bold>
          {'Set Price'}
        </Text>
        
      <Flex alignItems="center" >
        <BoneIcon />
        <Text fontWeight="600">
          {(new BigNumber(askPrice.toString()).shiftedBy(-18).toNumber()).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 5,
          })}
        </Text>
      </Flex>

      <Flex justifyContent="center" alignItems="center" >
        <Image alt={"example"} src={image} width={150} height={150} mb="8px" />
      </Flex>
      <Flex flexDirection="row" alignItems="center">
        <NumberInput onChange={handleChangeQueryPrice} placeholder="Asking Price" startingNumber={sellPrice} />
        <Text>{`:  ${NATIVESYMBOL}`}</Text>
      </Flex>
      <Divider />
      
      
      {account &&
        <Button
          isLoading={pendingTx}
          onClick={handleConfirmClick}
          mb="28px"
          id="confirmNewSales"
        >
          {pendingTx ? 'Tx Pending ....' : type === 1 ? 'Modify Ask' : !isApprove ? 'Approve' : 'Confirm'}
        </Button>
        }
        {account && type === 1 &&
        <Button
          isLoading={pendingTx2}
          onClick={handleCancelClick}
          mb="28px"
          id="confirmNewSales"
        >
          {pendingTx2 ? 'Tx Pending ....' : 'Cancel Sale'}
        </Button>
        }
     
    </Modal>
  )
}

export default SellModal
