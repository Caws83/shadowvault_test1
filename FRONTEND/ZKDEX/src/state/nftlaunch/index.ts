import { createSlice } from '@reduxjs/toolkit'
import nftlaunchs from 'config/constants/nftlaunch'
import { NFTLaunch, NFTLaunchState } from 'state/types'
import { fetchNftLaunchPublicInfo } from './fetchNftLaunch'
import { fetchNftLaunchAllowance, fetchNftLaunchUserInfo } from './fetchnftLaunchUser'




const initialState: NFTLaunchState = {
  data: [],
  userDataLoaded: false,
}


export const NftLaunchSlice = createSlice({
  name: 'NftLaunchs',
  initialState,
  reducers: {
    setNftLaunchPublicData: (state, action) => {
      const liveLaunchData: NFTLaunch[] = action.payload
      state.data = state.data.map((launch) => {
        const livePoolData = liveLaunchData.find((entry) => entry.nftCollectionId === launch.nftCollectionId)
        return { ...launch, ...livePoolData }
      })
    },
    updateLaunchPublicData: (state, action) => {
      if (action.payload.length !== state.data.length && action.payload.length > 0) {
      state.data = action.payload
      state.userDataLoaded = false
    }
  },
    setNftLaunchUserData: (state, action) => {
      const userData: { [collectionId: number]: { whitelist: boolean; allowance: string } } = action.payload
      state.data = state.data.map((nftpool, index) => {
        const userPoolData = userData[index][nftpool.nftCollectionId]
        nftpool.userData = userPoolData
        return { ...nftpool }
      })
      state.userDataLoaded = true
    },
    updateNftLaunchMintData: (state, action) => {
      const { amount, nftCollectionId } = action.payload
      const index = state.data.findIndex((p) => p.nftCollectionId === nftCollectionId)
      if (index >= 0) {
        const supply = state.data[index].currentSupply + amount
        state.data[index] = { ...state.data[index], currentSupply: supply }
      }
    },
  },
})

export const fetchNftLaunchPublicDataAsync = () => async (dispatch) => {
  const poolsConfig = await nftlaunchs()
  dispatch(updateLaunchPublicData(poolsConfig))

  const launchInfo = await fetchNftLaunchPublicInfo()
  dispatch(setNftLaunchPublicData(launchInfo))
}

export const fetchNftLaunchUserDataAsync = (account: `0x${string}`) => async (dispatch) => {
  try {
    const launchs = await nftlaunchs()
    const [whitelist, allowanceInfo] = await Promise.all([
      fetchNftLaunchUserInfo(account),
      fetchNftLaunchAllowance(account),
    ]);
    
    const userData = launchs.map((launch) => ({
      [launch.nftCollectionId]: {
        whitelist: whitelist[launch.nftCollectionId],
        allowance: allowanceInfo[launch.nftCollectionId],
      },
    }));
    dispatch(setNftLaunchUserData(userData));
  } catch (error) {
    console.error('Error fetching NFT launch user data:', error);
    // Handle the error as needed
  }
};


// Actions
export const { setNftLaunchPublicData, setNftLaunchUserData, updateNftLaunchMintData, updateLaunchPublicData } = NftLaunchSlice.actions

export default NftLaunchSlice.reducer
