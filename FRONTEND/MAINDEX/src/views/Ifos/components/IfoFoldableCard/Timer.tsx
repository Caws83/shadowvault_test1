import React from 'react'
import { useTranslation } from 'contexts/Localization'
import { Flex, PocketWatchIcon, Text, Skeleton } from 'uikit'
import getTimePeriods from 'utils/getTimePeriods'
import { PublicIfoData } from 'views/Ifos/types'
import { Ifo } from 'config/constants/types'
import styled from 'styled-components'



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

const Timer: React.FC<Props> = ({ publicIfoData, ifo }) => {
  const { t } = useTranslation()
  const { status, secondsUntilStart, secondsUntilEnd } = publicIfoData
  const countdownToUse = status === 'coming_soon' ? secondsUntilStart : secondsUntilEnd
  const timeUntil = getTimePeriods(countdownToUse)
  const suffix = status === 'coming_soon' ? t('Start').toLowerCase() : t('End').toLowerCase()
  return (
    <TimerWrapper>
      <Flex justifyContent="center">
        {status === 'idle' ? (
          <Skeleton animation="pulse" variant="rect" width="100%" height="32px" />
        ) : (
          <>
           <TicketImage src="/images/watch.png" alt="Watch" />
            <Flex alignItems="center">
                        
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

export default Timer
