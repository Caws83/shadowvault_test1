export interface CoinInfo {
  /* eslint-disable camelcase */
  id?: string
  symbol: string
  name?: string
  image?: string
  current_price: string
  market_cap?: number
  market_cap_rank?: number
  fully_diluted_valuation?: number
  total_volume?: number
  high_24h?: number
  low_24h?: number
  price_change_24h?: number
  price_change_percentage_24h?: number
  market_cap_change_24h?: number
  market_cap_change_percentage_24h?: number
  circulating_supply?: number
  total_supply?: number
  max_supply?: number
  ath?: number
  ath_change_percentage?: number
  ath_date?: string
  at1?: number
  at1_change_percentage?: number
  at1_date?: string
  roi?: ROI
  last_updated?: string
}

export interface ROI {
  times: number
  currency: string
  percentage: number
}
