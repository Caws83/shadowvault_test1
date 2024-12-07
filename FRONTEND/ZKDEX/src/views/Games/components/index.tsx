import React from 'react'

import { GameType } from 'config/constants/types'
import { Game } from 'state/types'
import { useGetTokenPrice } from 'hooks/useBUSDPrice'
import FlipCard from './FlipCard'
import DeckCut from './DeckCut'
import DiceCall from './DiceCall'
import HighCard from './HighCard'
import BlackJack from './BlackJack'
import HighRoller from './HighRoller'
import LowRoller from './LowRoller'
import SuitCall from './SuitCall'
import BlackRed from './BlackRed'
import HorseRace from './HorseRace'
import Scratchers from './Scratchers'

const GameCardMain: React.FC<{ game: Game; account: string; gametype: GameType }> = ({ game, account, gametype }) => {
  const TokenPriceRaw = useGetTokenPrice(game.dex, game.payToken)
  const tokenPrice = Number(TokenPriceRaw)

  const renderGame = (type: GameType) => {
    switch (type) {
      case GameType.COINFLIP:
        return <FlipCard game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.DECKCUT:
        return <DeckCut game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.DICECALL:
        return <DiceCall game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.HIGHLOW:
        return <HighCard game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.BLACKJACK:
        return <BlackJack game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.HIGHROLLER:
        return <HighRoller game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.LOWROLLER:
        return <LowRoller game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.SUITCALL:
        return <SuitCall game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.BLACKRED:
        return <BlackRed game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.HORSERACE:
        return <HorseRace game={game} account={account} tokenPrice={tokenPrice} />
      case GameType.SCRATCHERS:
        return <Scratchers game={game} account={account} />

      default:
        return <div>Failed to get game type</div>
    }
  }

  return <div key={gametype}>{renderGame(gametype)}</div>
}

export default GameCardMain
