import React from 'react'
import styled from 'styled-components'
import { HelpIcon, Text, Skeleton, useTooltip } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'

const ReferenceElement = styled.div`
  display: inline-block;
`

export interface LiquidityPriceProps {
  liquidity: BigNumber
  pricePerToken: BigNumber
  totalSupply: BigNumber
  totalStaked: BigNumber
}

const LiquidityWrapper = styled.div`
  min-width: 110px;
  font-weight: 600;
  text-align: right;
  margin-right: 14px;
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

const LiquidityPrice: React.FunctionComponent<LiquidityPriceProps> = ({ pricePerToken }) => {
  const displayPrice =
    pricePerToken && pricePerToken.gt(0) ? (
      `$${Number(pricePerToken).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    ) : (
      <Skeleton width={60} />
    )
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(t('The value of each LP Token'), {
    placement: 'top-end',
    tooltipOffset: [20, 10],
  })

  return (
    <Container>
      <LiquidityWrapper>
        <Text>{displayPrice}</Text>
      </LiquidityWrapper>
      <ReferenceElement ref={targetRef}>
        <HelpIcon color="textSubtle" />
      </ReferenceElement>
      {tooltipVisible && tooltip}
    </Container>
  )
}

export default LiquidityPrice
