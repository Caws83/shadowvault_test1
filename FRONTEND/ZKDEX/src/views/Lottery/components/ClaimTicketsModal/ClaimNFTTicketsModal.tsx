import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Modal, Text, Flex, Skeleton, Button, useModal, Image, useMatchBreakpoints, Box } from 'uikit'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ActionContent } from 'views/Farms/components/FarmTable/Actions/styles'
import BigNumber from 'bignumber.js'
import { useGetNftLotteryInfo } from '../../hooks/nftCounts'
import ClaimAction from './ClaimActions'
import ViewNFTTicketsModal from './ViewNFTTicketsModal'
import { useAccount } from 'wagmi'
import { useLottery } from 'state/lottery/hooks'
import { NftItemInfo, Token } from 'config/constants/types'
import Balance from 'components/Balance'

interface ClaimTicketsModalProps {
  onDismiss?: () => void
  lotteryToken: Token
  currentLotteryId: string
  howManySpots: number
}

interface extraInfo extends NftItemInfo {
  collection: string
  toClaim: number
  perDraw: number
}

interface ColInfo {
  collection: string
  ids: BigInt[]
  claimable: BigInt[]
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const selectedStyle = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 2',
}

const unselectedStyle = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 2',
}

const selectedStyleLarge = {
  cursor: 'pointer',
  border: '3px solid green',
  gridColumn: 'span 3',
}

const unselectedStyleLarge = {
  cursor: 'pointer',
  border: 'none',
  gridColumn: 'span 3',
}

const ClaimTicketsModal: React.FC<ClaimTicketsModalProps> = ({
  onDismiss,
  lotteryToken,
  currentLotteryId,
  howManySpots,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const l = useLottery(lotteryToken)
  const showConnectButton = !account || chain.id !== l.chainId

  const [colImages, setColImages] = useState<extraInfo[]>([])
  const { onColInfo, onImage } = useGetNftLotteryInfo(lotteryToken)

  const colInfo: ColInfo[] = onColInfo()

  const [selectedCollection, setSelected] = useState<number>(0)
  const [selectedName, setName] = useState<string>('')

  const onSelectCol = (newChoice: number, newName: string) => {
    setSelected(newChoice)
    setName(newName)
  }

  const [onPresentViewTicketsModal] = useModal(
    <ViewNFTTicketsModal
      lotteryToken={lotteryToken}
      name={selectedName}
      colInfo={colInfo ? colInfo[selectedCollection] : null}
    />,
  )

  const { isLg, isXl, isXxl } = useMatchBreakpoints()
  const isLargerScreen = isLg || isXl || isXxl

  const getStyle = (index: number) => {
    if (isLargerScreen) {
      if (selectedCollection === index) {
        return selectedStyleLarge
      }
      return unselectedStyleLarge
    }
    if (selectedCollection === index) {
      return selectedStyle
    }
    return unselectedStyle
  }

  useEffect(() => {
    if (colImages.length === 0 && colInfo !== undefined) {
      const idList: extraInfo[] = []
      colInfo.forEach((col, index) => {
        let amount = 0
        let per = 0
        for (let i = 0; i < col.claimable.length; i++) {
          const claimableForThisNFT = new BigNumber(col.claimable[i].toString()).toNumber()
          amount += claimableForThisNFT
          if (claimableForThisNFT > 0) per += 1
        }
        const tokenInfo = {
          name: '',
          imageURI: '',
          haveImage: false,
          selected: false,
          tokenId: new BigNumber(index),
          imageLoaded: false,
          collection: col.collection,
          toClaim: amount,
          perDraw: per,
        }
        idList.push(tokenInfo)
      })
      setColImages(idList)
    }
  }, [colInfo, colImages.length])

  if (colImages.length > 0) {
    const imagesToProcess = colImages.filter((tokenInfo) => tokenInfo.haveImage === false)
    imagesToProcess.forEach((tokenInfo) => {
      onImage(2, tokenInfo.collection, (imageInfo) => {
        const newTokenInfo = tokenInfo
        newTokenInfo.imageURI = imageInfo.imageURI
        newTokenInfo.name = imageInfo.name
        newTokenInfo.haveImage = true
        setColImages(
          colImages.map((item) => {
            return item.tokenId === newTokenInfo.tokenId ? newTokenInfo : item
          }),
        )
      })
    })
  }

  return (
    <Modal
      title={t('Claim Tickets using NFTS')}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex justifyContent={['center', null, null, 'flex-start']}>
        <Text display="inline">{t('You have')} </Text>
        {howManySpots !== undefined ? (
          <Balance value={howManySpots} decimals={0} unit={` ${t('tickets')}`} display="inline" bold mx="4px" />
        ) : (
          <Skeleton mx="4px" height={20} width={40} />
        )}
        <Text display="inline"> {t('Claimable')}</Text>
      </Flex>
      <Divider />
      {!showConnectButton ? (
        <ClaimAction
          account={account}
          lotteryToken={lotteryToken}
          currentLotteryId={currentLotteryId}
          howManySpots={howManySpots}
        />
      ) : (
        <ConnectWalletButton chain={l.chainId} />
      )}
      <Text color="textSubtle">Select Collection</Text>
      <Box>
        {colImages.length > 0 ? (
          colImages.map((token, index) => {
            if (token.haveImage) {
              return (
                <>
                  {token.toClaim > 0 && (
                    <Flex flexDirection="column" alignItems="center">
                      <Text>{token.name.substring(0, 21)}</Text>
                      <Text>{`perDraw: ${token.perDraw} / total: ${
                        token.toClaim > 999 ? 'forever' : token.toClaim
                      }`}</Text>
                      <Image
                        key={token.toString()}
                        src={token.imageURI}
                        width={100}
                        height={100}
                        style={getStyle(index)}
                        onClick={() => {
                          onSelectCol(index, token.name)
                        }}
                      />
                      <Divider />
                    </Flex>
                  )}
                </>
              )
            }
            return (
              <Text key={`text${token.tokenId.toString()}`} width="100px" height="100px">
                {token.tokenId.toString()}
              </Text>
            )
          })
        ) : (
          <Text>Loading Token List</Text>
        )}
      </Box>
      <Divider />
      {colInfo !== undefined && (
        <ActionContent>
          <Button onClick={onPresentViewTicketsModal} width="100%" variant="primary">
            Check Selected Collection
          </Button>
        </ActionContent>
      )}
      <ActionContent>
        <Button width="100%" variant="secondary" onClick={onDismiss}>
          Close
        </Button>
      </ActionContent>
    </Modal>
  )
}

export default ClaimTicketsModal
