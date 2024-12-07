import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { Modal, ModalBody, Text, Link, Button, BalanceInput, Flex } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { getBalanceAmount } from 'utils/formatBalance'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import useConfirmTransaction from 'hooks/useConfirmTransaction'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'
import { TransactionReceipt } from 'viem'
import hosts from 'config/constants/hosts'
import tokens from 'config/constants/tokens'
import { TokenImage } from 'components/TokenImage'
import { lanchManagerAbi } from 'config/abi/launchManager'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import truncateHash from 'utils/truncateHash'
import { getBscScanLink } from 'utils'
import { getBalanceNumber } from 'utils/formatBalance'
import { isMobile } from 'components/isMobile'
import styled from 'styled-components'

const ImageC = styled.div`
  height: ${isMobile ? '150px' : '170px'}; // Add height for consistency
  display: flex;
  padding: 10px;
  border-radius: 20px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`
const TextR = styled.div`
  display: flex;
  font-size: 12px;
  justify-content: center;
  align-items: center;
  color: white;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: center;  // Added this line
`

interface Props {
  txHash: string
  chainId: number
  onDismiss?: () => void
}

const CollectModal: React.FC<Props> = ({
  txHash,
  chainId,
  onDismiss
}) => {
  const { t } = useTranslation()

  const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string }>({})

  const preloadImages = (srcArray: string[]) => {
    const images: { [key: string]: string } = {}
    srcArray.forEach((src) => {
      const img = new Image()
      img.src = src
      images[src] = img.src
    })
    setPreloadedImages(images)
  }

  useEffect(() => {
    const images = [
      '/images/icons/fueled.jxr'
     
    ]
    preloadImages(images)
  }, [])
 
  return (
    <Modal title={'Collect Rocket Tokens'} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">
      <Flex justifyContent="center" alignItems="center" flexDirection={'column'} mb="20px">
<ImageC>
              <img src={preloadedImages['/images/icons/fueled.jxr']} alt='Rocket Fueled' />
            </ImageC>
       <TextR>You have successfully collected your rocket tokens</TextR>
          <Link external href={getBscScanLink(txHash, 'transaction', chainId)}>
          {t('View Transaction')}: {truncateHash(txHash, 8, 0)}
        </Link>
        </Flex>
      </ModalBody>
    </Modal>
  )
}

export default CollectModal
