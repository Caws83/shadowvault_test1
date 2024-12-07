import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { useDispatch } from 'react-redux'
import farmsReducer from './farms'
import poolsReducer from './pools'
import nftPoolsReducer from './nftpools'
import nftLaunchReducer from './nftlaunch'
import gameReducer from './games'
import profileReducer from './profile'
import blockReducer from './block'
import lotteryReducer from './lottery'
import plotteryReducer from './plottery'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swap from './swap/reducer'
import mint from './mint/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  devTools: !import.meta.env.PROD,
  reducer: {
    block: blockReducer,
    farms: farmsReducer,
    pools: poolsReducer,
    nftpools: nftPoolsReducer,
    nftlaunchs: nftLaunchReducer,
    games: gameReducer,
    profile: profileReducer,
    plotteries: plotteryReducer,
    lottery: lotteryReducer,

    // Exchange
    user,
    transactions,
    swap,
    mint,
    burn,
    lists,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: true }).concat(save({ states: PERSISTED_KEYS })),
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch: () => AppDispatch = useDispatch

export default store
