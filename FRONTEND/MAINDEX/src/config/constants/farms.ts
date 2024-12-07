import farmageddonFarms from './farms/farmageddon'
import marswapFarms from './farms/marswapV2Test'

const farms = async (quick?: boolean) => {
  if (quick) farmageddonFarms
  try {
    // const lockerFarms = await lockers()
    // const marsFarms = await marswapFarms()
    return farmageddonFarms
  } catch {
    console.info('Error getting msawp info.')
    return farmageddonFarms
  }
}

export default farms
