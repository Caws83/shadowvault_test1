import React from 'react'
import { isMobile } from 'components/isMobile'
import styled from 'styled-components'
import { Skeleton, Text } from 'uikit'

export interface EarnedProps {
  earnings: number
  earningValue: number
  pid: number
}

interface EarnedPropsWithLoading extends EarnedProps {
  userDataReady: boolean
}
const LiquidityWrapper = styled.div<{ earned: number }>`
  color: ${({ earned, theme }) => (earned ? theme.colors.text : theme.colors.textDisabled)};
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Amount = styled.span<{ earned: number }>`
  color: ${({ earned, theme }) => (earned ? theme.colors.text : theme.colors.textDisabled)};
  display: flex;
  align-items: center;
`

const Earned: React.FunctionComponent<EarnedPropsWithLoading> = ({ earnings, earningValue, userDataReady }) => {
  if (userDataReady) {
    return (
      <LiquidityWrapper earned={earnings}>
        <Text>{earnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
        {!isMobile && <Text>${earningValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>}
      </LiquidityWrapper>
    )
  }
  return (
    <Amount earned={0}>
      <Skeleton width={40} />
    </Amount>
  )
}

export default Earned
