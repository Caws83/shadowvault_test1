import { useMemo } from 'react'
import { ChainId, Token } from 'sdk'
import { useSelector } from 'react-redux'
import { AppState } from '../../index'
import { deserializeToken } from './helpers'
import { useChainId } from 'wagmi'

export default function useUserAddedTokens(): Token[] {
  const chainId = useChainId()
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    return Object.values(serializedTokensMap?.[chainId as ChainId] ?? {}).map(deserializeToken)
  }, [serializedTokensMap, chainId])
}
