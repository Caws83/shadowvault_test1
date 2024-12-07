import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { setBlock } from '.'
import { State } from '../types'
import { usePublicClient } from 'wagmi'

export const usePollBlockNumber = () => {
  const timer = useRef(null)
  const dispatch = useAppDispatch()
  const isWindowVisible = useIsWindowVisible()

  useEffect(() => {
    if (isWindowVisible) {
      timer.current = setInterval(async () => {
        // const blockNumber = await publicClient.getBlockNumber()
        const blockNumber = await Date.now() / 1000
        dispatch(setBlock(blockNumber.toString()))
      }, 6000)
    } else {
      clearInterval(timer.current)
    }

    return () => clearInterval(timer.current)
  }, [dispatch, timer, isWindowVisible])
}

export const useBlock = () => {
  return useSelector((state: State) => state.block)
}

export const useInitialBlock = () => {
  return useSelector((state: State) => state.block.initialBlock)
}
