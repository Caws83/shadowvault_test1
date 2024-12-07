import React, { useState } from 'react'
import { Modal, ModalBody, Text, Button, Flex } from 'uikit'
import { Ifo } from 'config/constants/types'
import { useTranslation } from 'contexts/Localization'
import useConfirmTransaction from 'hooks/useConfirmTransaction'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { tokenSaleAbi } from 'config/abi/tokenSale'
import { getAddress } from 'utils/addressHelpers'
import { useChainId, usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'
import { TransactionReceipt } from 'viem'
import SearchInput from 'components/SearchInput'
import { TokenImageIFO } from 'components/TokenImage'
import { PublicIfoData } from 'views/Ifos/types'

interface Props {
  ifo: Ifo
  publicIfoData: PublicIfoData
  onSuccess: (txHash: string) => void
  onDismiss?: () => void
}


const AddLinksModal: React.FC<Props> = ({
  ifo,
  publicIfoData,
  onDismiss,
  onSuccess,
}) => {

  const { t } = useTranslation()
  const currentChain = useChainId()
  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)
  const client = usePublicClient({chainId: ifo.dex.chainId})
  const [logo, setLogo] = useState('')
  const [website, setWeb] = useState('')
  const [banner, setBanner] = useState('')
  const [telegram, setTG] = useState('')
  const [twitter, setTwitter] = useState('')

  const handleChangeQueryLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setLogo(value)
  }
  const handleChangeQueryWeb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setWeb(value)
  }
  const handleChangeQueryBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setBanner(value)
  }
  const handleChangeQueryTG = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setTG(value)
  }
  const handleChangeQueryX = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setTwitter(value)
  }


  const { isConfirmed, isConfirming, handleConfirm } = useConfirmTransaction({
    onConfirm: async () => {
   
      const { request } = await simulateContract(config, {
        abi: tokenSaleAbi,
        address: address,
        functionName: 'changeSocials',
        args: [logo, website, banner, telegram, twitter],
        chainId: ifo.dex.chainId
      })
      const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    },
    
    onSuccess: async ({ receipt }) => {
      await onSuccess(receipt.transactionHash)
      onDismiss()
    },
  })

  const noLogo = logo === "" || logo === undefined
  const noWeb = website === "" || website === undefined
  const noBanner = banner === "" || banner === undefined
  const wrongChain = currentChain !== ifo.dex.chainId

  return (
    <Modal title={t('Update Links', {symbol: client.chain.nativeCurrency.symbol})} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">


          <Flex flexDirection="column" minWidth="50%"  mb="20px">
        
            <Flex alignItems="flex-start">
              <Text color={"textSubtle"}>{t('Logo Link:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryLogo} placeholder="Enter Link to Logo" />
            
          </Flex>

          <Flex flexDirection="column"  mb="20px">

            <Flex alignItems="flex-start">
              <Text color={"textSubtle"}>{t('Banner Link:')}</Text>
            </Flex>
            <SearchInput  onChange={handleChangeQueryBanner} placeholder="Enter Banner Link" />
             
          </Flex>

          <Flex flexDirection="column" mb="20px" >
            <Flex alignItems="flex-start">
              <Text color={"textSubtle"}>{t('Telegram Link:')}</Text>
            </Flex>
            <SearchInput  onChange={handleChangeQueryTG} placeholder="Enter Telegram Link" />
          </Flex>
          <Flex flexDirection="column" mb="20px">
            <Flex alignItems="flex-start" >
              <Text color={"textSubtle"}>{t('Twitter/X Link:')}</Text>
            </Flex>
            <SearchInput  onChange={handleChangeQueryX} placeholder="Enter Twitter/X Link" />
          </Flex>
          <Flex flexDirection="column"  mb="20px">
            <Flex alignItems="flex-start">
              <Text color={"textSubtle"}>{t('Website Link:')}</Text>
            </Flex>
            <SearchInput onChange={handleChangeQueryWeb} placeholder="Enter website" />
          </Flex>
    
        <Text color="textSubtle" fontSize="12px" mt="20px" mb="30px">
          {t(
            'Use this to add Logo Link, and Website link for %symbol% Sale. Banner size 380x75.',
              {symbol: client.chain.nativeCurrency.symbol}
          )}
        </Text>


      <Flex justifyContent={'center'} alignItems={'center'} mb="20px" >
        <Button
          onClick={handleConfirm}
          disabled={isConfirmed || noWeb || noLogo || wrongChain || noBanner}
        >
          {isConfirming
            ? t('Confirming...')
            : isConfirmed
            ? t('Added')
            : t('Update Links')}
        </Button>
        </Flex>
      </ModalBody>
    </Modal>
  )
}

export default AddLinksModal
