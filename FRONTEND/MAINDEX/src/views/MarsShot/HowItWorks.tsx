import React, { useEffect, useState } from 'react'
import { Modal } from 'uikit'
import { isMobile } from 'components/isMobile'
import { useAccount, useChainId, useReadContracts } from 'wagmi'
import { lanchManagerAbi } from 'config/abi/launchManager'
import BigNumber from 'bignumber.js'
import { getAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'
import { defaultChainId } from 'config/constants/chains'
import { GiThorHammer, GiStopwatch } from 'react-icons/gi'
import { FaRocket } from 'react-icons/fa'
import { IoShieldCheckmark } from "react-icons/io5";

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
    <Modal 
      title="How Flash Forge Works" 
      onDismiss={onDismiss}
      minWidth={isMobile ? "370px" : "570px"}
      headerClassName="headerTop"
    >
      <div className="how-it-works-container">
        <div className="how-it-works-step">
          <div className="step-icon-wrapper">
            <GiThorHammer size={24} color="white" />
          </div>
          <div className="step-content">
            <h3 className="step-title">1. Create Your Token</h3>
            <div className="step-list">
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                Zero team tokens
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                50% supply
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                50% presale
              </div>
            </div>
          </div>
        </div>

        <div className="how-it-works-step">
          <div className="step-icon-wrapper">
            <GiStopwatch size={24} color="white" />
          </div>
          <div className="step-content">
            <h3 className="step-title">2. Flash Funding</h3>
            <div className="step-list">
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                You have <span className="oneHourTag"> 1 hour</span>  to raise funds.
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                No minimum cap
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                No maximum cap
              </div>
            </div>
          </div>
        </div>

        <div className="how-it-works-step">
          <div className="step-icon-wrapper">
            <FaRocket size={24} color="white" />
          </div>
          <div className="step-content">
            <h3 className="step-title">3. Auto-Launch</h3>
            <div className="step-list">
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                Locked liquidity
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                Renounced ownership
              </div>
              <div className="step-list-item">
                <IoShieldCheckmark size={20} color="white" />
                No users can sell until launch
              </div>
            </div>
          </div>
        </div>

        <div className="costs-container">
          <h4 className="costs-title">Launch Cost</h4>
          <p className="cost-item">
            {Number(new BigNumber(fee).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} zkCRO
          </p>
          
          <div className="sponsor-section">
            <h5 className="sponsor-title">Optional: Feature Your Token</h5>
            <p className="sponsor-description">Want your project featured on our platform?</p>
            <p className="cost-item sponsor-cost">
              {Number(new BigNumber(sFee).shiftedBy(-18).toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 5 })} zkCRO
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default HowItWorks
