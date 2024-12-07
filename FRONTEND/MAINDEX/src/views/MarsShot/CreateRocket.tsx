import React, { useState, useEffect, useRef } from 'react'
import { Modal, Flex, Text, Button, Toggle, ArrowBackIcon, ArrowForwardIcon } from 'uikit'
import styled from 'styled-components'
import { BigNumber } from 'bignumber.js'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useReadContracts } from 'wagmi'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { isMobile } from 'components/isMobile'
import { config } from 'wagmiConfig'
import { lanchManagerAbi } from 'config/abi/launchManager'
import CreateRocketModal from './CreateRocketModal'
import QuestionHelper from 'components/QuestionHelper'
import { TransactionReceipt } from 'zksync-ethers/build/types'
import { ToastDescriptionWithTx } from 'components/Toast'
import useToast from 'hooks/useToast'
import { defaultChainId } from 'config/constants/chains'
import { API_URL } from 'config'

const Container = styled.div``

const GridContainer = styled.div`

  display: grid;
`

const WavyLineContainer = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - 10px);
  padding-top: 20px;
  padding-bottom: 20px;
`
const Dropdown = styled.select`
  width: 100%;
  padding: 8px;
  font-size: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
   width: 300px;
  margin-top: 10px; /* Add space between text and input */
`

const InputMarsShot = styled.input`
  border-radius: 3.2px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 12px;
  display: flex;
  align-items: center;
    overflow: auto; /* Ensuring a scrollbar appears if necessary */
  box-sizing: border-box; /* Ensures padding is included in height */
  resize: none; /* Prevents the textarea from being resizable */
  white-space: pre-wrap; /* Ensures that whitespace is preserved and wraps when needed */
  word-wrap: break-word; /* Breaks long words to fit within the textarea */
`


const InputMarsShotDescription = styled.textarea`
  border-radius: 3.2px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 12px;

  overflow: auto; /* Ensuring a scrollbar appears if necessary */
  box-sizing: border-box; /* Ensures padding is included in height */
  resize: none; /* Prevents the textarea from being resizable */
  white-space: pre-wrap; /* Ensures that whitespace is preserved and wraps when needed */
  word-wrap: break-word; /* Breaks long words to fit within the textarea */
`;

const ToggleWrapper = styled.div`
  align-items: center;
  justify-items: center;
  margin-left: 10px;
  padding-bottom: 20px;
  ${Text} {
    margin-left: 8px;
  }
`

const WavyLine = styled.div<{ valid: boolean }>`
  width: 100%;
  height: 6px;
  background: ${({ valid }) => (valid ? '#da6805;' : 'white')};
`

const ButtonPoint = styled.div<{ active: boolean; filled: boolean }>`
  width: 20px;
  height: 20px;
  background: ${({ active, filled }) => (active ? '#0577DA' : filled ? '#da6805' : 'white')};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
`

const ButtonIndex = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 12px;
`

const ImageC = styled.div`
  width: ${isMobile ? '100px' : '130px'};

  overflow: hidden;
  justify-content: center;
  align-items: center;
`

const ContainerR = styled.div`
  padding-bottom: ${isMobile ? '20px' : '30px'};
  display: flex;
  justify-content: center;
  align-items: center;
`

const ContainerRS = styled.div`
  padding-bottom: ${isMobile ? '10px' : '10px'};
  display: flex;
  justify-content: center;
  align-items: center;
`

const CreateRocket: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const handleDismiss = onDismiss || (() => {})
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const { balance } = useGetBnbBalance(chain?.id)

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [logo, setLogo] = useState('')
  const [telegram, setTelegram] = useState('')
  const [website, setWebsite] = useState('')
  const [initialSupply, setSupply] = useState('100000000')
  const [ lengthInSeconds, setLengthInSeconds]  = useState(3600); // Length in seconds
  
  const [fee, setFee] = useState('0')
  const [sFee, setSFee] = useState('0')
  const [isSponsored, setIsSponsored] = useState(true)
  const { toastSuccess, toastError } = useToast()
  const [launchData, setLData] = useState('')
  const softCapOptions = {
    282: ['0.1', '0.5', '1'],
    388: ['10000', '50000', '100000']
  }
  const [ softCap, setSoftCap ] = useState(Number(softCapOptions[chainId][0]))

  const totalFee = () => {
    let total = new BigNumber(fee);
    
    if (isSponsored) {
      total = total.plus(sFee);
    }
    
    return total;
  }

  const { data } = useReadContracts({
    contracts: [
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'creationFee',
        chainId: chainId,
      },
      {
        abi: lanchManagerAbi,
        address: getAddress(contracts.launchManager, chainId),
        functionName: 'sponsorshipFee',
        chainId: chainId,
      },
    ],
  })

  const validateInput = (value: string) => {
    const containsNonSpaceCharacters = /\S/.test(value)
    return containsNonSpaceCharacters
  }

  const validateImageFile = (value: string) => {
    // Regular expression to check common image file extensions
    const validImageExtension = /\.(png|gif|jpg|jpeg|bmp|tiff|webp|svg)$/i;
    
    // Test if the input string is not empty and contains a valid image extension
    return validImageExtension.test(value.trim());
  }

  useEffect(() => {
    if (data) {
      setFee(data[0]?.result?.toString() || '0')
      setSFee(data[1]?.result?.toString() || '0')
    }
  }, [data])

  const disableBuying =
    new BigNumber(balance?.toString()).lt(totalFee()) ||
    name === '' ||
    symbol === '' ||
    telegram === '' ||
    website === '' ||
    logo === '' ||
    description === '' ||
    !validateInput(name) ||
    !validateInput(symbol) ||
    !validateImageFile(logo)

   

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value)
        break
      case 'symbol':
        setSymbol(value)
        break
      case 'website':
        setWebsite(value)

        break
      case 'telegram':
        setTelegram(value)
        break
      case 'logo':
        setLogo(value)
        break
      case 'description':
        setDescription(value)
        fixForm()
        break
      case 'timeframe':
        setLengthInSeconds(Number(value))
        break
      case 'minimum':
        setSoftCap(Number(value))
        break
      default:
        break
    }
  }

  const fixForm = () => {
    try {
      if (website !== '' && !website.startsWith('https://')) {
        setWebsite('https://' + website)
   
      }

      if (telegram !== '' && !telegram.startsWith('https://t.me/')) {
        if (telegram.startsWith('@')) {
          setTelegram('https://t.me/' + telegram.substring(1))
        } else {
          setTelegram('https://t.me/' + telegram)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  interface FetchResponse {
    message: string
  }
  

  const handleAIDesc = async () => {
    console.log(name, description)
    if (description == '[object Object]') {
      setDescription('')
  }
    const inputValue = "ADD DESC: The name of the token is:" + name + ". The current description is " + description
    const response = await fetch(`${API_URL}/api/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inp: inputValue }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }
    const res: FetchResponse = await response.json()
    console.log(res)
    setDescription(res.message)
  }


  const [isModalOpen, setModalOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(true)

  const onClickConfirm = async () => {
    try {
      const now = Date.now() / 1000; // Current timestamp in seconds
      const endEpoch = (now + lengthInSeconds).toFixed(0); // Adding 3600 seconds
      
    const { request } = await simulateContract(config, {
      abi: lanchManagerAbi,
      address: getAddress(contracts.launchManager, chain?.id),
      functionName: 'startRound',
      args: [
        name,
        symbol,
        new BigNumber(initialSupply).shiftedBy(18),
        endEpoch,
        new BigNumber(softCap).shiftedBy(18),
        [
          website,
          telegram,
          logo,
          description
        ],
        isSponsored,
      ],
      value: totalFee(),
      chainId: chain?.id,
    })

    const hash = await writeContract(config, request)
    const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt
    console.log(receipt.logs[7].data)
    
    if (receipt.status) {
      setLData(receipt.logs[7].data)
      toastSuccess(
        'Rocket set to launch.',
        <ToastDescriptionWithTx txHash={receipt.hash}>
          Start fueling your rocket.
        </ToastDescriptionWithTx>,
      )
    } else {
      // user rejected tx or didn't go thru
      toastError('Rejected', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
      handleModalDismiss()
    }
  } catch (e) {
    console.error(e)
    toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
    handleModalDismiss()
  }
  }

  const handlePointClick = (index: number) => {
    setCurrentStep(index)
  }

  const handleNext = () => {
    if (currentStep === 6) setCurrentStep(0)
    else setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if(currentStep === 0) setCurrentStep(6)
    else setCurrentStep(currentStep - 1)
  }

  const isStepFilled = (index: number) => {
    switch (index) {
      case 0:
        return validateInput(name)
      case 1:
        return validateInput(symbol)
      case 2:
        return validateInput(website)
      case 3:
        return validateInput(telegram)
      case 4:
        return validateImageFile(logo)
      case 5:
        return validateInput(description)
      default:
        return false
    }
  }


  const handleModalDismiss = () => {
    setModalOpen(false)
    setShowCreateModal(false)
    handleDismiss()
  }

  const createTokenClick = async () => {
    setShowCreateModal(false)
    setModalOpen(true)
    onClickConfirm()
  }

  const inputRefs = {
    name: useRef<HTMLInputElement>(null),
    symbol: useRef<HTMLInputElement>(null),
    website: useRef<HTMLInputElement>(null),
    telegram: useRef<HTMLInputElement>(null),
    logo: useRef<HTMLInputElement>(null),
    description: useRef<HTMLInputElement>(null),
    timeframe: useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    const focusNextInput = (step: number) => {
      const refName = Object.keys(inputRefs)[step]
      if (inputRefs[refName]?.current) {
        inputRefs[refName].current.focus()
      }
    }

    focusNextInput(currentStep)
  }, [currentStep])

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
      '/images/icons/r1.jxr',
      '/images/icons/r2.jxr',
      '/images/icons/r3.jxr',
      '/images/icons/r4.jxr',
      '/images/icons/r5.jxr',
      '/images/icons/r6.jxr',
      '/images/icons/r6.jxr',
    ]
    preloadImages(images)
  }, [])

  const steps = [
    {
      label: 'Step 1: Name',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={preloadedImages['/images/icons/r1.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Name</Text>
          <InputMarsShot
            ref={inputRefs.name}
            value={name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder='Token Name'
          />{' '}
        </>
      ),
    },
    {
      label: 'Step 2: Symbol',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={preloadedImages['/images/icons/r2.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Symbol</Text>
          <InputMarsShot
            ref={inputRefs.symbol}
            value={symbol}
            onChange={e => handleChange('symbol', e.target.value)}
            placeholder='Token Symbol'
          />{' '}
        </>
      ),
    },
    {
      label: 'Step 3: Website',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={preloadedImages['/images/icons/r3.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Website</Text>
          <InputMarsShot
            ref={inputRefs.website}
            value={website}
            onChange={e => handleChange('website', e.target.value)}
            placeholder='Website URL'
          />{' '}
        </>
      ),
    },
    {
      label: 'Step 4: Telegram',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={preloadedImages['/images/icons/r4.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Telegram</Text>
          <InputMarsShot
            ref={inputRefs.telegram}
            value={telegram}
            onChange={e => handleChange('telegram', e.target.value)}
            placeholder='Telegram Link'
          />{' '}
        </>
      ),
    },
    {
      label: 'Step 5: Logo',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={validateImageFile(logo) ? logo : preloadedImages['/images/icons/r5.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Logo</Text>
          <InputMarsShot
            ref={inputRefs.logo}
            value={logo}
            onChange={e => handleChange('logo', e.target.value)}
            placeholder='Logo URL'
          />{' '}
        </>
      ),
    },
    {
      label: 'Step 6: Description',
      content: (
        <>
          <ContainerR>
            {' '}
            <ImageC>
              <img src={preloadedImages['/images/icons/r6.jxr']} alt='Create your rocket' />
            </ImageC>
          </ContainerR>
          <Text>Description</Text>
          <InputMarsShot
            ref={inputRefs.description}
            value={description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder='Token Description'
          />{' '}
          <Flex justifyContent="center" mt="10px" mb="-20px">
            {name!="" &&
              <Button variant="text" onClick={handleAIDesc}>
                Use AI
              </Button>}
          </Flex>
        </>
      ),
    },
    {
      label: 'Step 7: Setup',
      content: (
        <>
        <Text>Timeframe</Text>
        <Dropdown ref={inputRefs.timeframe} value={lengthInSeconds} onChange={e => handleChange('timeframe', e.target.value)}>
          <option value='' disabled>
          Select TimeFrame
          </option>
          <option value='3600'>1 Hour</option>
          <option value='28800'>8 Hours</option>
          <option value='86400'>1 Day</option>
        </Dropdown>

        <Text>Minimum to Launch</Text>
        <Dropdown 
          ref={inputRefs.minimum} 
          value={softCap} 
          onChange={e => handleChange('minimum', e.target.value)}
        >
          <option value='' disabled>
            Select Minimum Raised to Launch
          </option>
            {softCapOptions[chainId].map((option, index) => (
              <option key={index} value={option}>
                {option.toLocaleString()} zkCRO
              </option>
            ))}
        </Dropdown>
        </>
      ),
    },
  ]


  return (
    <>
      {showCreateModal && (
        <Modal minWidth='370px' title='Create Your Rocket' overflow='none' onDismiss={handleDismiss}>
          <Flex flexDirection="column">
            <Text>{`Fee Required: ${Number(new BigNumber(totalFee().toString()).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} CRO`}</Text>
          </Flex>
          <Container>
           
            <GridContainer>{steps[currentStep].content}</GridContainer>
            <WavyLineContainer>
            <Button variant="text" onClick={handlePrev} ><ArrowBackIcon /></Button>
              {steps.map((_, index) => (
                <>
                  <ButtonPoint
                    key={index}
                    active={index === currentStep}
                    filled={isStepFilled(index)}
                    onClick={() => handlePointClick(index)}
                  >
                    <ButtonIndex>{index + 1}</ButtonIndex>
                  </ButtonPoint>
                  {index !== 6 && <WavyLine valid={isStepFilled(index + 1)} />}
                </>
              ))}
               <Button variant="text" onClick={handleNext}><ArrowForwardIcon /></Button>
            </WavyLineContainer>
            <ToggleWrapper>
              <ContainerRS>
                <Toggle checked={isSponsored} onChange={() => setIsSponsored(!isSponsored)} scale='sm' />
                <Text>Sponsor</Text>
                <QuestionHelper
                  mr='10px'
                  text={
                    <>
                      <Text>{`Be featured on the "Sponsored Rockets" wall. COST: ${Number(new BigNumber(totalFee().toString()).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} CRO`}</Text>
                    </>
                  }
                  ml='4px'
                />
              </ContainerRS>
            </ToggleWrapper>

            <Flex mb='10px' justifyContent='center'>
              <Button onClick={createTokenClick} disabled={disableBuying}>
                {
                  new BigNumber(balance?.toString()).lt(totalFee()) 
                  ? "Balance Low" 
                  : "Create Rocket"
                }
              </Button>
            </Flex>
          </Container>
        </Modal>
      )}
      {isModalOpen && <CreateRocketModal onDismiss={handleModalDismiss} launchData={launchData} />}
    </>
  )
}

export default CreateRocket
