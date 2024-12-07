import { CardsLayout, Flex, Image, Modal, Text } from 'uikit'
import Loading from 'components/Loading'
import { NftImageProps } from 'config/constants/types'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { NFTLaunch } from 'state/types'
import { useBlock } from 'state/block/hooks'
import { useNftTokenList } from '../hooks/useNftTokenlist'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'

interface NewNftModalProps {
  launch: NFTLaunch
  onDismiss?: () => void
}

const NewNftModal: React.FC<NewNftModalProps> = ({ launch, onDismiss }) => {
  const { address: account } = useAccount()
  const { theme } = useTheme()
  const [nftLoad, setNftLoad] = useState<NftImageProps[]>([])
  const [loading, setLoading] = useState(true)
  const [startedImages, setStartedImages] = useState(false)
  const { getImageForTokenId } = useNftTokenList(launch)
  const [tokenIds, setTIds] = useState<bigint[]>()


    const unwatch = useWatchContractEvent({
      abi: nftCollectionAbi,
      address: getAddress(launch.contractAddress, launch.chainId),
      eventName: 'mintedIds',
      chainId: launch.chainId,
      onLogs(logs) {
        logs.forEach((info) => {
            if (info.args.to === account) {
              unwatch?.()
              setTIds(info.args.ids.map((id) => BigInt(id)))
            }
        })
      },
    })


  useEffect(() => {
    if (tokenIds !== undefined) {
      const nftList: NftImageProps[] = []
      tokenIds.forEach((tokenId) => {
        const tokenInfo = {
          name: '',
          imageURI: '',
          haveImage: false,
          tokenId: new BigNumber(tokenId.toString()),
          imageLoaded: false,
        }
        nftList.push(tokenInfo)
      })
      setNftLoad(nftList)
    }
  }, [tokenIds]) // eslint-disable-line

  if (nftLoad.length > 0 && loading && !startedImages) {
    setStartedImages(true)
    const imagesToProcess = nftLoad.filter((tokenInfo) => tokenInfo.haveImage === false)
    if (imagesToProcess.length > 0) {
      imagesToProcess.forEach((tokenInfo) => {
        getImageForTokenId(tokenInfo.tokenId, (imageInfo) => {
          const newTokenInfo = tokenInfo
          newTokenInfo.imageURI = imageInfo.imageURI
          newTokenInfo.name = imageInfo.name
          newTokenInfo.haveImage = true
          setNftLoad(
            nftLoad.map((item) => {
              return item.tokenId === newTokenInfo.tokenId ? newTokenInfo : item
            }),
          )
        })
      })
    }
  }

  if (nftLoad.length > 0 && loading && startedImages) {
    const imagesToProcess = nftLoad.filter((tokenInfo) => tokenInfo.haveImage === false)
    if (imagesToProcess.length === 0) {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setNftLoad([])
    setStartedImages(false)
    setLoading(true)
    onDismiss()
  }

  return (
    <Modal
      minWidth="346px"
      title="New NFTs"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      {loading ? (
        <Flex dir="row" justifyContent="space-evenly">
          <Loading style={{ marginRight: '25px' }} />
          <Text>Minting your new NFTs</Text>
          <Loading style={{ marginLeft: '25px' }} />
        </Flex>
      ) : (
        <CardsLayout overflow="auto" padding="15px" width="100%">
          {nftLoad.map((token) => {
            if (token.haveImage) {
              return <Image key={`main${token.tokenId.toString()}`} src={token.imageURI} width={80} height={80} />
            }
            return (
              <Text key={`text${token.tokenId.toString()}`} width="100px" height="100px">
                {token.tokenId.toString()}
              </Text>
            )
          })}
        </CardsLayout>
      )}
    </Modal>
  )
}

export default NewNftModal
