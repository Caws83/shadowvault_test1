import React, { useState, useEffect, useRef } from 'react'
import { Modal, Flex, Text, Button } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { isMobile } from 'components/isMobile'
import { config } from 'wagmiConfig'
import { lanchManagerAbi } from 'config/abi/launchManager'
import { TransactionReceipt } from 'zksync-ethers/build/types'
import UpdateSocialModal from './UpdateSocialModal'


const TextHeader1 = styled.div`
  padding-bottom: ${isMobile ? '5px' : '30px'};
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: ${isMobile ? '25px' : '30px'};
`

const Container = styled.div``

const GridContainer = styled.div`
  display: grid;
`

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column; /* Stack text and input vertically */
  justify-content: center;
  align-items: center; /* Center the content horizontally */
  margin-bottom: 20px;
`

const InputMarsShot = styled.input`
  border-radius: 3.2px;
  padding: 8px 12px;
  width: 300px;
  border: 1px solid #ccc;
  font-size: 12px;
  display: flex;
  align-items: center;
  overflow: auto; /* Ensuring a scrollbar appears if necessary */
  box-sizing: border-box; /* Ensures padding is included in height */
  resize: none; /* Prevents the textarea from being resizable */
  white-space: pre-wrap; /* Ensures that whitespace is preserved and wraps when needed */
  word-wrap: break-word; /* Breaks long words to fit within the textarea */
  
  margin-top: 10px; /* Add space between text and input */
`


const UpdateSocials: React.FC<{ onDismiss?: () => void; chainId: number, roundData }> = ({ onDismiss, chainId, roundData }) => {
  const handleDismiss = onDismiss || (() => {})
  const { t } = useTranslation()
  const { address: account, chain } = useAccount()
 
  const [currentStep, setCurrentStep] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [logo, setLogo] = useState(roundData.logo)
  const [telegram, setTelegram] = useState(roundData.telegram)
  const [website, setWebsite] = useState(roundData.website)

  // defaulted. this should be brought in from opening of the page.
  const roundId = roundData.roundId;

  const [isModalOpen, setModalOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(true)

  const [txSuccess, setTxnSuccess] = useState(true)

  const disableBuying =
    !account ||   
    website === '' ||
    telegram === '' ||
    chain?.id !== chainId

  const handleChange = async (field: string, value: string) => {
    switch (field) {
      
      case 'website':
        setWebsite(value)
        break
      case 'telegram':
        setTelegram(value)
        break
      case 'logo':
        setLogo(value)
        break
      default:
        break
    }
  }

  const createTokenClick = async () => {
    setShowCreateModal(false)
    setModalOpen(true)
    onClickConfirm()
  }


  const onClickConfirm = async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'editProjectInfo',
        args: [
          roundId, 
          website, 
          telegram, 
          logo
        ],
        chainId,
      })

      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
      if (receipt.status) {
        setIsReady(true)
        setTxnSuccess(true)
      } else {
        setTxnSuccess(false)
        setIsReady(true)
      }
    } catch (e) {
      setTxnSuccess(false)
    }
  }

 

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleModalDismiss = () => {
    setModalOpen(false)
    handleDismiss()
  }

  useEffect(() => {
    const handleTabKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleTabKeyPress)

    return () => {
      window.removeEventListener('keydown', handleTabKeyPress)
    }
  }, [currentStep, handleNext])

  const inputRefs = {
    telegram: useRef<HTMLInputElement>(null),
    website: useRef<HTMLInputElement>(null),
    logo: useRef<HTMLInputElement>(null),
  }

  const steps = [

    {
      input: (
        <UploadContainer>
        <Text>Website</Text>
        <InputMarsShot
          ref={inputRefs.website}
          value={website}
          onChange={e => handleChange('website', e.target.value)}
  
        />
          </UploadContainer>
      ),
    },
    {
      input: (
        <UploadContainer>
        <Text>Telegram</Text>
        <InputMarsShot
          ref={inputRefs.telegram}
          value={telegram}
          onChange={e => handleChange('telegram', e.target.value)}
      
        />
          </UploadContainer>
      ),
    },
    {
      input: (
        <UploadContainer>
        <Text>Logo</Text>
        <InputMarsShot
          ref={inputRefs.logo}
          value={logo}
          onChange={e => handleChange('logo', e.target.value)}
      
        />
          </UploadContainer>
      ),
    },

  ]

  return (
    <>
      {showCreateModal && (
        <Modal minWidth='370px' title='Update Your Socials' overflow='none' onDismiss={handleDismiss}>
          <Container>
          
            <GridContainer>
              <Flex
                mb={`${isMobile ? '20px' : '40px'}`}
                mt='20px'
                justifyContent='center'
                flexDirection='column'
                alignItems='center'
              >
                {steps[currentStep].input}
              </Flex>
         
              <Flex justifyContent='space-between' mb={`${isMobile ? '10px' : '30px'}`}>
                <Button variant={'orange'} onClick={handlePrev} disabled={currentStep === 0}>
                  Previous
                </Button>
                {currentStep === steps.length - 1 && (
                  <Button variant={'orange'} onClick={createTokenClick} disabled={disableBuying}>
                    {t('Update')}
                  </Button>
                )}
                <Button variant={'orange'} onClick={handleNext} disabled={currentStep === steps.length - 1}>
                  Next
                </Button>
              </Flex>
            </GridContainer>
           
          </Container>
        </Modal>
      )}
      {isModalOpen && <UpdateSocialModal onDismiss={handleModalDismiss}  txSuccess={txSuccess} isReady={isReady}/>}
    </>
  )
}

export default UpdateSocials