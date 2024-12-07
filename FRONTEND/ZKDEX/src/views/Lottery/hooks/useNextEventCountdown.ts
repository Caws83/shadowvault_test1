import { useEffect, useState, useRef } from 'react'
import { useAppDispatch } from 'state'
import { useLottery } from 'state/lottery/hooks'
import { fetchCurrentLottery, setLotteryIsTransitioning } from 'state/lottery'
import { Token } from 'config/constants/types'

const useNextEventCountdown = (nextEventTime: number, lotteryToken: Token): number => {
  const dispatch = useAppDispatch()
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const timer = useRef(null)
  const { currentLotteryId } = useLottery(lotteryToken)

  useEffect(() => {
    dispatch(setLotteryIsTransitioning({ isTransitioning: false, lotteryToken }))
    const currentSeconds = Math.floor(Date.now() / 1000)
    const secondsRemainingCalc = nextEventTime - currentSeconds
    setSecondsRemaining(secondsRemainingCalc)

    timer.current = setInterval(() => {
      setSecondsRemaining((prevSecondsRemaining) => {
        // Clear current interval at end of countdown and fetch current lottery to get updated state
        if (prevSecondsRemaining <= 1) {
          clearInterval(timer.current)
          dispatch(setLotteryIsTransitioning({ isTransitioning: true, lotteryToken }))
          dispatch(fetchCurrentLottery({ currentLotteryId, lotteryToken }))
        }
        return prevSecondsRemaining - 1
      })
    }, 1000)

    return () => clearInterval(timer.current)
  }, [setSecondsRemaining, nextEventTime, currentLotteryId, timer, dispatch, lotteryToken])

  return secondsRemaining
}

export default useNextEventCountdown
