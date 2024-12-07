import { Flex, Modal } from 'uikit'
import { Game } from 'state/types'
import useTheme from 'hooks/useTheme'
import React from 'react'

interface AnimationModalProps {
  game: Game
  gameType: string
}

const Animations: React.FC<AnimationModalProps> = ({ game, gameType }) => {
  const { theme } = useTheme()

  const getImage = () => {
    if (gameType === 'coin') {
      return <img src={`/images/games/${game.folder}/coinflip/flipping.gif`} alt="flipping coin" />
    }
    if (gameType === 'dice') {
      return <img src={`/images/games/${game.folder}/dice/diceroll.gif`} alt="Rolling Dice" />
    }
    if (gameType === 'horse') {
      return <img src={`/images/games/${game.folder}/horses/horserace.gif`} alt="race is on" />
    }
    return <img src={`/images/games/${game.folder}/deckcut/cardflip.gif`} alt="Shuffling" />
  }

  return (
    <Modal
      minWidth="346px"
      title="Results"
      headerBackground={(theme as any).colors.gradients.cardHeader}
      overflow="none"
    >
      <Flex dir="row" justifyContent="space-evenly">
        {getImage()}
      </Flex>
    </Modal>
  )
}

export const Animation: React.FC<AnimationModalProps> = ({ game, gameType }) => {
  const getImage = () => {
    if (gameType === 'coin') {
      return <img src={`/images/games/${game.folder}/coinflip/flipping.gif`} alt="flipping coin" />
    }
    if (gameType === 'dice') {
      return <img src={`/images/games/${game.folder}/dice/diceroll.gif`} alt="Rolling Dice" />
    }
    if (gameType === 'horse') {
      return <img src={`/images/games/${game.folder}/horses/horserace.gif`} alt="race is on" />
    }

    return <img src={`/images/games/${game.folder}/deckcut/cardflip.gif`} alt="Shuffling" />
  }

  return (
    <Flex dir="row" justifyContent="space-evenly">
      {getImage()}
    </Flex>
  )
}

export default Animations
