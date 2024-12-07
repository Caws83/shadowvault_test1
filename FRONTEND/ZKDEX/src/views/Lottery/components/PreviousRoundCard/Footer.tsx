import React, { useState } from 'react'
import { Flex, ExpandableLabel, CardFooter } from 'uikit'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { LotteryRound } from 'state/types'
import { Token } from 'config/constants/types'
import FooterExpanded from './FooterExpanded'

interface PreviousRoundCardFooterProps {
  lotteryNodeData: LotteryRound
  lotteryId: string
  lotteryToken: Token
  lottoPrice: BigNumber
}

const PreviousRoundCardFooter: React.FC<PreviousRoundCardFooterProps> = ({
  lotteryNodeData,
  lotteryId,
  lotteryToken,
  lottoPrice,
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <CardFooter p="0">
      <Flex p="8px 24px" alignItems="center" justifyContent="center">
        <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? t('Hide') : t('Reward Breakdown')}
        </ExpandableLabel>
      </Flex>
      {isExpanded && (
        <FooterExpanded
          lotteryNodeData={lotteryNodeData}
          lotteryId={lotteryId}
          lotteryToken={lotteryToken}
          lottoPrice={lottoPrice}
        />
      )}
    </CardFooter>
  )
}

export default PreviousRoundCardFooter
