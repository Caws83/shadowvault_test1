import React, { useEffect, useState } from 'react'
import { Modal } from 'uikit'
import styled from 'styled-components'

import { isMobile } from 'components/isMobile'
import { useAccount, useChainId, useReadContracts } from 'wagmi'
import { lanchManagerAbi } from 'config/abi/launchManager'
import BigNumber from 'bignumber.js'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { defaultChainId } from 'config/constants/chains'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 600px;
  font-size: ${isMobile ? '12px' : '12px'};
`

const Item = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
`

const ImageContainer = styled.div`
  width: ${isMobile ? '30px' : '40px'};
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Text = styled.div`
  display: flex;
  color: white;
  justify-content: center;
  align-items: center;
`

const TextContainer = styled.div`
  color: white;
  justify-content: center;
  align-items: center;
  line-height: 20px;
  padding-top: 20px;
`

const BorderContainer = styled.div`
  border-radius: 4px;
  flex-grow: 1;
  flex-basis: 0;
`

const HowItWorks: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const handleDismiss = onDismiss || (() => {})
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId

  const [fee, setFee] = useState('0')
  const [sFee, setSFee] = useState('0')

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


  useEffect(() => {
    if (data) {
      setFee(data[0]?.result?.toString() || '0')
      setSFee(data[1]?.result?.toString() || '0')
    }
  }, [data])

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
      '/images/icons/create.jxr',
      '/images/icons/1hr.jxr',
      '/images/icons/launch.jxr',
    ]
    preloadImages(images)
  }, [])

  return (
    <Modal minWidth='370px' style={{ fontSize: '14px' }} title='How It Works' onDismiss={handleDismiss} overflow='none'>
      <BorderContainer>
        <Container>
          <Item>
            <ImageContainer>
              <img src={preloadedImages['/images/icons/create.jxr']} alt='Create your rocket' />
            </ImageContainer>
            <Text>
              <p>1. Create your rocket.</p>
            </Text>
          </Item>

          <Item>
            <ImageContainer>
              <img src={preloadedImages['/images/icons/1hr.jxr']} alt='Fuel your rocket' />
            </ImageContainer>
            <Text>
              <p>2. You have 1 hour to raise funds.</p>
            </Text>
          </Item>

          <Item>
            <ImageContainer>
              <img src={preloadedImages['/images/icons/launch.jxr']} alt='Rocket is launched' />
            </ImageContainer>
            <Text>
              <p>3. Marswap auto-launch.</p>
            </Text>
          </Item>

          <TextContainer>
            <p>No softcap. No hardcap. No team tokens. 50% supply. 50% presale.</p>
            <br />
            <p>Created tokens are 0%, renounced and LP is burnt.</p>
            <br />
            <p>Once you buy into a rocket, you cannot sell until it's launched</p>
            <br />
            <p>COSTS</p>
            <p>{`Create: ${Number(new BigNumber(fee).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} zkCRO`}</p>
            <p>{`Sponsor: ${Number(new BigNumber(sFee).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} zkCRO`}</p>
          </TextContainer>
        </Container>
      </BorderContainer>
    </Modal>
  )
}

export default HowItWorks
