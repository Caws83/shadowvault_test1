import React, { useState } from 'react'
import styled from 'styled-components'
import { useMatchBreakpoints } from 'uikit'
import { PLottery } from 'state/types'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import { useFetchLottery, useLotteryDex, useLottery } from 'state/lottery/hooks'
import { useLottoPrice } from 'views/Lottery/helpers'
import useStatusTransitions from 'views/Lottery/hooks/useStatusTransitions'
import NameCell from './Cells/NameCell'
import PotAmountCell from './Cells/PotAmountCell'
import DrawDateCell from './Cells/DrawDateCell'
import ActionPanel from './ActionPanel/ActionPanel'
import ExpandActionCell from './Cells/ExpandActionCell'
import BigNumber from 'bignumber.js'

interface PLotteryRowProps {
  plottery: PLottery
  userDataLoaded: boolean
  account: string
}

const StyledRow = styled.div`
  background-color: transparent;
  display: flex;
  cursor: pointer;
`

const PLotteryRow: React.FC<PLotteryRowProps> = ({ plottery, userDataLoaded, account }) => {
  const { isTablet, isDesktop } = useMatchBreakpoints()
  const [expanded, setExpanded] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)
  const { lotteryToken, chainId } = plottery

  useFetchLottery(lotteryToken, chainId)
  useStatusTransitions(lotteryToken)

  const { currentRound } = useLottery(lotteryToken)
  const { amountCollectedInCake } = currentRound

  const dex = useLotteryDex(lotteryToken)
  const lottoPrice = useLottoPrice(lotteryToken, dex)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <>
      <StyledRow role="row" onClick={toggleExpanded}>
        <NameCell plottery={plottery} />

        <PotAmountCell
          plottery={plottery}
          amountCollectedInCake={new BigNumber(amountCollectedInCake.toString())}
          lottoPrice={new BigNumber(lottoPrice.toString())}
        />

        <DrawDateCell endTime={currentRound.endTime} />

        <ExpandActionCell expanded={expanded} isFullLayout={isTablet || isDesktop} />
      </StyledRow>

      {shouldRenderActionPanel && (
        <ActionPanel
          account={account}
          plottery={plottery}
          expanded={expanded}
          lottoPrice={new BigNumber(lottoPrice.toString())}
          userDataLoaded={userDataLoaded}
        />
      )}
    </>
  )
}

export default PLotteryRow
