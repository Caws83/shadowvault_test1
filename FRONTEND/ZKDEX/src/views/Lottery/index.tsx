import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Box, Flex, Heading, Skeleton, Text } from 'uikit'
import { LotteryStatus } from 'config/constants/types'
import PageSection from 'components/PageSection'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import { useFetchLottery, useHasLottery, useLottery, useLotteryDex } from 'state/lottery/hooks'
import { getToken } from 'utils/tokenHelper'
import { TITLE_BG } from './pageSectionStyles'
import useGetNextLotteryEvent from './hooks/useGetNextLotteryEvent'
import useStatusTransitions from './hooks/useStatusTransitions'
import Hero from './components/Hero'
import NextDrawCard from './components/NextDrawCard'
import Countdown from './components/Countdown'
import HistoryTabMenu from './components/HistoryTabMenu'
import YourHistoryCard from './components/YourHistoryCard'
import AllHistoryCard from './components/AllHistoryCard'
import CheckPrizesSection from './components/CheckPrizesSection'
import HowToPlay from './components/HowToPlay'
import useShowMoreUserHistory from './hooks/useShowMoreUserRounds'
import { useLottoPrice } from './helpers'
import BigNumber from 'bignumber.js'
import { useParams } from 'react-router-dom'

const LotteryPage = styled.div`
  min-height: calc(100vh - 64px);
`
function Lottery() {
  const { lottery } = useParams()
  const lotteryToken = useMemo(() => {
    const lotto = getToken(lottery)
    return lotto
  }, [lottery])

  const dex = useLotteryDex(lotteryToken)
  const isValid = useHasLottery(lotteryToken)

  useFetchLottery(lotteryToken, dex.chainId)
  useStatusTransitions(lotteryToken)

  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    currentRound: { status, endTime },
  } = useLottery(lotteryToken)

  const [historyTabMenuIndex, setHistoryTabMenuIndex] = useState(0)
  const endTimeAsInt = parseInt(endTime, 10)
  const { nextEventTime, postCountdownText, preCountdownText } = useGetNextLotteryEvent(endTimeAsInt, status)
  const { numUserRoundsRequested, handleShowMoreUserRounds } = useShowMoreUserHistory()

  const lottoPrice = useLottoPrice(lotteryToken, dex)

  return (
    <>
      {isValid === true ? (
        <LotteryPage>
          <PageSection background={TITLE_BG} index={1} hasCurvedDivider={false}>
            <Hero lotteryToken={lotteryToken} lottoPrice={new BigNumber(lottoPrice.toString())} />
          </PageSection>
          <PageSection
            containerProps={{ style: { marginTop: '-30px' } }}
            background={(theme as any).colors.background}
            concaveDivider
            clipFill={{ light: '#000000' }}
            dividerPosition="top"
            index={2}
          >
            <Flex alignItems="center" justifyContent="center" flexDirection="column" pt="24px">
              {status === LotteryStatus.OPEN && (
                <Heading scale="xl" color="#ffffff" mb="24px" textAlign="center">
                  {t('Get your tickets now!')}
                </Heading>
              )}
              <Flex alignItems="center" justifyContent="center" mb="48px">
                {nextEventTime && (postCountdownText || preCountdownText) ? (
                  <Countdown
                    nextEventTime={nextEventTime}
                    postCountdownText={postCountdownText}
                    preCountdownText={preCountdownText}
                    lotteryToken={lotteryToken}
                  />
                ) : (
                  <Skeleton height="41px" width="250px" />
                )}
              </Flex>
              <NextDrawCard lotteryToken={lotteryToken} lottoPrice={new BigNumber(lottoPrice.toString())} />
            </Flex>
          </PageSection>
          <PageSection background={(theme as any).colors.background} hasCurvedDivider={false} index={2}>
            <CheckPrizesSection lotteryToken={lotteryToken} lottoPrice={new BigNumber(lottoPrice.toString())} />
          </PageSection>
          <PageSection
            innerProps={{ style: { margin: '0', width: '100%' } }}
            background={(theme as any).colors.background}
            hasCurvedDivider={false}
            index={2}
          >
            <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center">
              <Heading mb="24px" scale="xl">
                {t('Finished Rounds')}
              </Heading>
              <Box mb="24px">
                <HistoryTabMenu
                  activeIndex={historyTabMenuIndex}
                  setActiveIndex={(index) => setHistoryTabMenuIndex(index)}
                />
              </Box>
              {historyTabMenuIndex === 0 ? (
                <AllHistoryCard lotteryToken={lotteryToken} lottoPrice={new BigNumber(lottoPrice.toString())} />
              ) : (
                <YourHistoryCard
                  lotteryToken={lotteryToken}
                  handleShowMoreClick={handleShowMoreUserRounds}
                  numUserRoundsRequested={numUserRoundsRequested}
                  lottoPrice={new BigNumber(lottoPrice.toString())}
                />
              )}
            </Flex>
          </PageSection>
          <PageSection
            dividerPosition="top"
            dividerFill={{ light: (theme as any).colors.background }}
            clipFill={{ light: '#ccccff', dark: '#000000' }}
            index={2}
          >
            <HowToPlay lotteryToken={lotteryToken} />
          </PageSection>
        </LotteryPage>
      ) : (
        <LotteryPage>
          <PageSection
            containerProps={{ style: { marginTop: '-20px' } }}
            background={(theme as any).colors.background}
            concaveDivider
            clipFill={{ light: '#000000' }}
            dividerPosition="top"
            index={2}
          >
            <Text>Invalid Lottery Page</Text>
          </PageSection>
        </LotteryPage>
      )}
    </>
  )
}

export default Lottery
