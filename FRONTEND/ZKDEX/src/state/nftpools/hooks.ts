import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, useAppDispatch } from 'state'
import useRefresh from 'hooks/useRefresh'
import { Host } from 'config/constants/types'
import hosts from 'config/constants/hosts'
import { useBlock } from 'state/block/hooks'
import { State, NFTPool } from '../types'
import { transformNftPool } from './helpers'
import {
  fetchInitialNftPoolsData,
  fetchNftPoolsPublicDataByHostAsync,
  fetchNftPoolsStakingLimitsByHostAsync,
  fetchNftPoolsUserDataByHostAsync,
  updateNftPoolsHost,
} from '.'

export const useFetchNftPublicPoolsDataByHost = (host: Host) => {
  const dispatch = useAppDispatch()
  const { sslowRefresh } = useRefresh()

  useEffect(() => {
    const fetchNftPoolsPublicDataByHost = async () => {
      const blockNumber = await Date.now() / 1000
      dispatch(fetchNftPoolsPublicDataByHostAsync(BigInt(blockNumber.toFixed(0)), host))
    }

    fetchNftPoolsPublicDataByHost()
    dispatch(fetchNftPoolsStakingLimitsByHostAsync(host))
  }, [dispatch, sslowRefresh, host])
}

export const useFetchNftUserPoolsByHost = (account, host: Host) => {
  const { slowRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchNftPoolsUserDataByHostAsync(account, host))
    }
  }, [account, dispatch, slowRefresh, host])
}

export const useGetNftPools = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { sslowRefresh } = useRefresh()

  useEffect(() => {
    async function get() {
      dispatch(fetchInitialNftPoolsData());
    }
    get()
  }, [dispatch, sslowRefresh])
}

export function useNftPoolsHostManager(): [Host, (userHost: Host) => void] {
  const dispatch = useDispatch<AppDispatch>()
  let userHost = useNftPoolsHost()
  if (userHost === undefined) {
    userHost = hosts.locker
    dispatch(updateNftPoolsHost(userHost))
  }

  const setNftPoolsHost = useCallback(
    (host: Host) => {
      dispatch(updateNftPoolsHost(host))
    },
    [dispatch],
  )
  return [userHost, setNftPoolsHost]
}

export const useNftPoolsHost = (): Host => {
  const host = useSelector((state: State) => state.pools.host)
  return host
}

export const useNftPools = (): { livePools: NFTPool[]; finishedPools: NFTPool[]; userDataLoaded: boolean } => {
  const { nftpools, userDataLoaded } = useSelector((state: State) => ({
    nftpools: state.nftpools.data,
    userDataLoaded: state.nftpools.userDataLoaded,
  }))
  const blockState = useBlock()
  const livePools = nftpools.filter((pool) => {
    return pool.isFinished !== true && pool.endBlock > Number(blockState.currentBlock)
  })
  const finishedPools = nftpools.filter((pool) => {
    return pool.isFinished === true || pool.endBlock < Number(blockState.currentBlock)
  })
  return {
    livePools: livePools.map(transformNftPool),
    finishedPools: finishedPools.map(transformNftPool),
    userDataLoaded,
  }
}
