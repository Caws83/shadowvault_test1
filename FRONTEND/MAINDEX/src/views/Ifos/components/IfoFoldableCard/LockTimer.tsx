import React from 'react'
import { useTranslation } from 'contexts/Localization'
import { Flex, PocketWatchIcon, Text, Skeleton } from 'uikit'
import getTimePeriods from 'utils/getTimePeriods'
import { PublicIfoData } from 'views/Ifos/types'
import { Ifo } from 'config/constants/types'
import styled from 'styled-components'
import { BigNumber } from 'bignumber.js'



interface Props {
  publicIfoData: PublicIfoData
  ifo: Ifo
}

const TimerWrapper = styled.div`
  flex: 1;
`
const TicketImage = styled.img`
  height: 28px;
  margin-right: 10px;
`

const LockTimer: React.FC<Props> = ({ ifo, publicIfoData }) => {
  const { t } = useTranslation()
  const nowEpoch = new BigNumber(Math.floor(Date.now() / 1000));
  const { status } = publicIfoData
  const unlockTime = new BigNumber(publicIfoData.initialLockTime).plus(publicIfoData.lockLength.multipliedBy(86400))
  const secondsTillUnlock = unlockTime.minus(nowEpoch)
  const isUnlocked = unlockTime < nowEpoch
  const timeUntil = getTimePeriods(secondsTillUnlock.toNumber())
  const suffix = isUnlocked ? t('UnLocked').toLowerCase() : t('Locked').toLowerCase()
  return (
    <TimerWrapper>
     
      <Flex justifyContent="center" >
        {status === 'idle' ? (
          <Skeleton animation="pulse" variant="rect" width="100%" height="32px" />
        ) : (
          <>
            <TicketImage src="/images/watch.png" alt="Watch" />
            <Flex alignItems="center">
              <Text style={{ textShadow: '0 0 6px black, 0 0 6px black, 0 0 6px black, 0 0 6px black' }} bold mr="8px">
                {suffix}:
              </Text>
             
              <Text style={{ textShadow: '0 0 6px black, 0 0 6px black, 0 0 6px black, 0 0 6px black' }} >
                {t('%day%d %hour%h %minute%m', {
                  day: timeUntil.days,
                  hour: timeUntil.hours,
                  minute: timeUntil.minutes,
                })}
              </Text>
              
              
            </Flex>
          </>
        )}
      </Flex>
    </TimerWrapper>
  )
}

export default LockTimer
