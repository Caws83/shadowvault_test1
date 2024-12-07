import store from 'state'
import { GAS_PRICE, GAS_PRICE_GWEI } from 'state/user/hooks/helpers'

/**
 * Function to return gasPrice outwith a react component
 */
const getGasPrice = (): string => {
  const state = store.getState()
  const setting = state.user.gasPrice || GAS_PRICE_GWEI.default
  return GAS_PRICE[setting]
}

export default getGasPrice
