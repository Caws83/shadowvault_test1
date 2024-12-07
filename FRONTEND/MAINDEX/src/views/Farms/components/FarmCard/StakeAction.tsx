import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, IconButton, AddIcon, MinusIcon, useModal } from 'uikit'
import { useLocation } from 'react-router-dom'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { FarmConfig } from 'config/constants/types'
import { useHostPrice, useLpTokenPrice } from 'state/farms/hooks'
import { getBalanceAmount, getBalanceNumber } from 'utils/formatBalance'

import EasyDepositModal from '../Modals/EasyDepositModal'
import EasyWithdrawModal from '../Modals/EasyWithdrawModal'

interface FarmCardActionsProps {
  stakedBalance?: BigNumber
  tokenBalance?: BigNumber
  tokenName?: string
  multiplier?: string
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  lpLabel?: string
  lpSymbol?: string
  farm: FarmConfig
  pricePerToken: BigNumber
}

const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
  }
`

const StakeAction: React.FC<FarmCardActionsProps> = ({
  stakedBalance,
  tokenBalance,
  tokenName,
  multiplier,
  apr,
  displayApr,
  addLiquidityUrl,
  lpLabel,
  lpSymbol,
  farm,
  pricePerToken,
}) => {
  const { t } = useTranslation()
  const location = useLocation()
  const lpPrice = pricePerToken
  const getHostPrice = useHostPrice()

 
  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return '<0.0000001'
    }
    if (stakedBalanceBigNumber.gt(0)) {
      return stakedBalanceBigNumber.toFixed(4, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  const [onPresentDeposit] = useModal(
    <EasyDepositModal
      max={tokenBalance}
      lpPrice={new BigNumber(lpPrice?.toString())}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      stakedBalance={stakedBalance}
      tokenName={lpSymbol}
      multiplier={multiplier}
      addLiquidityUrl={addLiquidityUrl}
      cakePrice={getHostPrice(farm.host)}
      fgPrice={0}
      farm={farm}
    />,
    false,
  )

  const [onPresentWithdraw] = useModal(
    <EasyWithdrawModal max={stakedBalance} farm={farm} tokenName={tokenName} />,
    false,
  )

  const renderStakingButtons = () => {
    return stakedBalance.eq(0) ? (
      <Button
        onClick={onPresentDeposit}
        disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
      >
        {t('Deposit LP')}
      </Button>
    ) : (
      <IconButtonWrapper>
        <IconButton variant="tertiary" onClick={onPresentWithdraw} mr="6px">
          <MinusIcon color="primary" width="14px" />
        </IconButton>
        <IconButton
          variant="tertiary"
          onClick={onPresentDeposit}
          disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
        >
          <AddIcon color="primary" width="14px" />
        </IconButton>
      </IconButtonWrapper>
    )
  }

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Flex flexDirection="row" alignItems="flex-start" >
        <Heading mr="4px" color={stakedBalance.eq(0) ? 'textDisabled' : 'text'}>{displayBalance()}</Heading>
        {stakedBalance.gt(0) && new BigNumber(lpPrice.toString()).gt(0) && (
          <Balance
            fontSize="8px"
            color="textSubtle"
            decimals={2}
            value={getBalanceNumber(new BigNumber(lpPrice.toString()).times(stakedBalance))}
            unit=" USD"
            prefix="~"
          />
        )}
      </Flex>
      {renderStakingButtons()}
    </Flex>
  )
}

export default StakeAction
