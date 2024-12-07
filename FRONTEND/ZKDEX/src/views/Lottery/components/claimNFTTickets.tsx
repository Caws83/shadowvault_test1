import React from 'react'
import { Button, useModal, WaitIcon, ButtonProps } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useLottery } from 'state/lottery/hooks'
import { LotteryStatus, Token } from 'config/constants/types'
import ClaimNFTTicketsModal from './ClaimTicketsModal/ClaimNFTTicketsModal'

interface ClaimTicketsButtonProps extends ButtonProps {
  disabled?: boolean
  lotteryToken: Token
  howMany: number
}

const ClaimTicketsButton: React.FC<ClaimTicketsButtonProps> = ({ disabled, lotteryToken, howMany, ...props }) => {
  const { t } = useTranslation()

  const {
    currentRound: { status },
    currentLotteryId,
  } = useLottery(lotteryToken)

  const [onPresentClaimNFTTicketModal] = useModal(
    <ClaimNFTTicketsModal lotteryToken={lotteryToken} currentLotteryId={currentLotteryId} howManySpots={howMany} />,
  )

  const amount = () => {
    if (howMany !== undefined) return howMany
    return 0
  }

  const getBuyButtonText = () => {
    if (disabled && status === LotteryStatus.OPEN) {
      return t('Claimed')
    }
    if (status === LotteryStatus.OPEN) {
      return t(`Claim up to ${amount()} Tickets`)
    }

    return (
      <>
        <WaitIcon mr="4px" color="textDisabled" /> {t('On sale soon!')}
      </>
    )
  }

  return (
    <Button {...props} disabled={disabled} onClick={onPresentClaimNFTTicketModal}>
      {getBuyButtonText()}
    </Button>
  )
}

export default ClaimTicketsButton
