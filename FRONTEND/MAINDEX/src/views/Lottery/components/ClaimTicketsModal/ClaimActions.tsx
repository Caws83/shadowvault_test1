import React, { useState } from 'react'
import { Flex, Button, IconButton, AddIcon, MinusIcon, Text } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import { useAppDispatch } from 'state'
import { Token } from 'config/constants/types'
import { fetchUserTicketsAndLotteries } from 'state/lottery'
import { useClaimNFTTickets } from 'hooks/useNftContract'
import { useLottery } from 'state/lottery/hooks'

interface ClaimActionsProps {
  account: `0x${string}`
  lotteryToken: Token
  currentLotteryId: string
  howManySpots: number
}

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

// eslint-disable-next-line
const ClaimAction: React.FC<ClaimActionsProps> = ({ account, lotteryToken, currentLotteryId, howManySpots }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const l = useLottery(lotteryToken)
  const chainId = l.chainId
  const [claimNumber, setClaimNumber] = useState(1)

  const onClickAdd = () => {
    let newClaimNumber = claimNumber + 1

    if (newClaimNumber > howManySpots) {
      newClaimNumber = claimNumber
    }

    setClaimNumber(newClaimNumber)
  }

  const onClickMinus = () => {
    let newClaimNumber = claimNumber - 1
    if (newClaimNumber < 1) {
      newClaimNumber = 1
    }
    setClaimNumber(newClaimNumber)
  }

  const { handleClaimNFTTicketsV3 } = useClaimNFTTickets(lotteryToken.symbol, claimNumber, chainId)

  const onClickClaimV3 = () => {
    handleClaimNFTTicketsV3()
    dispatch(fetchUserTicketsAndLotteries({ account, currentLotteryId, lotteryToken, chainId }))
  }

  const canClaim = howManySpots > 0

  const renderBuyAction = () => {
    return (
      <>
        <Button style={{ marginTop: '15px' }} onClick={onClickClaimV3} disabled={!canClaim}>
          {t('Claim Tickets')}
        </Button>
        <Flex flexDirection="row" justifyContent="space-evenly" style={{ marginTop: '15px' }}>
          <IconButton variant="secondary" onClick={onClickMinus}>
            <MinusIcon color="primary" width="24px" height="24px" />
          </IconButton>
          <Text fontSize="24px">{claimNumber}</Text>
          <IconButton variant="secondary" onClick={onClickAdd}>
            <AddIcon color="primary" width="24px" height="24px" />
          </IconButton>
        </Flex>

        <Divider />
        <Text mb="16px">{t('By owning specific NFTs at a certain RARITY you can claim Free Lottery Tickets')}</Text>
        <Text mb="16px">{t('You can only claim free tickets ONCE per draw. So claim wisely.')}</Text>
      </>
    )
  }

  return <Flex flexDirection="column">{renderBuyAction()}</Flex>
}

export default ClaimAction
