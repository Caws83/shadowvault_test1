import React, { useState } from 'react'
import { Button, Flex, useModal } from 'uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Game } from 'state/types'
import contracts from 'config/constants/contracts'
import { getAddress } from 'utils/addressHelpers'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import ManagerModal from 'views/Games/modals/CasinoManagerModal'
import { StyledCard } from '../StyledCard'
import StyledCardHeader from './StyledCardHeader'
import CardFooter from './CardFooter'
import CardActions from './CardActions'
import Wrapper from '../Wrapper'
import { useAccount } from 'wagmi'

const HighCardCard: React.FC<{ game: Game; account: string; tokenPrice: number }> = ({ game, account, tokenPrice }) => {
  const GameName = 'Black Jack'
  const { CasinoName, folder } = game

  const [play, setPlay] = useState(false)
  const { chain } = useAccount()
  const showConnectButton = !account || chain.id !== 109
  const shouldRenderActionPanel = useDelayedUnmount(play, 300)
  const togglePlay = () => {
    setPlay((prev) => !prev)
  }

  const [onPresentManage] = useModal(<ManagerModal game={game} account={account} />)
  const showSub = account === getAddress(contracts.farmWallet, game.chainId)

  return (
    <StyledCard>
      <Wrapper onClick={togglePlay}>
        <StyledCardHeader GameName={GameName} CasinoName={CasinoName} folder={folder} />
      </Wrapper>
      {shouldRenderActionPanel && (
        <>
          <Flex flexDirection="column">
            {!showConnectButton ? (
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
      {shouldRenderActionPanel && showSub && (
        <Button width="100%" onClick={onPresentManage} variant="secondary">
          Managment
        </Button>
      )}
    </StyledCard>
  )
}

export default HighCardCard
