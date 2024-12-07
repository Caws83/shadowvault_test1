// Constructing the two forward-slash-separated parts of the 'Add Liquidity' URL
// Each part of the url represents a different side of the LP pair.
import { useAccount, useChainId } from 'wagmi'
import { getWrappedAddress } from './addressHelpers'
import { defaultChain, defaultChainId } from 'config/constants/chains'

const getLiquidityUrlPathParts = ({ quoteTokenAddress, tokenAddress }) => {
  const {chain} = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const wBNBAddressString = getWrappedAddress(chainId)
  const nativeSymbol = chain?.nativeCurrency.symbol ?? defaultChain.nativeCurrency.symbol
  const quoteTokenAddressString: string = quoteTokenAddress ? quoteTokenAddress[chainId] : null
  const tokenAddressString: string = tokenAddress ? tokenAddress[chainId] : null
  const firstPart =
    !quoteTokenAddressString || quoteTokenAddressString === wBNBAddressString ? nativeSymbol : quoteTokenAddressString
  const secondPart = !tokenAddressString || tokenAddressString === wBNBAddressString ? nativeSymbol : tokenAddressString
  return `${firstPart}/${secondPart}`
}

export default getLiquidityUrlPathParts
