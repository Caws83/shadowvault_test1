import BigNumber from 'bignumber.js'
import { getLanguageCodeFromLS } from 'contexts/Localization/helpers'

/**
 * Take a formatted amount, e.g. 15 BNB and convert it to full decimal value, e.g. 15000000000000000
 */
export const getDecimalAmount = (amount: BigNumber, decimals = 18): BigNumber => {
  return amount.shiftedBy(decimals)
}

export const getBalanceAmount = (amount: BigNumber, decimals = 18): BigNumber => {
  return amount.shiftedBy(-decimals)
}

/**
 * This function is not really necessary but is used throughout the site.
 */
export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  return Number(getBalanceAmount(balance, decimals))
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18, displayDecimals?: number) => {
  return getBalanceAmount(balance, decimals).toFixed(displayDecimals)
}

export const formatNumber = (number: number, minPrecision = 2, maxPrecision = 2) => {
  const options = {
    minimumFractionDigits: minPrecision,
    maximumFractionDigits: maxPrecision,
  }
  return number.toLocaleString(undefined, options)
}

/**
 * Method to format the display of wei given an ethers.BigNumber object
 * Note: does NOT round
 */
export const formatBigNumber = (number: bigint, displayDecimals = 18n, decimals = 18n) => {
  const remainder = number % 10n ** (decimals - displayDecimals)
  return ((number - remainder) / 10n ** decimals).toString()
}

/**
 * Method to format the display of wei given an ethers.BigNumber object with toFixed
 * Note: rounds
 */
export const formatBigNumberToFixed = (number: bigint, displayDecimals = 18, decimals = 18n) => {
  const formattedBigInt = number / 10n ** decimals
  return Number(formattedBigInt).toFixed(displayDecimals).toString()
}

/**
 * Formats a FixedNumber like BigNumber
 * i.e. Formats 9763410526137450427.1196 into 9.763 (3 display decimals)
 */
export const formatFixedNumber = (number: bigint, displayDecimals = 18n, decimals = 18n) => {
  // Remove decimal
  const [leftSide] = number.toString().split('.')
  return formatBigNumber(BigInt(leftSide), displayDecimals, decimals)
}

export const formatLocalisedCompactNumber = (number: number): string => {
  const codeFromStorage = getLanguageCodeFromLS()
  return new Intl.NumberFormat(codeFromStorage, {
    notation: 'compact',
    compactDisplay: 'long',
    maximumSignificantDigits: 2,
  }).format(number)
}
