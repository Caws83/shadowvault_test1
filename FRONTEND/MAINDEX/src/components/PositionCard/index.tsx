import React, { useState } from 'react'
import { JSBI, Pair, Percent } from 'sdk'
import { Button, Text, ChevronUpIcon, ChevronDownIcon, Card, CardBody, Flex, CardProps, AddIcon } from 'uikit'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import useTotalSupply from '../../hooks/useTotalSupply'

import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'

import { LightCard } from '../Card'
import { AutoColumn } from '../Layout/Column'
import CurrencyLogo from '../Logo/CurrencyLogo'
import { DoubleCurrencyLogo } from '../Logo'
import { RowBetween, RowFixed } from '../Layout/Row'
import { BIG_INT_ZERO } from '../../config/constants'
import Dots from '../Loader/Dots'
import { useAccount } from 'wagmi'
import { Dex } from 'config/constants/types'
import { dexs } from 'config/constants/dex'
import { BigNumber } from 'bignumber.js'
import { useGetTokenPriceString } from 'hooks/useBUSDPrice'
import { isMobile } from 'components/isMobile'

const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

const FlexLayout = styled(Flex)`
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 20px;
  gap: 35px; /* Adjust the gap value as needed */
`;

interface PositionCardProps extends CardProps {
  pair: Pair
  showUnwrapped?: boolean
  dex: Dex
}

export function MinimalPositionCard({ pair, showUnwrapped = false, dex }: PositionCardProps) {
  const { address: account } = useAccount()

  const { t } = useTranslation()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(dex.chainId, account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(dex.chainId, pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <Card>
          <CardBody>
            <AutoColumn gap="16px">
              <FixedHeightRow>
                <RowFixed>
                  <Text color="secondary" bold>
                    {t('LP tokens in your wallet')}
                  </Text>
                </RowFixed>
              </FixedHeightRow>
              <FixedHeightRow onClick={() => setShowMore(!showMore)}>
                <RowFixed>
                  <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin size={20} />
                  <Text small color="textSubtle">
                    {currency0.symbol}-{currency1.symbol} LP
                  </Text>
                </RowFixed>
                <RowFixed>
                  <Text>{userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}</Text>
                </RowFixed>
              </FixedHeightRow>
              <AutoColumn gap="4px">
                <FixedHeightRow>
                  <Text color="textSubtle" small>
                    {t('Share of Pool')}:
                  </Text>
                  <Text>{poolTokenPercentage ? `${poolTokenPercentage.toFixed(6)}%` : '-'}</Text>
                </FixedHeightRow>
                <FixedHeightRow>
                  <Text color="textSubtle" small>
                    {t('Pooled %asset%', { asset: currency0.symbol })}:
                  </Text>
                  {token0Deposited ? (
                    <RowFixed>
                      <Text ml="6px">{token0Deposited?.toSignificant(6)}</Text>
                    </RowFixed>
                  ) : (
                    '-'
                  )}
                </FixedHeightRow>
                <FixedHeightRow>
                  <Text color="textSubtle" small>
                    {t('Pooled %asset%', { asset: currency1.symbol })}:
                  </Text>
                  {token1Deposited ? (
                    <RowFixed>
                      <Text ml="6px">{token1Deposited?.toSignificant(6)}</Text>
                    </RowFixed>
                  ) : (
                    '-'
                  )}
                </FixedHeightRow>
              </AutoColumn>
            </AutoColumn>
          </CardBody>
        </Card>
      ) : (
        <LightCard mt="30px">
          <Text fontSize="10px" style={{ textAlign: 'center' }}>
            {t(
              'On MARSWAP: A flat rate fee is applied. Regular fees not using pur platform would be 0.20%. 0.10% of every trade is added to the LP.  0.10% is LP Provider fee. Any other Swap/Dex could have different fees.',
            )}
          </Text>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, dex, ...props }: PositionCardProps) {
  const { address: account } = useAccount()
  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)
  const canMigrate = dex.chainId === 109 && dexs.marswap2 !== dex

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(dex.chainId, account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(dex.chainId, pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined



  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]
      
      const tokenPrice0 = useGetTokenPriceString(dex, pair?.token0?.address, pair?.token0?.decimals)
      const lpValue = new BigNumber(token0Deposited?.toSignificant(4)).times(tokenPrice0).times(2)

      return (
    <Card style={{ borderRadius: '12px' }} {...props}>
      <Flex justifyContent="space-between" role="button" onClick={() => setShowMore(!showMore)} p="16px">
        <Flex flexDirection="column">
          <Flex alignItems="center" mb="4px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
            <Text bold ml="8px">
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
            </Text>
          </Flex>
          <Flex flexDirection="column" mt="20px">
            <Text color="primary">
              {userPoolBalance?.toSignificant(4)} LP
            </Text>
            <Text fontSize="14px" color="secondary">
              $ {lpValue?.toFixed(4)}
            </Text>
            </Flex>
        </Flex>
        {showMore ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Flex>

      {showMore && (
        <AutoColumn gap="8px" style={{ padding: '16px' }}>
          <FixedHeightRow>
            <RowFixed>
              <CurrencyLogo size="20px" currency={currency0} chainId={dex.chainId} />
              <Text color="textSubtle" ml="4px">
                Pooled {currency0.symbol}
              </Text>
            </RowFixed>
            {token0Deposited ? (
              <RowFixed>
                <Text ml="6px">{token0Deposited?.toSignificant(6)}</Text>
              </RowFixed>

            ) : (
              '-'
            )}
          </FixedHeightRow>
 
          <FixedHeightRow>
            <RowFixed>
              <CurrencyLogo size="20px" currency={currency1} chainId={dex.chainId} />
              <Text color="textSubtle" ml="4px">
                Pooled {currency1.symbol}
              </Text>
            </RowFixed>
            {token1Deposited ? (
              <RowFixed>
                <Text ml="6px">{token1Deposited?.toSignificant(6)}</Text>
              </RowFixed>
            ) : (
              '-'
            )}
          </FixedHeightRow>

          <FixedHeightRow>
            <Text color="textSubtle">Share of pool</Text>
            <Text>
              {poolTokenPercentage
                ? `${poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)}%`
                : '-'}
            </Text>
          </FixedHeightRow>

          {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, BIG_INT_ZERO) && (
            <FlexLayout>
              
      <Flex  justifyContent="center" alignItems="center" >
              <Button
                as={Link}
                to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                variant="primary"
             
              >
                {canMigrate ? "Remove/Migrate" : "Remove"}
              </Button>
              </Flex>
              <Flex justifyContent="center" alignItems="center" >
              <Button
                as={Link}
                to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                variant="primary"
                
              >
                Add
              </Button>
              </Flex>
            </FlexLayout>
          )}
        </AutoColumn>
      )}
    </Card>
  )
}
