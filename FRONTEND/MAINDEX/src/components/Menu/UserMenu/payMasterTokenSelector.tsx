import React, { useEffect, useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import EasySelect from 'components/Select/EasySelect'
import { useGasTokenManager } from 'state/user/hooks'
import { getETHER } from 'sdk'
import tokens from 'config/constants/tokens'
import { Token } from 'config/constants/types'
import { defaultChainId } from 'config/constants/chains'



const PMTokenSelector = () => {
  const { chain } = useAccount()
  const chainId = chain?.id ?? defaultChainId
  const ETHER = getETHER(chainId) as Token
  const [payWithPM, setUsePaymaster, payToken, setPaytoken] = useGasTokenManager()

  const payTokenOptions = {
    245022926: [getETHER(245022926) as Token],
}
  const startIndex = payTokenOptions[chainId].findIndex(token => token.symbol === payToken.symbol)

  const onChangeOutToken = (token: Token) => {
    if (token === ETHER) {
      setPaytoken(token)
      setUsePaymaster(false)
    } else {
      setPaytoken(token)
      setUsePaymaster(true)
    }
  }

  return (
    <EasySelect options={payTokenOptions[chainId]} startIndex={startIndex === -1 ? 0 : startIndex}  onChange={onChangeOutToken} />
  )
}

export default PMTokenSelector
