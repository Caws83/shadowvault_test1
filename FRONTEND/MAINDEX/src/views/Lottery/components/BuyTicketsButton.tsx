import React from 'react'
import { Button, useModal, WaitIcon, ButtonProps } from 'uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { useLottery } from 'state/lottery/hooks'
import { LotteryStatus, Token } from 'config/constants/types'
import BuyTicketsModal from './BuyTicketsModal/BuyTicketsModal'

interface BuyTicketsButtonProps extends ButtonProps {
  disabled?: boolean
  lotteryToken: Token
  lottoPrice: BigNumber
}

const BuyTicketsButton: React.FC<BuyTicketsButtonProps> = ({ disabled, lotteryToken, lottoPrice, ...props }) => {
  const { t } = useTranslation()
  const [onPresentBuyTicketsModal] = useModal(<BuyTicketsModal lotteryToken={lotteryToken} lottoPrice={lottoPrice} />)
  const {
    currentRound: { status },
  } = useLottery(lotteryToken)

  const getBuyButtonText = () => {
    if (status === LotteryStatus.OPEN) {
      return t('Buy Tickets')
    }
    return (
      <>
        <WaitIcon mr="4px" color="textDisabled" /> {t('On sale soon!')}
      </>
    )
  }

  return (
    <Button {...props} disabled={disabled} onClick={onPresentBuyTicketsModal}>
      {getBuyButtonText()}
    </Button>
  )
}

export default BuyTicketsButton
