import { Currency, getETHER, Token } from 'sdk'
import { CICIcon } from 'uikit'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import getTokenLogoURL, { getTokenTokenLogoURL } from '../../utils/getTokenLogoURL'
import Logo from './Logo'

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export default function CurrencyLogo({
  currency,
  chainId,
  size = '24px',
  style,
}: {
  currency?: Currency
  chainId: number
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === getETHER(chainId)) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }
      return [getTokenTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  const sym = getETHER(chainId).symbol
  if (currency?.symbol === sym) {
    return <StyledLogo size={size} srcs={[`/images/tokens/${sym}.png`]} alt={`logo`} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
