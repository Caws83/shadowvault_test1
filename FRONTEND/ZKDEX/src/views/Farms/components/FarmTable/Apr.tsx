import React from 'react'
import styled from 'styled-components'
import ApyButton from 'views/Farms/components/FarmCard/ApyButton'
import { Address, Token } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { Skeleton } from 'uikit'

export interface AprProps {
  value: string
  multiplier: string
  id: number
  pid: number
  lpLabel: string
  lpSymbol: string
  tokenAddress?: Address
  quoteTokenAddress?: Address
  payoutToken: Token
  cakePrice: BigNumber
  originalValue: number
  hideButton?: boolean
}

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};

  button {
    width: 20px;
    height: 20px;

    svg {
      path {
        fill: ${({ theme }) => theme.colors.textSubtle};
      }
    }
  }
`

const AprWrapper = styled.div`
  min-width: 60px;
  text-align: left;
`

const Apr: React.FC<AprProps> = ({
  id,
  pid,
  lpLabel,
  lpSymbol,
  multiplier,
  tokenAddress,
  quoteTokenAddress,
  payoutToken,
  cakePrice,
  originalValue,
  hideButton = false,
}) => {
  const liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAddress, tokenAddress })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  // const displayOrigValue = Math.round(originalValue)
  const displayOrigValue = originalValue ? originalValue.toFixed(0) : 0
  return originalValue ? (
    <Container>
      {originalValue < 100000000 ? (
        <ApyButton
          variant={hideButton ? 'text' : 'text-and-button'}
          id={id}
          pid={pid}
          lpSymbol={lpSymbol}
          lpLabel={lpLabel}
          multiplier={multiplier}
          cakePrice={cakePrice}
          apr={Math.round(originalValue)}
          displayApr={displayOrigValue.toString()}
          addLiquidityUrl={addLiquidityUrl}
          earningToken={payoutToken}
        />
      ) : (
        <AprWrapper>
          <Skeleton width={40} />
        </AprWrapper>
      )}
    </Container>
  ) : (
    <Container>
      <AprWrapper>{Math.round(0)}%</AprWrapper>
    </Container>
  )
}

export default Apr
