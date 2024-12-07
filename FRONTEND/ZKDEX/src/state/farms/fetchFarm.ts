import { Farm } from 'state/types'
import fetchPublicFarmData from './fetchPublicFarmData'

const fetchFarm = async (farm: Farm): Promise<Farm> => {
  try {
    const farmPublicData = await fetchPublicFarmData(farm)
    return { ...farm, ...farmPublicData }
  } catch {
    throw new Error(`Failed to get farm ${farm.id}`)
  }
}

export default fetchFarm
