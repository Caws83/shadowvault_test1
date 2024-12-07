import React from 'react'
import styled from 'styled-components'
import { Modal } from 'uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { LotteryStatus, Token } from 'config/constants/types'
import { useLottery } from 'state/lottery/hooks'
import useTheme from 'hooks/useTheme'
import PreviousRoundTicketsInner from './PreviousRoundTicketsInner'
import CurrentRoundTicketsInner from './CurrentRoundTicketsInner'

const StyledModal = styled(Modal)`
  min-width: 280px;
  max-width: 320px;
`

interface ViewTicketsModalProps {
  lotteryToken: Token
  roundId: string
  roundStatus?: LotteryStatus
  lottoPrice: BigNumber
  onDismiss?: () => void
}

const ViewTicketsModal: React.FC<ViewTicketsModalProps> = ({
  lotteryToken,
  onDismiss,
  roundId,
  roundStatus,
  lottoPrice,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentLotteryId } = useLottery(lotteryToken)
  const isPreviousRound = roundStatus?.toLowerCase() === LotteryStatus.CLAIMABLE || roundId !== currentLotteryId

  return (
    <StyledModal
      title={`${t('Round')} ${roundId}`}
      onDismiss={onDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      {isPreviousRound ? (
        <PreviousRoundTicketsInner roundId={roundId} lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
      ) : (
        <CurrentRoundTicketsInner lotteryToken={lotteryToken} lottoPrice={lottoPrice} />
      )}
    </StyledModal>
  )
}

export default ViewTicketsModal
