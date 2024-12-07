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
  poolId: number
  chainId: number
  userCurrencyBalance: BigNumber
  onSuccess: (amount: BigNumber, txHash: string) => void
  onDismiss?: () => void
}

const multiplierValues = [0.1, 0.25, 0.5, 0.75, 1]

const ContributeModal: React.FC<Props> = ({
  poolId,
  chainId,
  userCurrencyBalance,
  onDismiss,
  onSuccess,
}) => {

  const [value, setValue] = useState('')
  const { t } = useTranslation()
  const valueWithTokenDecimals = new BigNumber(value).times(new BigNumber(DEFAULT_TOKEN_DECIMAL.toString()))
  const client = usePublicClient({chainId})
  const [successCont, setSuccessCont]= useState(false)
  const [receiptValue, setReceipt] = useState('')
  

  const { isConfirmed, isConfirming, handleConfirm } = useConfirmTransaction({
    onConfirm: async () => {
   try {
      const { request } = await simulateContract(config, {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'contribute',
        args: [poolId],
        value: valueWithTokenDecimals,
        chainId
      })
      const hash = await writeContract(config, request)
        return waitForTransactionReceipt(config, {hash}) as Promise<TransactionReceipt>
    }catch (e) {
      console.log(e)
    }
    },

    
    onSuccess: async ({ receipt }) => {
      setReceipt(receipt.transactionHash)
      await onSuccess(valueWithTokenDecimals, receipt.transactionHash)
      setSuccessCont(true)
      //onDismiss()
    },
  })

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
      '/images/icons/fueling.jxr',
      '/images/icons/fueled.jxr'
     
    ]
    preloadImages(images)
  }, [])

 
  return (
    <Modal title={'Fuel Rocket'} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">
        {!successCont && 
  <>
      <ImageC>
              <img src={preloadedImages['/images/icons/fueling.jxr']} alt='Create your rocket' />
            </ImageC> 
        <Flex justifyContent="space-between" mb="8px">
          <Text>{t('Commit')}:</Text>
          <Flex flexGrow={1} justifyContent="flex-end">
            <TokenImage token={tokens.wNative} host={hosts.marswap} chainId={chainId} height={25} width={25} mr="5px" />
            <Text>{client.chain.nativeCurrency.symbol}</Text>
          </Flex>
        </Flex>
        <BalanceInput
          value={value}
          onUserInput={setValue}
          isWarning={valueWithTokenDecimals.isGreaterThan(userCurrencyBalance)}
          decimals={18}
          mb="8px"
        />
        <Text color="textSubtle" textAlign="right" fontSize="12px" mb="16px">
          {t('Balance: %balance%', {
            balance: getBalanceAmount(userCurrencyBalance, 18).toFixed(4),
          })}
        </Text>
       
        <Flex justifyContent="space-between" mb="16px">
          {multiplierValues.map((multiplierValue, index) => (
            <Button
              key={multiplierValue}
              scale="xs"
              variant="tertiary"
              onClick={() => setValue(getBalanceAmount(userCurrencyBalance.times(multiplierValue)).toFixed(17))}
              mr={index < multiplierValues.length - 1 ? '8px' : 0}
            >
              {multiplierValue * 100}%
            </Button>
          ))}
        </Flex>
      
        <Button
        mt="10px" mb="10px"
          onClick={handleConfirm}
          width="100%"
          disabled={isConfirmed || valueWithTokenDecimals.isNaN() || valueWithTokenDecimals.eq(0) || userCurrencyBalance.eq(0) || userCurrencyBalance.lt(valueWithTokenDecimals)}
        >
          {isConfirming
            ? t('Fueling...')
            : userCurrencyBalance.eq(0) || userCurrencyBalance.lt(valueWithTokenDecimals)
            ? t('Balance Low')
            : isConfirmed || valueWithTokenDecimals.isNaN() || valueWithTokenDecimals.eq(0)
            ? t('Tank Full')
            : t('Fuel Rocket')}
        </Button>
        </>
}
{successCont && <Flex justifyContent="center" alignItems="center" flexDirection={'column'} mb="20px">
<ImageC>
              <img src={preloadedImages['/images/icons/fueled.jxr']} alt='Rocket Fueled' />
            </ImageC>
       <TextR>You have fueled the rocket with {getBalanceNumber(valueWithTokenDecimals)} zkCRO tokens</TextR>
          <Link external href={getBscScanLink(receiptValue, 'transaction', chainId)}>
          {t('View Transaction')}: {truncateHash(receiptValue, 8, 0)}
        </Link>
        </Flex>}
      </ModalBody>
    </Modal>
  )
}

export default ContributeModal
