import { ERC20_ABI } from 'config/abi/ERC20ABI'
import { Token, TokenAmount } from 'sdk'
import { useReadContract } from 'wagmi'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched
function useTotalSupply(chainId: number, token?: Token): TokenAmount | undefined {
  const { data: totalSupply} = useReadContract({
    address: token?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
    chainId
  })
  
  
  return token && totalSupply ? new TokenAmount(token, totalSupply ) : token ? new TokenAmount(token, 0n) : undefined
}

export default useTotalSupply
