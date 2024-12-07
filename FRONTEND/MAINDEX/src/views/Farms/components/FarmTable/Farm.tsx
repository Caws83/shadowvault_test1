import React from 'react'
import styled from 'styled-components'
import { useFarmUser } from 'state/farms/hooks'
import { useTranslation } from 'contexts/Localization'
import { Text } from 'uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { Dex, Host, Token } from 'config/constants/types'
import { TokenPairImage } from 'components/TokenImage'
import BigNumber from 'bignumber.js'
import { usePublicClient } from 'wagmi'
import { isMobile } from 'components/isMobile'

export interface FarmProps {
  label: string
  pid: number
  id: number
  token: Token
  quoteToken: Token
  host: Host
  dex: Dex
  pricePerToken: BigNumber
  unLockTime: string
}

const Container = styled.div`
  padding-left: 8px;
  display: flex;
  align-items: center;

`

const TokenWrapper = styled.div`
  padding-right: 8px;
  padding-left: 8px;
  width: 80px;

`

const Farm: React.FunctionComponent<FarmProps> = ({ token, quoteToken, host, dex, label, id }) => {
  const { stakedBalance } = useFarmUser(id)
  const { t } = useTranslation()
  const rawStakedBalance = getBalanceNumber(new BigNumber(stakedBalance.toString()))
  const client = usePublicClient({chainId: host.chainId})

  const handleRenderFarming = (): JSX.Element => {
    if (rawStakedBalance) {
      return (
        <Text color="primary" fontSize={!isMobile ? "10px" : "8px"} bold textTransform="uppercase">
          {t(`Farming ${host.payoutToken.symbol}`)}
        </Text>
      )
    }
    return (
      <Text color="secondary" fontSize={!isMobile ? "10px" : "8px"} bold textTransform="uppercase">
        {t(`${host.payoutToken.symbol}`)}
      </Text>
    )
  }

  return (
    <Container>
      <TokenWrapper>
        <TokenPairImage
          variant="inverted"
          primaryToken={token}
          secondaryToken={quoteToken}
          host={host}
          chainId={host.chainId}
          width={isMobile ? 55 : 70}
          height={isMobile ? 55 : 70}
        />
      </TokenWrapper>
      <div>
        <Text fontSize={!isMobile ? "14px" : "10px"} color="secondary">
          {client?.chain.name}
        </Text>
        {handleRenderFarming()}
        <Text fontSize={!isMobile ? "16px" : "12px"} bold>{label}</Text>
        <Text fontSize={!isMobile ? "12px" : "8px"}>{dex.id}</Text>
      </div>
    </Container>
  )
}

export default Farm
