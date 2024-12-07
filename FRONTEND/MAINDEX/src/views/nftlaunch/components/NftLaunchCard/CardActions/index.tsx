import React, { useEffect, useState } from 'react'
import { Flex, Text, Skeleton, Button, AutoRenewIcon, Card, CardRibbon } from 'uikit'
import { NFTLaunch } from 'state/types'
import BigNumber from 'bignumber.js'
import { useNftLaunchApprove } from 'views/nftlaunch/hooks/useApprove'
import BuyAction from './BuyActions'
import { NftImage, NftLaunchPairImage } from 'components/TokenImage'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import { readContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import hosts from 'config/constants/hosts'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import styled from 'styled-components'
import { useAccount, usePublicClient } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { config } from 'wagmiConfig'

interface CardActionsProps {
  launch: NFTLaunch
  isLoading: boolean
  account: string
}

const getRibbonComponent = (isPublic: boolean) => {
  if (!isPublic) {
    return <CardRibbon variantColor="textDisabled" ribbonPosition="left" text={'Coming Soon'} />
  }
    return (
      <CardRibbon
        variantColor="primary"
        ribbonPosition="left"
        style={{ textTransform: 'uppercase' }}
        text={`${'Live'}!`}
      />
    )
}

const StyledCard = styled(Card)`
  width: 100%;
  margin: auto;
`

const CardActions: React.FC<CardActionsProps> = ({ launch, isLoading, account }) => {
  const { payToken, costToken, costBNB, userData, isPublic, nftCollectionId } = launch
  const loaded = userData !== undefined
  console.log("cardActions UserData:", launch.nftCollectionId, userData)
  const {chain} = useAccount()
  const client = usePublicClient({chainId: launch.chainId})
  const symbol = client.chain.nativeCurrency.symbol
  const showConnectButton = !account || chain.id !== launch.chainId
  const { handleNftApprove, requestedNftLaunchApproval } = useNftLaunchApprove(launch, launch.payToken)
  const onApprove = () => {
    handleNftApprove()
  }
  const ribbon = getRibbonComponent(isPublic)
  const [imageURI, setImageURI] = useState('')

  useEffect(() => {
    async function get() {
    const nftImage = launch.currentSupply === undefined ? 0 : new BigNumber(launch.currentSupply.toString()).toNumber()
    if (nftImage > 0) {
      const baseUrl = await readContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(launch.contractAddress, launch.chainId),
        functionName: 'tokenURI',
        args: [1n],
        chainId: launch.chainId
      }) as string
      const ipfsChecker = baseUrl.substring(0, 4).toLowerCase()
      let jsonUrl
      if (ipfsChecker === 'http') {
        jsonUrl = baseUrl
      } else {
        const properSubUrl = baseUrl.substring(7)
        jsonUrl = `${IPFS_GATEWAY}/${properSubUrl}`
      }
      fetch(jsonUrl).then((nftResponse) => {
        if (nftResponse.status === 200) {
          nftResponse.json().then((nftJson) => {
            const ipfsChecker2 = nftJson.image.substring(0, 4).toLowerCase()
            let imageUrl
            if (ipfsChecker2 === 'http') {
              imageUrl = nftJson.image
            } else {
              const imageBase = nftJson.image.substring(7)
              imageUrl = `${IPFS_GATEWAY}/${imageBase}`
            }
            setImageURI(imageUrl)
          })
        }
      })  
    }
  }
  get()
  }, [launch.nftCollectionId, launch.currentSupply])

  return (
    <Flex flexDirection="column">
      <StyledCard ribbon={ribbon}>
        <Flex justifyContent="center" alignItems="center">
      {new BigNumber(costToken).gt(0) ? (
      <NftLaunchPairImage
          primaryImage={imageURI}
          host={hosts.farmageddon}
          chainId={launch.chainId}
          secondaryToken={payToken}
          width={250}
          height={250}
        />
      ):(
        <NftImage
          primaryImage={imageURI}
          width={250}
          height={250}
        />
      )}
      </Flex>
      </StyledCard>
      <Flex flexDirection="column">
        {new BigNumber(costToken).gt(0) && (
          <>
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text>Pay Token:</Text>
              <Text>{payToken.name}</Text>
            </Flex>
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text>{payToken.symbol} Cost:</Text>
              {costToken === undefined ? (
                <Skeleton width="80px" height="16px" />
              ) : (
                <Text>{new BigNumber(costToken).shiftedBy(-payToken.decimals).toFixed(3)}</Text>
              )}
            </Flex>
          </>
        )}
        {new BigNumber(costBNB).gt(0) && (
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text>{`${symbol} Cost:`}</Text>
            
            {costToken === undefined ? (
              <Skeleton width="80px" height="16px" />
            ) : (
              <Text>{new BigNumber(costBNB).shiftedBy(-18).toFixed(3)}</Text>
            )}
          </Flex>
        )}
        {showConnectButton ? (
          <Flex m="10px" alignItems="center" justifyContent="center">
            <ConnectWalletButton chain={launch.chainId}/>
          </Flex>
        ) : userData && new BigNumber(userData.allowance).gte(new BigNumber(costToken)) || new BigNumber(costToken).eq(0) ? (
          <BuyAction isLoading={isLoading || !loaded} launch={launch} />
        ) : (
          <Button
            isLoading={requestedNftLaunchApproval || !loaded || isLoading}
            endIcon={requestedNftLaunchApproval ? <AutoRenewIcon spin color="currentColor" /> : null}
            disabled={requestedNftLaunchApproval || !isPublic}
            onClick={onApprove}
            width="100%"
          >
            Approve
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

export default CardActions
