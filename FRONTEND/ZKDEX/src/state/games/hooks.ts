import useRefresh from 'hooks/useRefresh'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { Game, State } from 'state/types'
import { Token } from 'config/constants/types'
import tokens from 'config/constants/tokens'
import {
  fetchGamePublicDataAsync,
  fetchMultiplerPublicDataAsync,
  fetchGameUserDataAsync,
  fetchHighCardUserDataAsync,
  fetchBlackJackUserDataAsync,
  fetchHighRollerUserDataAsync,
  fetchLowRollerUserDataAsync,
  fetchMultipler2PublicDataAsync,
  fetchScratcherPublicDataAsync,
} from '.'

// base public data
export const useFetchGamePublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchGamePublicData = async () => {
      dispatch(fetchGamePublicDataAsync())
    }
    fetchGamePublicData()
  }, [dispatch, slowRefresh])
}

export const useFetchMultiplierPublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchMultiplerPublicData = async () => {
      dispatch(fetchMultiplerPublicDataAsync())
    }
    fetchMultiplerPublicData()
  }, [dispatch, slowRefresh])
}

export const useFetchMultiplier2PublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchMultipler2PublicData = async () => {
      dispatch(fetchMultipler2PublicDataAsync())
    }
    fetchMultipler2PublicData()
  }, [dispatch, slowRefresh])
}

export const useFetchScratcherPublicData = () => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchScratcherPublicData = async () => {
      dispatch(fetchScratcherPublicDataAsync())
    }
    fetchScratcherPublicData()
  }, [dispatch, slowRefresh])
}

// USER GAME DATA

export const useFetchHighCardUserDataAsync = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchHighCardUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}
export const useQuickHighCardUserDataAsync = (account) => {
  const { sfastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchHighCardUserDataAsync(account))
    }
  }, [account, dispatch, sfastRefresh])
}

export const useFetchBlackJackUserDataAsync = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchBlackJackUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}
export const useQuickBlackJackUserDataAsync = (account) => {
  const { sfastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchBlackJackUserDataAsync(account))
    }
  }, [account, dispatch, sfastRefresh])
}

export const useFetchHighRollerUserDataAsync = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchHighRollerUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}
export const useQuickHighRollerUserDataAsync = (account) => {
  const { sfastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchHighRollerUserDataAsync(account))
    }
  }, [account, dispatch, sfastRefresh])
}

export const useFetchLowRollerUserDataAsync = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchLowRollerUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}
export const useQuickLowRollerUserDataAsync = (account) => {
  const { sfastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchLowRollerUserDataAsync(account))
    }
  }, [account, dispatch, sfastRefresh])
}

// USER DATA
export const useFetchGameUserData = (account) => {
  const { fastRefresh } = useRefresh()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (account) {
      dispatch(fetchGameUserDataAsync(account))
    }
  }, [account, dispatch, fastRefresh])
}

export const useGames = (): {
  games: Game[]
  userDataLoaded: boolean
} => {
  const { games, userDataLoaded } = useSelector((state: State) => ({
    games: state.games.data,
    userDataLoaded: state.games.userDataLoaded,
  }))

  return { games, userDataLoaded }
}

function parseTokenFromURLParameter(urlParam: any): Token {
  if (typeof urlParam === 'string') {
    return tokens[urlParam]
  }
  return undefined
}

// updates the game state to use the defaults for a given network
export function useDefaultsFromURLSearch(): Token | undefined {
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<Token | undefined>()

  useEffect(() => {
    const parsed = parseTokenFromURLParameter(parsedQs.token)
    setResult(parsed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedQs])

  return result
}
