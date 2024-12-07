import { filterFarmsByQuoteToken } from 'utils/farmsPriceHelpers'
import { Farm } from 'state/types'
import { GetCICPriceFromLBank, getTokenPrice } from 'state/pools'
import BigNumber from 'bignumber.js'
import { BIG_ONE, BIG_ZERO } from 'utils/bigNumber'

const getFarmFromTokenSymbol = (farms: Farm[], tokenSymbol: string, preferredQuoteTokens?: string[]): Farm => {
  const farmsWithTokenSymbol = farms.filter((farm) => farm.token.symbol === tokenSymbol)
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
  return filteredFarm
}

const getFarmBaseTokenPrice = async (farm: Farm, quoteTokenFarm: Farm, bnbPriceBusd: BigNumber): Promise<BigNumber> => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === 'vUSD' || farm.quoteToken.symbol === 'TUSD') {
    return hasTokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : BIG_ZERO
  }

  if (farm.quoteToken.symbol === 'WCRO') {
    return hasTokenPriceVsQuote ? bnbPriceBusd.multipliedBy(farm.tokenPriceVsQuote) : BIG_ZERO
  }

  try {
    const tokenPrice = await getTokenPrice(farm.dex, farm.token)
    return new BigNumber(tokenPrice)
  } catch {}

  if (quoteTokenFarm) {

    if (quoteTokenFarm.quoteToken.symbol === 'WCRO') {
      const quoteTokenInBusd = bnbPriceBusd.multipliedBy(quoteTokenFarm.tokenPriceVsQuote)
      return hasTokenPriceVsQuote && quoteTokenInBusd
        ? new BigNumber(farm.tokenPriceVsQuote).multipliedBy(quoteTokenInBusd)
        : BIG_ZERO
    }

    if (quoteTokenFarm.quoteToken.symbol === 'vUSD' || quoteTokenFarm.quoteToken.symbol === 'TUSD') {
      const quoteTokenInBusd = new BigNumber(quoteTokenFarm.tokenPriceVsQuote)
      return hasTokenPriceVsQuote && quoteTokenInBusd
        ? new BigNumber(farm.tokenPriceVsQuote).multipliedBy(quoteTokenInBusd)
        : BIG_ZERO
    }
  }

  try {
    const tokenPrice = await getTokenPrice(farm.dex, farm.quoteToken)
    return new BigNumber(tokenPrice)
  } catch {
    return BIG_ZERO
  }

}

const getFarmQuoteTokenPrice = async (farm: Farm, quoteTokenFarm: Farm, bnbPriceBusd: BigNumber): Promise<BigNumber> => {
  if (farm.quoteToken.symbol === 'vUSD' || farm.quoteToken.symbol === 'TUSD') {
    return BIG_ONE
  }

  if (farm.quoteToken.symbol === 'WCRO') {
    return bnbPriceBusd
  }

  if (quoteTokenFarm) {
  
    if (quoteTokenFarm.quoteToken.symbol === 'WCRO') {
      return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd.multipliedBy(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
    }

    if (quoteTokenFarm.quoteToken.symbol === 'vUSD' || quoteTokenFarm.quoteToken.symbol === 'TUSD') {
      return quoteTokenFarm.tokenPriceVsQuote ? new BigNumber(quoteTokenFarm.tokenPriceVsQuote) : BIG_ZERO
    }
  }
  try {
    const tokenPrice = await getTokenPrice(farm.dex, farm.quoteToken)
    return new BigNumber(tokenPrice)
  } catch {
    return BIG_ZERO
  }
  
}

const fetchFarmsPrices = async (farms) => {
  const farmsWithPricesPromises = farms.map(async (farm) => {
    const bnbPriceBusd = await GetCICPriceFromLBank(farm.dex)
    const quoteTokenFarm = getFarmFromTokenSymbol(farms, farm.quoteToken.symbol)
    const baseTokenPrice = await getFarmBaseTokenPrice(farm, quoteTokenFarm, new BigNumber(bnbPriceBusd))
    const quoteTokenPrice = await getFarmQuoteTokenPrice(farm, quoteTokenFarm, new BigNumber(bnbPriceBusd))
    const token = { ...farm.token, busdPrice: baseTokenPrice.toJSON() }
    const quoteToken = { ...farm.quoteToken, busdPrice: quoteTokenPrice.toJSON() }

    return { ...farm, token, quoteToken }
  })

  const farmsWithPrices = await Promise.all(farmsWithPricesPromises)
  return farmsWithPrices
}

export default fetchFarmsPrices
