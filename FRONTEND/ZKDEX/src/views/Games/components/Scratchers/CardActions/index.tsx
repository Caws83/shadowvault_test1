import React from 'react'
import styled from 'styled-components'
import { Flex, Skeleton, Text } from 'uikit'
import BigNumber from 'bignumber.js'
import { Game } from 'state/types'
import { TITLE_BG } from 'views/Lottery/pageSectionStyles'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import Balance from 'components/Balance'
import { usePriceBnbBusd } from 'state/farms/hooks'
import PageSection from 'components/PageSection'
import FlipAction from './FlipActions'
import Hero from './hero'

interface flipActionProps {
  game: Game
}

const PrizeTotalBalance = styled(Balance)`
  background: ${({ theme }) => theme.colors.gradients.gold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const CardActions: React.FC<flipActionProps> = ({ game }) => {
  const { scratcher } = game
  const { jackPot, jackPotCost, jackPotChance } = scratcher
  const { balance: bnbBalance } = useGetBnbBalance(game.chainId)
  const bnbPrice = usePriceBnbBusd(game.dex)

  const chanceForJacpot = new BigNumber(1).dividedBy(jackPotChance.toString()).multipliedBy(100)
  const prizeTotal = jackPot
    ? new BigNumber(jackPot.toString()).multipliedBy(bnbPrice.toString()).shiftedBy(-18).toNumber()
    : 0

  return game === undefined ? (
    <Skeleton width="80px" height="16px" />
  ) : (
    <>
      <FlipAction game={game} />

      <PageSection background={TITLE_BG} index={1} hasCurvedDivider={false}>
        {jackPot === undefined ? (
          <Skeleton my="7px" height={60} width={190} />
        ) : (
          <>
            <PrizeTotalBalance
              fontSize="64px"
              bold
              prefix="$"
              value={prizeTotal}
              mb="8px"
              decimals={2}
              textAlign="center"
            />
          </>
        )}

        <Hero game={game} />
      </PageSection>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">jackPot Ticket Price:</Text>
        {bnbBalance === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
            <Text fontSize="14px">{new BigNumber(jackPotCost.toString()).shiftedBy(-18).toFixed(4)} BONE </Text>
            <Text fontSize="10px" color="textSubtle">
              {new BigNumber(jackPotCost.toString()).multipliedBy(bnbPrice.toString()).shiftedBy(-18).toFixed(2)} USD
            </Text>
          </Flex>
        )}
      </Flex>

      {jackPotChance && <Text textAlign="center">{`Chance to Win JackPot: ${chanceForJacpot.toFixed(2)}%`} </Text>}
    </>
  )
}

export default CardActions
