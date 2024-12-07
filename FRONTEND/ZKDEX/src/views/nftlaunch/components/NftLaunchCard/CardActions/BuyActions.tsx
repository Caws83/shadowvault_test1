import React, { useState } from 'react'
import { Flex, Button, Skeleton, IconButton, AddIcon, MinusIcon, Text, useModal } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { NFTLaunch } from 'state/types'
import BigNumber from 'bignumber.js'
import useNftMint from 'views/nftlaunch/hooks/useMint'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import { getAddress } from 'utils/addressHelpers'
import NewNftModal from 'views/nftlaunch/modals/newNftModal'
import Loading from 'components/Loading'

interface BuyActionsProps {
  launch: NFTLaunch
  isLoading: boolean
}

// eslint-disable-next-line
const BuyAction: React.FC<BuyActionsProps> = ({ launch, isLoading }) => {
  const { t } = useTranslation()
  const allowMultiple =
    launch.maxMint &&
    new BigNumber(launch.maxMint.toString()).toNumber() > 1 &&
    new BigNumber(launch.maxSupply.toString()).gte(
      new BigNumber(launch.currentSupply.toString()).plus(launch.maxMint.toString()),
    )
  const [mintNumber, setMintNumber] = useState(1)
  const { onNftMint, onNftWhitelistMint } = useNftMint(launch)
  const { userData, isPublic } = launch
  const [minting, setMinting] = useState<boolean>(false)

  const [onPresentNewNfts] = useModal(<NewNftModal launch={launch} />)

  const onClickAdd = () => {
    let newMintNumber = mintNumber + 1

    if (newMintNumber > new BigNumber(launch.maxMint.toString()).toNumber()) {
      newMintNumber = new BigNumber(launch.maxMint.toString()).toNumber()
    }

    setMintNumber(newMintNumber)
  }

  const onClickMinus = () => {
    let newMintNumber = mintNumber - 1
    if (newMintNumber < 1) {
      newMintNumber = 1
    }
    setMintNumber(newMintNumber)
  }

  const onClickMint = async () => {
    setMinting(true)
    onPresentNewNfts()
    try {
      await onNftMint(mintNumber, new BigNumber(launch.costBNB.toString()).multipliedBy(mintNumber).toString())
      setMinting(false)
    } catch {
      setMinting(false)
    }
  }

  const onClickWhitelistMint = async () => {
    setMinting(true)
    onPresentNewNfts()
    try {
      await onNftWhitelistMint()
      setMinting(false)
    } catch {
      setMinting(false)
    }
  }

  const tokenBalance = useTokenBalance(getAddress(launch.payToken.address,launch.chainId), launch.chainId)
  const tokenCost = new BigNumber(launch.costToken.toString())
  const bnbBalance = useGetBnbBalance(launch.chainId)
  const bnbCost = new BigNumber(launch.costBNB.toString()).shiftedBy(-18)

  const hasBalance =
    new BigNumber(tokenBalance.balance.toString()).gte(tokenCost.multipliedBy(mintNumber)) &&
    new BigNumber(bnbBalance.balance.toString()).gt(bnbCost.multipliedBy(mintNumber))

  const canBuy = isPublic && hasBalance

  const renderBuyAction = () => {
    if (minting) {
      return (
        <Flex dir="row" justifyContent="space-evenly">
          <Loading style={{ marginRight: '25px' }} />
          <Text>Minting your new NFTs</Text>
          <Loading style={{ marginLeft: '25px' }} />
        </Flex>
      )
    }
    return (
      <>
        {userData !== undefined && userData.whitelist && (
          <Button
            style={{ marginTop: '15px' }}
            onClick={onClickWhitelistMint}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Claim Free NFT
          </Button>
        )}
        {allowMultiple ? (
            <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
              <IconButton variant="secondary" onClick={onClickMinus}>
                <MinusIcon color="primary" width="24px" height="24px" />
              </IconButton>
              <Button
              style={{ marginTop: '15px' }}
              onClick={onClickMint}
              disabled={!canBuy || isLoading}
              isLoading={isLoading}
            >
              {`Mint ${mintNumber}`}
            </Button>
              <IconButton variant="secondary" onClick={onClickAdd}>
                <AddIcon color="primary" width="24px" height="24px" />
              </IconButton>
            </Flex>
        
        ) : (
          <Button onClick={onClickMint} disabled={!canBuy || isLoading} isLoading={isLoading}>
            {t('Mint')}
          </Button>
        )}
      </>
    )
  }

  return <Flex flexDirection="column">{isLoading ? <Skeleton width="100%" height="52px" /> : renderBuyAction()}</Flex>
}

export default BuyAction
