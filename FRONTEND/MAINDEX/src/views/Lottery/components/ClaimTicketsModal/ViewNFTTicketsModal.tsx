import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Modal, Text, Flex, Button, Image } from 'uikit'
import { BigNumber } from 'bignumber.js'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import { ActionContent, ActionContainer } from 'views/Farms/components/FarmTable/Actions/styles'
import { useGetNftLotteryInfo } from '../../hooks/nftCounts'
import { NftItemInfo, Token } from 'config/constants/types'
import Balance from 'components/Balance'

export interface ColInfo {
  collection: string
  ids: BigInt[]
  claimable: BigInt[]
}

interface ViewTicketsModalProps {
  onDismiss?: () => void
  lotteryToken: Token
  name: string
  colInfo: ColInfo
}

interface extraInfo extends NftItemInfo {
  collection: string
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

const ViewTicketsModal: React.FC<ViewTicketsModalProps> = ({ onDismiss, lotteryToken, name, colInfo }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const { onImage } = useGetNftLotteryInfo(lotteryToken)

  const [tokens, setTokens] = useState<extraInfo[]>([])
  // const { nftIds, tickets, hasMaxed } = onTickets(collection)
  const nftIds = colInfo.ids
  const tickets = colInfo.claimable

  useEffect(() => {
    if (tokens.length < nftIds.length) {
      const idList: extraInfo[] = []
      nftIds.forEach((tokenId) => {
        const tokenInfo = {
          name: '',
          imageURI: '',
          haveImage: false,
          selected: false,
          tokenId: new BigNumber(tokenId.toString()),
          imageLoaded: false,
          collection: colInfo.collection,
        }
        idList.push(tokenInfo)
      })
      setTokens(idList)
    }
  }, [nftIds, tokens.length, colInfo])

  if (tokens.length > 0) {
    const imagesToProcess = tokens.filter((tokenInfo) => tokenInfo.haveImage === false)
    imagesToProcess.forEach((tokenInfo) => {
      onImage(tokenInfo.tokenId.toNumber(), tokenInfo.collection, (imageInfo) => {
        const newTokenInfo = tokenInfo
        newTokenInfo.imageURI = imageInfo.imageURI
        newTokenInfo.name = imageInfo.name
        newTokenInfo.haveImage = true
        setTokens(
          tokens.map((item) => {
            return item.tokenId === newTokenInfo.tokenId ? newTokenInfo : item
          }),
        )
      })
    })
  }

  return (
    <Modal
      title={t(`${name}, Tickets per NFT Token Id`)}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="column">
        {tokens.length > 0 ? (
          tokens.map((nft, index) => {
            const currentTicket = new BigNumber(tickets[index].toString())
            return (
              <>
                {currentTicket.gt(0) && (
                  <Flex flexDirection="row" alignItems="center" justifyItems="space-between">
                    <Image key={nft.toString()} src={nft.imageURI} width={80} height={80} />

                    <Text>{t(`${nft.tokenId.toString()}:`)} </Text>

                    {currentTicket.toNumber() < 999 ? (
                      <Balance
                        value={currentTicket.toNumber()}
                        decimals={0}
                        unit={`${t('tickets Left')}`}
                        bold
                        mx="4px"
                      />
                    ) : (
                      <Text> {t('Forever Ticket')}</Text>
                    )}
                  </Flex>
                )}
              </>
            )
          })
        ) : (
          <Text>{nftIds.length !== 0 ? 'Loading Token List' : 'No NFTs eligible'}</Text>
        )}
      </Flex>
      <Divider />
      <ActionContainer>
        <ActionContent>
          <Button width="100%" variant="secondary" onClick={onDismiss}>
            Close
          </Button>
        </ActionContent>
      </ActionContainer>
    </Modal>
  )
}

export default ViewTicketsModal
