import { Token } from 'config/constants/types'
import useRefresh from 'hooks/useRefresh'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { PLottery, State } from 'state/types'
import { fetchPLotteryPublicDataAsync, fetchPlotteryUserDataAsync } from '.'

// base public data
export const useFetchPLotteryPublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchPLotteryPublicData = async () => {
      dispatch(fetchPLotteryPublicDataAsync())
    }
    fetchPLotteryPublicData()
  }, [dispatch, slowRefresh])
}
// nft user data
export const useFetchPlotteryUserData = (account, currentId) => {
  const { slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchPlotteryUserDataAsync(account, currentId))
    }
  }, [account, currentId, dispatch, slowRefresh])
}

export const usePLottery = (): {
  plotteries: PLottery[]
  userDataLoaded: boolean
} => {
  const { plotteries, userDataLoaded } = useSelector((state: State) => ({
    plotteries: state.plotteries.data,
    userDataLoaded: state.plotteries.userDataLoaded,
  }))

  return { plotteries, userDataLoaded }
}

export const useGetPlotteryByToken = (lotteryToken: Token) => {
  const { plotteries, userDataLoaded } = usePLottery()
  const plottery = plotteries.find((pl) => pl.lotteryToken === lotteryToken)
  return { plottery, userDataLoaded }
}
