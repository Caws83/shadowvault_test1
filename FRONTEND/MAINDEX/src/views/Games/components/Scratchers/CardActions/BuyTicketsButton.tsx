import React, { useState } from 'react'
import { Button, useModal, WaitIcon, ButtonProps, Flex } from 'uikit'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { Game } from 'state/types'
import { usePriceBnbBusd } from 'state/farms/hooks'
import { useScratcher } from 'views/Games/hooks/scratcher'
import BigNumber from 'bignumber.js'
import ResultJackPotModal from '../modals/resultJackPotModal'

interface BuyTicketsButtonProps extends ButtonProps {
  disabled?: boolean
  game: Game
}

const BuyTicketsButton: React.FC<BuyTicketsButtonProps> = ({ disabled, game, ...props }) => {
  const { jackPotCost, jackPot } = game.scratcher
  const { onjack } = useScratcher(game)
  const { balance: bnbBalance } = useGetBnbBalance(game.chainId)
  const bnbPrice = usePriceBnbBusd(game.dex)
  const jackPotTotal = jackPot ? new BigNumber(jackPot).multipliedBy(bnbPrice).shiftedBy(-18).toNumber() : 0
  const canJack = bnbBalance.gt(jackPotCost) && jackPotTotal > 500
  const [playing, setPlaying] = useState<boolean>(false)

  const [onPresentJackPotModal] = useModal(<ResultJackPotModal game={game} />, false, true, 'JackPot')

  const getBuyButtonText = () => {
    if (canJack) {
      return 'Try for JackPot'
    }
    return (
      <>
        <WaitIcon mr="4px" color="textDisabled" /> Let it Grow!
      </>
    )
  }

  const onClickJackPot = async () => {
    setPlaying(true)
    onPresentJackPotModal()
    await onjack()
    setPlaying(false)
  }

  if (playing) {
    return (
      <Flex dir="row" justifyContent="space-evenly">
        <img src={`/images/games/${game.folder}/scratchers/scratchJackpot.gif`} alt="Scratching" />
      </Flex>
    )
  }

  return (
    <Button {...props} disabled={disabled || !canJack} onClick={onClickJackPot}>
      {getBuyButtonText()}
    </Button>
  )
}

export default BuyTicketsButton
