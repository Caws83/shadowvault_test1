import useRefresh from 'hooks/useRefresh'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from 'state'
import { NFTLaunch, State } from 'state/types'
import { fetchNftLaunchPublicDataAsync, fetchNftLaunchUserDataAsync } from '.'
import { BigNumber } from 'bignumber.js'

export const useFetchNftLaunchPublicData = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchNftLaunchPublicData = async () => {
      dispatch(fetchNftLaunchPublicDataAsync())
    }

    fetchNftLaunchPublicData()
  }, [dispatch, slowRefresh])
}

export const useFetchNftLaunchUserData = (account) => {
  const { slowRefresh } = useRefresh()
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (account) {
      dispatch(fetchNftLaunchUserDataAsync(account))
    }
  }, [account, dispatch, slowRefresh])
}

export const useNftLaunchs = (): {
  nftLiveLaunchs: NFTLaunch[]
  nftFinishedLaunchs: NFTLaunch[]
  userDataLoaded: boolean
} => {
  const { nftlaunchs, userDataLoaded } = useSelector((state: State) => ({
    nftlaunchs: state.nftlaunchs.data,
    userDataLoaded: state.nftlaunchs.userDataLoaded,
  }))
  const liveLaunchs = nftlaunchs.filter(
    (p) => (p.isFinished === false || p.isFinished === undefined) && new BigNumber(p.currentSupply).lt(p.maxSupply),
  )
  const finishedLaunchs = nftlaunchs.filter((p) => p.isFinished === true || new BigNumber(p.currentSupply).gt(p.maxSupply))

  return { nftLiveLaunchs: liveLaunchs, nftFinishedLaunchs: finishedLaunchs, userDataLoaded }
}
