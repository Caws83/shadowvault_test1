import React from 'react'
import { Flex, Text, Skeleton } from 'uikit'
import { Game } from 'state/types'
import BigNumber from 'bignumber.js'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { getAddress } from 'utils/addressHelpers'
import { useAccount } from 'wagmi'

interface InfoCellProps {
  game: Game
  tokenPrice: number
}

const InfoCell: React.FC<InfoCellProps> = ({ game, tokenPrice }) => {
  const { payToken, maxBetAmount, quickBetAmount, displayDecimals, userData } = game
  const { address: account } = useAccount()

  return (
    <>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Token:</Text>
        <Text color="body">{payToken.name}</Text>
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Balance:</Text>
        {userData.balance === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
            <Text fontSize="14px">
              {new BigNumber(userData.balance.toString()).shiftedBy(-payToken.decimals).toFixed(displayDecimals)}{' '}
              {payToken.symbol}{' '}
            </Text>
            <Text fontSize="10px" color="textSubtle">
              {new BigNumber(userData.balance.toString())
                .multipliedBy(tokenPrice)
                .shiftedBy(-payToken.decimals)
                .toFixed(displayDecimals)}{' '}
              USD
            </Text>
          </Flex>
        )}
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Min Bet:</Text>
        {quickBetAmount === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
            <Text fontSize="14px">
              {new BigNumber(quickBetAmount.toString()).shiftedBy(-payToken.decimals).toFixed(displayDecimals)}{' '}
              {payToken.symbol}
            </Text>
            <Text fontSize="10px" color="textSubtle">
              {new BigNumber(quickBetAmount.toString())
                .multipliedBy(tokenPrice)
                .shiftedBy(-payToken.decimals)
                .toFixed(displayDecimals)}{' '}
              USD
            </Text>
          </Flex>
        )}
      </Flex>
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">Max Bet:</Text>
        {maxBetAmount === undefined ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <Flex flexDirection="column" justifyContent="space-between" alignItems="flex-end">
            <Text fontSize="14px">
              {new BigNumber(maxBetAmount.toString()).shiftedBy(-payToken.decimals).toFixed(displayDecimals)}{' '}
              {payToken.symbol}
            </Text>
            <Text fontSize="10px" color="textSubtle">
              {new BigNumber(maxBetAmount.toString())
                .multipliedBy(tokenPrice)
                .shiftedBy(-payToken.decimals)
                .toFixed(displayDecimals)}{' '}
              USD
            </Text>
          </Flex>
        )}
      </Flex>
      {account && (
        <AddToWalletButton
          tokenAddress={getAddress(payToken.address, game.chainId)}
          tokenSymbol={payToken.symbol}
          tokenDecimals={payToken.decimals}
        />
      )}
    </>
  )
}

export default InfoCell
