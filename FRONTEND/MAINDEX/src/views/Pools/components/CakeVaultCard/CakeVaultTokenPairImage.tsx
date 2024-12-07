import React from 'react'
import { TokenPairImage, ImageProps } from 'uikit'
import tokens from 'config/constants/tokens'
import { getAddress } from 'utils/addressHelpers'

const CakeVaultTokenPairImage: React.FC<Omit<ImageProps, 'src'>> = (props) => {
  const primaryTokenSrc = `/images/tokens/${getAddress(tokens.mswap.address).toUpperCase()}.png`

  return <TokenPairImage primarySrc={primaryTokenSrc} secondarySrc="/images/tokens/AUTORENEW.svg" {...props} />
}

export default CakeVaultTokenPairImage
