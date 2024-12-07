import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useTotalSupply, useBurnedBalance } from 'hooks/useTokenBalance'
import { getMSWAPAddress } from 'utils/addressHelpers'
import { getBalanceNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { useFarms, useHostPricesBusd } from 'state/farms/hooks'
import { Flex, Text, Heading, Skeleton } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import { BIG_ZERO } from 'utils/bigNumber'
import { Farm } from 'state/types'
import BigNumber from 'bignumber.js'
import tokens from 'config/constants/tokens'
import { usePollFRTFarmsWithUserData } from 'state/farms/hooks'
import RowHeading from './RowHeading'

const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean }>`
  flex-direction: column;
  ${({ noMobileBorder, theme }) =>
    noMobileBorder
      ? `${theme.mediaQueries.md} {
           padding: 0 16px;
           border-left: 1px ${theme.colors.input} solid;
         }
       `
      : `border-left: 1px ${theme.colors.input} solid;
         padding: 0 8px;
         ${theme.mediaQueries.sm} {
           padding: 0 16px;
         }
       `}
`

const Grid = styled.div`
  display: grid;
  grid-gap: 16px 8px;
  margin-top: 24px;
  grid-template-columns: repeat(2, auto);

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 32px;
    grid-template-columns: repeat(4, auto);
  }
`

const CakeDataRow = () => {
  const { t } = useTranslation()
  const chainId = 109
  const totalSupply = new BigNumber(useTotalSupply(chainId))
  const burnedBalance = getBalanceNumber(useBurnedBalance(getMSWAPAddress(), chainId))
  const cakeSupply = totalSupply ? getBalanceNumber(totalSupply) - burnedBalance : 0
  const frtprice = useHostPricesBusd()[tokens.mswap.symbol]
  const mcap = frtprice.times(cakeSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())
  const { data: farmsLP } = useFarms()
  const [gotTVL, setGotTVL] = useState(false)
  const [tvlString, setTVLString] = useState('')
  const [emissionString, setEmissionString] = useState('')
  const [farms, setFarms] = useState<Farm[]>([])

  usePollFRTFarmsWithUserData(false)

  useEffect(() => {
    const farmList = farmsLP.filter((farm) => farm.host.payoutToken === tokens.mswap)
    setFarms(farmList)
  }, [farmsLP])

  useEffect(() => {
    let completed = 0
    let total = 0
    let emission = 0
    const tvlStep = farms.reduce((accum: BigNumber, farm: Farm) => {
      if (farm.isForEmmissions) {
        emission = new BigNumber(farm.blockReward).plus(emission).toNumber()
      }
      total++
      const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
      if (!totalLiquidity.isNaN()) {
        const amount = accum.plus(totalLiquidity)
        completed++
        return amount
      }
      return accum
    }, BIG_ZERO)
    if (total !== completed) {
      setGotTVL(false)
      setEmissionString(emission.toString())
    } else {
      setGotTVL(true)
      setTVLString(formatLocalisedCompactNumber(tvlStep.toNumber()))
      setEmissionString(emission.toString())
    }
  }, [farms])

  return (
    <>
    <RowHeading text={t('MSWAPF Token Info')} />
    <Grid>
      <Flex flexDirection="column">
        <Text color="textSubtle">{t('Total supply')}</Text>
        {cakeSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={cakeSupply} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </Flex>
      <StyledColumn>
        <Text color="textSubtle">{t('Burned to date')}</Text>
        {burnedBalance ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px" bold value={burnedBalance} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('Market cap')}</Text>
        {mcap?.gt(0) && mcapString ? (
          <Heading scale="lg">{t('$%marketCap%', { marketCap: mcapString })}</Heading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn>
        <Text color="textSubtle">{t('Current emissions')}</Text>

        <Heading scale="lg">{emissionString}/Second</Heading>
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('MSWAPF Value')}</Text>
        {frtprice ? (
          <Balance decimals={5} lineHeight="1.1" fontSize="24px" bold value={frtprice.toNumber()} />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text color="textSubtle">{t('MSWAPF Total Value Locked')}</Text>
        {gotTVL ? (
          <Heading scale="lg">{t('$%tvlInfo%', { tvlInfo: tvlString })}</Heading>
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
    </Grid>
    </>
  )
}

export default CakeDataRow
