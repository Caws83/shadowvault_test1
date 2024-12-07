import React, { useState } from 'react'
import { Flex } from 'uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Game } from 'state/types'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import { StyledCard } from '../StyledCard'
import StyledCardHeader from './StyledCardHeader'
import CardFooter from './CardFooter'
import CardActions from './CardActions'
import Wrapper from '../Wrapper'

const CoinFlipCard: React.FC<{ game: Game; account: string; tokenPrice: number }> = ({ game, account, tokenPrice }) => {
  const GameName = 'Low Roller'
  const { CasinoName, folder } = game

  const [play, setPlay] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(play, 300)
  const togglePlay = () => {
    setPlay((prev) => !prev)
  }

  return (
    <StyledCard>
      <Wrapper onClick={togglePlay}>
        <StyledCardHeader GameName={GameName} CasinoName={CasinoName} folder={folder} />
      </Wrapper>
      {shouldRenderActionPanel && (
        <>
          <Flex flexDirection="column">
            {account ? (
              <CardActions game={game} tokenPrice={tokenPrice} />
            ) : (
              <>
                <ConnectWalletButton chain={game.chainId}/>
              </>
            )}
          </Flex>
          <CardFooter game={game} />
        </>
      )}
    </StyledCard>
  )
}

export default CoinFlipCard
