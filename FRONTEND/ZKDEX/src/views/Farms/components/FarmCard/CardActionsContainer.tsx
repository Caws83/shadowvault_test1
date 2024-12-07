import React from 'react'
import styled from 'styled-components'
import { Button, Flex, Text, useModal } from 'uikit'
import { Farm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'
import BigNumber from 'bignumber.js'



const Action = styled.div`
  padding-top: 16px;
`


export interface FarmWithStakedValue extends Farm {
  apr?: number
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  addLiquidityUrl?: string
  cakePrice?: BigNumber
  lpLabel?: string
  pricePerToken?: BigNumber
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, addLiquidityUrl, lpLabel, pricePerToken }) => {
  const { t } = useTranslation()
  const {
    tokenBalance: tokenBalanceAsString = 0n,
    stakedBalance: stakedBalanceAsString = 0n,
    earnings: earningsAsString = 0n,
  } = farm.userData || {}
  const tokenBalance = new BigNumber(tokenBalanceAsString.toString())
  const stakedBalance = new BigNumber(stakedBalanceAsString.toString())
  const earnings = new BigNumber(earningsAsString.toString())

  

  return (
    <Action>
      {earnings.gt(0) && (
        <>
      <Flex >
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {farm.host.payoutToken.symbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Earned')}
        </Text>
      </Flex>
      <HarvestAction earnings={new BigNumber(earnings.toString())} host={farm.host} farm={farm} />
      <Flex>
        <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
          {farm.lpSymbol}
        </Text>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
          {t('Staked')}
        </Text>
      </Flex>
      </>
      )}
      <StakeAction
        stakedBalance={stakedBalance}
        tokenBalance={tokenBalance}
        tokenName={farm.lpSymbol}
        apr={farm.apr}
        lpLabel={lpLabel}
        lpSymbol={farm.lpSymbol}
        addLiquidityUrl={addLiquidityUrl}
        farm={farm}
        pricePerToken={pricePerToken}
      />
      
      
    </Action>
  )
}

export default CardActions
