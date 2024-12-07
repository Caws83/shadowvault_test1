import React, { useState, useEffect } from 'react'
import { Flex, Modal, Text } from 'uikit'
import styled from 'styled-components'
import confetti from 'canvas-confetti'
import { delay } from 'lodash'
import { isMobile } from 'components/isMobile'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { decodeAbiParameters } from 'viem';
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { lanchManagerAbi } from 'config/abi/launchManager'
import CopyAddress from 'views/Pools/components/Modals/CopyAddress';


const BorderContainer = styled.div`
  padding: 5px;
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
  margin-bottom: 16px;
`

const TextWrap = styled.div`
  white-space: normal;
  color: white;
  font-size: 12px;
`

const CountdownText = styled.div`
  font-size: 3em;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`

const ImageC = styled.div`
  width: ${isMobile ? '240px' : '330px'};
  display: flex;
  justify-content: center;
  align-items: center;
`

const CreateRocketModal: React.FC<{ onDismiss?: () => void; launchData: string }> = ({
  onDismiss,
  launchData
}) => {
  const [count, setCount] = useState(3)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownOver, setCountdownOver] = useState(false)
  const handleDismiss = onDismiss || (() => {})
  const { chain } = useAccount()
  const [token, setToken] = useState('')
  const [tName, setTName] = useState('')
  const [sym, setSym] = useState('')

  console.log(launchData)
  const showConfetti = () => {
    confetti({
      resize: true,
      particleCount: 200,
      startVelocity: 30,
      gravity: 0.5,
      spread: 350,
      origin: {
        x: 0.5,
        y: 0.3,
      },
    })
  }

  

  useEffect(() => {
    
    if (launchData && launchData !== '') {
      const decoded = decodeAbiParameters([
        { type: 'address', name: 'tokenContract' },
        { type: 'string', name: 'name' },
        { type: 'string', name: 'symbol' },
        { type: 'uint256', name: 'endEpoch' }
      ], launchData);
      console.log(decoded)
      setToken(decoded[0])
      setTName(decoded[1])
      setSym(decoded[2])
      const timer = setTimeout(() => {
        setShowCountdown(true)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [launchData])

  useEffect(() => {
    if (showCountdown) {
      const countdownTimer = setInterval(() => {
        setCount(prevCount => {
          if (prevCount > 1) {
            return prevCount - 1
          } else {
            clearInterval(countdownTimer)
            setCountdownOver(true)
            delay(showConfetti, 100)
            return 0
          }
        })
      }, 1000)

      return () => clearInterval(countdownTimer)
    }
  }, [showCountdown, handleDismiss])

  const [preloadedImages, setPreloadedImages] = useState<{ [key: string]: string }>({})

  const preloadImages = (srcArray: string[]) => {
    const images: { [key: string]: string } = {}
    srcArray.forEach(src => {
      const img = new Image()
      img.src = src
      images[src] = img.src
    })
    setPreloadedImages(images)
  }

  useEffect(() => {
    const images = ['/images/icons/build_rocket.gif']
    preloadImages(images)
  }, [])

  return (
    <Modal minWidth='346px' title='Creating Rocket' onDismiss={handleDismiss} overflow='none'>
      <BorderContainer>
        <Flex justifyContent='center' alignItems='center' flexDirection={'column'}>
          {!showCountdown && (
            <ImageC>
              <img src={preloadedImages['/images/icons/build_rocket.gif']} alt='Fuel your rocket' />
            </ImageC>
          )}
          {showCountdown && !countdownOver && <CountdownText>{`${count}`}</CountdownText>}
          {countdownOver && 
          <>
            <TextWrap>Your rocket is ready!</TextWrap>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Name: </Text>
              <Text>{tName}</Text>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Symbol: </Text>
              <Text>{sym}</Text>
          </Flex>
          <CopyAddress account={token} />
          </>
          }
        </Flex>
      </BorderContainer>
    </Modal>
  )
}

export default CreateRocketModal
