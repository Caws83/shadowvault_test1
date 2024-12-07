import { getMSWAPAddress } from 'utils/addressHelpers'
import useTokenBalance from './useTokenBalance'

/**
 * A hook to check if a wallet's CAKE balance is at least the amount passed in
 */
const useHasCakeBalance = (minimumBalance: bigint) => {
  const chainId = 109
  const { balance: cakeBalance } = useTokenBalance(getMSWAPAddress(), chainId)
  return cakeBalance.gt(minimumBalance.toString())
}

export default useHasCakeBalance
