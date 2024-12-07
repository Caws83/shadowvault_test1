import React, { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, Text, Heading } from 'uikit'
import { useLocation } from 'react-router-dom'
import { BigNumber } from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Balance from 'components/Balance'
import { useFarmUser, useHostPrice } from 'state/farms/hooks'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { useTranslation } from 'contexts/Localization'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getBalanceAmount, getBalanceNumber } from 'utils/formatBalance'
import { Farm } from 'state/types'
import { ActionContainer, ActionTitles, ActionContent } from './styles'
import EasyDepositModal from '../../Modals/EasyDepositModal'
import EasyWithdrawModal from '../../Modals/EasyWithdrawModal'
import { useAccount } from 'wagmi'

const IconButtonWrapper = styled.div`
  display: flex;
`

const CustomActionContainer = styled.div`
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.input};
  border-radius: 4px;
  box-sizing: border-box; // Ensure padding and border are included in the width
`;

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
  farm: Farm
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  id,
  apr,
  multiplier,
  lpSymbol,
  lpLabel,
  quoteToken,
  token,
  displayApr,
  host,
  pricePerToken,
  farm,
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chain } = useAccount()
  const showConnectButton = !account || chain.id !== farm.chainId
  const { tokenBalance, stakedBalance } = useFarmUser(id)
  const location = useLocation()
  const lpPrice = pricePerToken
  
  const getHostPrice = useHostPrice()
  const cantStake = ['history', 'archived'].some((item) => location.pathname.includes(item)) && !farm.host.isLocker

  const now = Date.now()
  const unLockTimeMs = new BigNumber(farm.unLockTime).multipliedBy(1000)
  const locked = unLockTimeMs.gt(now)
  const { isLocker } = farm.host

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(new BigNumber(stakedBalance))
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(8, BigNumber.ROUND_DOWN)
    }
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
      return stakedBalanceBigNumber.toFixed(6, BigNumber.ROUND_DOWN)
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  const [onPresentDeposit] = useModal(
    <EasyDepositModal
      max={new BigNumber(tokenBalance)}
      lpPrice={new BigNumber(lpPrice?.toString())}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      stakedBalance={new BigNumber(stakedBalance)}
      tokenName={lpSymbol}
      multiplier={multiplier}
      addLiquidityUrl={addLiquidityUrl}
      cakePrice={getHostPrice(host)}
      farm={farm}
    />,
    false,
  )
  const [onPresentWithdraw] = useModal(
    <EasyWithdrawModal farm={farm} max={new BigNumber(stakedBalance)} tokenName={farm.lpSymbol} />,
    false,
  )

  if (showConnectButton) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('Lets Go')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <ConnectWalletButton chain={farm.chainId}/>
        </ActionContent>
      </ActionContainer>
    )
  }

  if (new BigNumber(stakedBalance).gt(0)) {
    return (
      <CustomActionContainer>
      <ActionContainer>

        <ActionTitles>
          <Text bold textTransform="uppercase" color="secondary" fontSize="12px" pr="4px">
            {lpSymbol}
          </Text>
          <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px">
            {t('deposited')}
          </Text>
        </ActionTitles>
        
        <ActionContent>
          <div>
            <Heading>{displayBalance()}</Heading>
            {new BigNumber(stakedBalance).gt(0) && new BigNumber(lpPrice.toString()).gt(0) && (
              <Balance
                fontSize="12px"
                color="textSubtle"
                decimals={2}
                value={getBalanceNumber(new BigNumber(lpPrice.toString()).times(stakedBalance))}
                unit=" USD"
                prefix="~"
              />
            )}
          </div>
          <IconButtonWrapper>
            <IconButton variant="secondary" onClick={onPresentWithdraw} disabled={isLocker && locked} mr="6px">
              <MinusIcon color="primary" width="14px" />
            </IconButton>
           
              <IconButton variant="secondary" onClick={onPresentDeposit} disabled={cantStake}>
                <AddIcon color="primary" width="14px" />
              </IconButton>
           
          </IconButtonWrapper>
        </ActionContent>
      </ActionContainer>
      </CustomActionContainer>
    )
  }
 
    return (
      <CustomActionContainer>
      <ActionContainer>
  <ActionTitles>
    <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
      {t('Deposit').toUpperCase()}
    </Text>
    <Text bold textTransform="uppercase" color="secondary" fontSize="12px">
      {lpSymbol}
    </Text>
  </ActionTitles>
  <ActionContent>
    <Button width="100%" onClick={onPresentDeposit} variant="primary" disabled={cantStake}>
      {t('Deposit')}
    </Button>
  </ActionContent>
</ActionContainer>
</CustomActionContainer>
    )
  

  


}

export default Staked
