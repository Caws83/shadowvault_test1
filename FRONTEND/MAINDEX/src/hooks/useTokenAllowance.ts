import { Token, TokenAmount } from 'sdk'
import { useEffect, useMemo, useState } from 'react'
import { useReadContract } from 'wagmi'
import { ERC20_ABI } from 'config/abi/ERC20ABI'
import useRefresh from './useRefresh'

function useTokenAllowance(token?: Token, owner?: `0x${string}`, spender?: `0x${string}`, chainId?: number): TokenAmount | undefined {  
  const { slowRefresh } = useRefresh()
  const {data, refetch} = useReadContract({
    address: token?.address as`0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, spender],
    chainId,
  })
  useEffect(() => {
    refetch()
  },[slowRefresh])
  
  const allowance = data;
  return useMemo(() => {
    return (token && allowance !== undefined ? new TokenAmount(token, allowance.toString()) : undefined)
  },[allowance, token]);

}

export default useTokenAllowance
