import React from 'react'
import styled from 'styled-components'
import { Text, Skeleton, useMatchBreakpoints, useTooltip, HelpIcon } from 'uikit'
import { dateTimeOptions, dayOptions } from 'views/Lottery/helpers'
import BigNumber from 'bignumber.js'

export interface LockProps {
  unLockTime: string
}

const ReferenceElement = styled.div`
  display: inline-block;
`

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

const LockCell: React.FC<LockProps> = ({ unLockTime }) => {
  const { isMobile } = useMatchBreakpoints()
  // const { onLockInfo } = useGetLockInfo(host, pid, true)
  // const { unLockTime } = onLockInfo()
  const endTimeMs = new BigNumber(unLockTime).multipliedBy(1000).toNumber()
  const endDate = new Date(endTimeMs)

  const getNextDrawDate = () => {
    if (endTimeMs === 0) return `Empty!`
    if (isMobile) {
      return `${endDate.toLocaleString(undefined, dayOptions)}`
    }
    return `${endDate.toLocaleString(undefined, dateTimeOptions)}`
  }
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    'When Empty you just need to stake your LP Tokens to start the Lock. Otherwise the date shown is when it will UnLock',
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  return new BigNumber(unLockTime).gte(0) ? (
    <Container>
      <Text bold={!isMobile} small={isMobile} color="secondary" fontSize={isMobile ? '18px' : '24px'}>
        {getNextDrawDate()}
      </Text>
      <ReferenceElement ref={targetRef}>
        <HelpIcon color="textSubtle" />
      </ReferenceElement>
      {tooltipVisible && tooltip}
    </Container>
  ) : (
    <Container>
      <Skeleton width={50} height={40} my="8px" />
    </Container>
  )
}

export default LockCell
