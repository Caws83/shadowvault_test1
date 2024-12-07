import React, { useState } from 'react'
import { Button, AutoRenewIcon, useMatchBreakpoints } from 'uikit'
import { Game } from 'state/types'
import { useCoinFlipApprove } from 'views/Games/hooks/useApprove'
import BigNumber from 'bignumber.js'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import styled from 'styled-components'
import GameAction from './GameActions'
import ExpandActionCell from '../../ExpandActionCell'
import InfoCell from '../../infoCell.'

const StyledRow = styled.div`
  background-color: transparent;
  display: flex;
  cursor: pointer;
  flex-direction: column;
`

interface GameActionProps {
  game: Game
  tokenPrice: number
}

const CardActions: React.FC<GameActionProps> = ({ game, tokenPrice }) => {
  const { maxBetAmount, userData } = game
  const loaded = userData !== undefined
  const { handleCoinFlipApprove, requestedCoinFlipApproval } = useCoinFlipApprove(game)
  const onApprove = () => {
    handleCoinFlipApprove()
  }
  const { isTablet, isDesktop } = useMatchBreakpoints()
  const [expanded, setExpanded] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)

  const toggleExpanded = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <>
      <StyledRow onClick={toggleExpanded}>
        <ExpandActionCell expanded={expanded} isFullLayout={isTablet || isDesktop} />
        {shouldRenderActionPanel && <InfoCell game={game} tokenPrice={tokenPrice} />}
      </StyledRow>
      {userData && new BigNumber(userData.allowance.toString()).gte(new BigNumber(maxBetAmount.toString())) ? (
        <GameAction game={game} expanded={expanded} tokenPrice={tokenPrice} />
      ) : (
        <Button
          isLoading={requestedCoinFlipApproval || !loaded}
          endIcon={requestedCoinFlipApproval ? <AutoRenewIcon spin color="currentColor" /> : null}
          disabled={requestedCoinFlipApproval}
          onClick={onApprove}
          width="100%"
        >
          Approve
        </Button>
      )}
    </>
  )
}

export default CardActions
