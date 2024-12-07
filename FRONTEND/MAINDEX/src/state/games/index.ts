import { createSlice } from '@reduxjs/toolkit'
import games from 'config/constants/games'
import { AppThunk, Game, GameState } from 'state/types'
import { fetchGamePublicInfo, fetchMultiInfo, fetchMultiInfo2, fetchScratcherInfo } from './fetchGame'
import {
  fetchGameAllowance,
  fetchGameUserInfo,
  fetchGameData,
  fetchBJData,
  fetchHRData,
  fetchLRData,
} from './fetchgameUser'

const initialState: GameState = {
  data: [...games],
  userDataLoaded: false,
}

export const GameSlice = createSlice({
  name: 'Games',
  initialState,
  reducers: {
    setGamePublicData: (state, action) => {
      const liveGamesData: Game[] = action.payload
      state.data = state.data.map((game) => {
        const liveGameData = liveGamesData.find((entry) => entry.GameId === game.GameId)
        return { ...game, ...liveGameData }
      })
    },
    setMultiplierData: (state, action) => {
      const multiData = action.payload
      state.data = state.data.map((game) => {
        const multiplierGameData = multiData.find((entry) => entry.GameId === game.GameId)
        return { ...game, multipliers: multiplierGameData }
      })
    },

    setMultiplierData2: (state, action) => {
      const multiData = action.payload
      state.data = state.data.map((game) => {
        const multiplierGameData = multiData.find((entry) => entry.GameId === game.GameId)
        return { ...game, multipliers2: multiplierGameData }
      })
    },

    setScratcherData: (state, action) => {
      const scData = action.payload
      state.data = state.data.map((game) => {
        const scratchGameData = scData.find((entry) => entry.GameId === game.GameId)
        return { ...game, scratcher: scratchGameData }
      })
    },

    setGameUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((game) => {
        const userGameData = userData.find((entry) => entry.GameId === game.GameId)
        return { ...game, userData: userGameData }
      })
      state.userDataLoaded = true
    },
    setHighCardUserData: (state, action) => {
      const highCard = action.payload
      state.data = state.data.map((game) => {
        const highCardGameData = highCard.find((entry) => entry.GameId === game.GameId)
        return { ...game, highCard: highCardGameData }
      })
    },
    setBlackJackUserData: (state, action) => {
      const bjInfo = action.payload
      state.data = state.data.map((game) => {
        const bjGameData = bjInfo.find((entry) => entry.GameId === game.GameId)
        return { ...game, blackJack: bjGameData }
      })
    },

    setHighRollerUserData: (state, action) => {
      const hrInfo = action.payload
      state.data = state.data.map((game) => {
        const hrGameData = hrInfo.find((entry) => entry.GameId === game.GameId)
        return { ...game, highRoller: hrGameData }
      })
    },

    setLowRollerUserData: (state, action) => {
      const lrInfo = action.payload
      state.data = state.data.map((game) => {
        const lrGameData = lrInfo.find((entry) => entry.GameId === game.GameId)
        return { ...game, lowRoller: lrGameData }
      })
    },

    updateGameUserData: (state, action) => {
      const { field, value, GameId } = action.payload
      const index = state.data.findIndex((p) => p.GameId === GameId)
      if (index >= 0) {
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
    /*
    updateNftLaunchMintData: (state, action) => {
      const { amount, GameId } = action.payload
      const index = state.data.findIndex((p) => p.GameId === nftCollectionId)
      if (index >= 0) {
        const supply = state.data[index].currentSupply + amount
        state.data[index] = { ...state.data[index], currentSupply: supply }
      }
    },
    */
  },
})

export const updateGameUserApproval = (GameId: number, account: `0x${string}`) => async (dispatch) => {
  const approvals = await fetchGameAllowance(account)
  dispatch(updateGameUserData({ GameId, field: 'allowance', value: approvals[GameId] }))
}

export const fetchGamePublicDataAsync = () => async (dispatch) => {
  const gameInfo = await fetchGamePublicInfo()
  dispatch(setGamePublicData(gameInfo))
}
export const fetchMultiplerPublicDataAsync = () => async (dispatch) => {
  const multiplierInfo = await fetchMultiInfo()
  dispatch(setMultiplierData(multiplierInfo))
}
export const fetchMultipler2PublicDataAsync = () => async (dispatch) => {
  const multiplierInfo = await fetchMultiInfo2()
  dispatch(setMultiplierData2(multiplierInfo))
}
export const fetchScratcherPublicDataAsync = () => async (dispatch) => {
  const scratcherInfo = await fetchScratcherInfo()
  dispatch(setScratcherData(scratcherInfo))
}

export const fetchHighCardUserDataAsync = (account: string) => async (dispatch) => {
  const gameData = await fetchGameData(account)
  const mainCasinos = games.filter((g) => g.gameContract === 1)
  const highData = mainCasinos.map((game) => ({
    GameId: game.GameId,
    currentSuit: gameData[game.GameId].currentCardSuit,
    currentNumber: gameData[game.GameId].currentCardNumber,
    currentBet: gameData[game.GameId].currentBet,
    winnings: gameData[game.GameId].winnings,
    multiplier: gameData[game.GameId].multiplier,
    isGameStarted: gameData[game.GameId].gameStarted,
  }))
  dispatch(setHighCardUserData(highData))
}

export const fetchGameUserDataAsync = (account: string) => async (dispatch) => {
  const balance = await fetchGameUserInfo(account)
  const allowanceInfo = await fetchGameAllowance(account)
  const userData = games.map((game) => ({
    GameId: game.GameId,
    balance: balance[game.GameId],
    allowance: allowanceInfo[game.GameId],
  }))
  dispatch(setGameUserData(userData))
}

export const fetchBlackJackUserDataAsync = (account: string) => async (dispatch) => {
  const gameData2 = await fetchBJData(account)
  const mainCasinos = games.filter((g) => g.gameContract === 1)
  const bjData = mainCasinos.map((game) => ({
    GameId: game.GameId,
    playerSuits: gameData2[game.GameId]._playerSuits,
    playerCards: gameData2[game.GameId]._playerNumbers,
    houseSuits: gameData2[game.GameId]._houseSuits,
    houseCards: gameData2[game.GameId]._houseNumbers,
    currentBet: gameData2[game.GameId]._currentBet,
    playerTotal: gameData2[game.GameId]._total,
    houseTotal: gameData2[game.GameId]._Dtotal,
    isGameStarted: gameData2[game.GameId]._gameStarted,
  }))
  dispatch(setBlackJackUserData(bjData))
}

export const fetchHighRollerUserDataAsync = (account: string) => async (dispatch) => {
  const gameData3 = await fetchHRData(account)
  const mainCasinos = games.filter((g) => g.gameContract === 2)
  const Data = mainCasinos.map((game) => ({
    GameId: game.GameId,
    houseDice1: gameData3[game.GameId].houseDice1,
    houseDice2: gameData3[game.GameId].houseDice2,
    playerDice1: gameData3[game.GameId].playerDice1,
    playerDice2: gameData3[game.GameId].playerDice2,
    currentBet: gameData3[game.GameId].currentBet,
    diceChoice: gameData3[game.GameId].diceChoice,
    isGameStarted: gameData3[game.GameId].gameStarted,
  }))
  dispatch(setHighRollerUserData(Data))
}

export const fetchLowRollerUserDataAsync = (account: string) => async (dispatch) => {
  const gameData3 = await fetchLRData(account)
  const mainCasinos = games.filter((g) => g.gameContract === 2)
  const Data = mainCasinos.map((game) => ({
    GameId: game.GameId,
    houseDice1: gameData3[game.GameId].houseDice1,
    houseDice2: gameData3[game.GameId].houseDice2,
    playerDice1: gameData3[game.GameId].playerDice1,
    playerDice2: gameData3[game.GameId].playerDice2,
    currentBet: gameData3[game.GameId].currentBet,
    diceChoice: gameData3[game.GameId].diceChoice,
    isGameStarted: gameData3[game.GameId].gameStarted,
  }))
  dispatch(setLowRollerUserData(Data))
}

// Actions
export const {
  setHighRollerUserData,
  setLowRollerUserData,
  setMultiplierData2,
  setGamePublicData,
  setMultiplierData,
  setGameUserData,
  updateGameUserData,
  setHighCardUserData,
  setBlackJackUserData,
  setScratcherData,
} = GameSlice.actions

export default GameSlice.reducer
