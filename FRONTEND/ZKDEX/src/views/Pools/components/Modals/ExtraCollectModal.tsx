import React from 'react'
import { Modal, Text, Flex, Button, Skeleton } from 'uikit'
import useTheme from 'hooks/useTheme'
import { useGetBnbBalanceTarget, useTokenBalanceTarget } from 'hooks/useTokenBalance'
import { getAddress } from 'utils/addressHelpers'
import { getFullDisplayBalance } from 'utils/formatBalance'
import tokens from 'config/constants/tokens'
import { Pool } from 'state/types'
import BigNumber from 'bignumber.js'
import { ActionContainer, ActionContent } from '../PoolsTable/ActionPanel/styles'
import { useExtraTokens } from './hooks/ExtraTokenCalls'
import Column from 'components/Layout/Column'
import styled from 'styled-components'

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;

  margin-bottom: 30px;
  grid-template-columns: repeat(2, auto);
`
interface ExtraTokenModalProps {
  pool: Pool
  onDismiss?: () => void
}

const ExtraTokenModal: React.FC<ExtraTokenModalProps> = ({ pool, onDismiss }) => {
  const { theme } = useTheme()
  const handleDismiss = async () => {
    onDismiss()
  }
  const { onES, onER, onWES, onWER, onBNB, onBUSD } = useExtraTokens(pool)
  const { stakingToken, earningToken, earningTokenPrice, stakingTokenPrice, contractAddress } = pool

  const poolAddress = getAddress(contractAddress, pool.chainId)

  const { balance: balanceRaw } = useGetBnbBalanceTarget(poolAddress, pool.chainId)
  const balance = new BigNumber(balanceRaw.toString())
  const { balance: BUSDBalanceRaw } = useTokenBalanceTarget(getAddress(tokens.vusd.address, pool.chainId), poolAddress, pool.chainId)
  const BUSDBalance = new BigNumber(BUSDBalanceRaw.toString())
  const extraStaked = onES()
  const extraReward = onER()

  const loaded = extraReward !== undefined && extraStaked !== undefined && stakingTokenPrice !== undefined

  const onClickStaked = () => {
    onWES()
  }

  const onClickReward = () => {
    onWER()
  }
  const onClickBNB = () => {
    onBNB()
  }

  const onClickBUSD = () => {
    onBUSD()
  }

  return (
    <Modal
      minWidth="346px"
      title="Extra Tokens Withdrawl Page"
      onDismiss={handleDismiss}
      headerBackground={(theme as any).colors.gradients.cardHeader}
    >
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Staking Token:</Text>
        <Text color="primary">{stakingToken.name}</Text>
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text>{`Extra ${stakingToken.symbol}:`}</Text>
        {!loaded ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
              <Text>
                {new BigNumber(extraStaked).shiftedBy(-stakingToken.decimals).toFixed(4)} {stakingToken.symbol}{' '}
              </Text>
              <Text fontSize="14x" color="secondary">
                $ {new BigNumber(extraStaked).times(stakingTokenPrice).shiftedBy(-stakingToken.decimals).toFixed(2)}{' '}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Reward Token:</Text>
        <Text color="primary">{earningToken.symbol}</Text>
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-start">
        <Text>{`Extra ${earningToken.symbol}:`}</Text>
        {!loaded ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
              <Text>
                {new BigNumber(extraReward).shiftedBy(-earningToken.decimals).toFixed(4)} {earningToken.symbol}
              </Text>
              <Text fontSize="14px" color="secondary">
                $ {new BigNumber(extraReward).times(earningTokenPrice).shiftedBy(-earningToken.decimals).toFixed(2)}{' '}
              </Text>
            </Flex>
          </>
        )}
      </Flex>
      <Flex alignItems="center" justifyContent="space-between">
        <Text color="textSubtle">Native Balance</Text>
        <Text>{getFullDisplayBalance(balance, 18, 6)}</Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" mb="24px">
        <Text color="textSubtle">USDT Balance</Text>
        <Text>{getFullDisplayBalance(BUSDBalance, 18, 3)}</Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" mb="24px">
       <Text color="primary">WITHDRAW EXTRA:</Text>
    </Flex>
     {new BigNumber(extraStaked).lt(1) ? <Flex alignItems="center" justifyContent="space-between" mb="24px">
       <Text color="textSubtle">Nothing extra to withdraw.</Text>
    </Flex> :
      
 <Grid>
  
          <Button   variant="secondary" onClick={onClickStaked} disabled={new BigNumber(extraStaked).lt(1)}>
            Staked
          </Button>
         
          <Button variant="secondary" onClick={onClickReward} disabled={new BigNumber(extraReward).lt(1)}>
            Reward
          </Button>
   
  
 
          <Button variant="secondary" onClick={onClickBNB} disabled={balance.lt(1)}>
            Native
          </Button>

          <Button  variant="secondary" onClick={onClickBUSD} disabled={BUSDBalance.lt(1)}>
            USDT
          </Button>
      
          </Grid>}
          <Flex alignItems="center" justifyContent="center" mb="20px">
      <Button  variant="primary" onClick={handleDismiss}>
        Close
      </Button>
      </Flex>
    </Modal>
  )
}

export default ExtraTokenModal
