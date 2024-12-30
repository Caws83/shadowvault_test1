import { ChainId, Currency, currencyEquals, getWBONE, JSBI, Price } from 'sdk'
import { useEffect, useMemo, useState } from 'react'
import { getTokenPrice, GetCICPriceFromLBank, getTokenPriceString } from 'state/pools'
import { Dex, Token } from 'config/constants/types'
import { dexs } from '../config/constants/dex'
import { USDT } from '../config/constants/tokens'
import { PairState, usePairs } from './usePairs'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import useRefresh from './useRefresh'
import { useAccount, useChainId } from 'wagmi'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { Address } from 'viem'

const BUSD_CICNET = USDT[ChainId.NEONDEV]
const WBONE = getWBONE()
/**
 * Returns the price in USDT of the input currency
 * @param currency currency to compute the USDT price of
 */
export default function useBUSDPrice(currency?: Currency): Price | undefined {
  const chainId = useChainId()
  const wrapped = wrappedCurrency(currency, chainId)
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WBONE[chainId], wrapped) ? undefined : currency,
        chainId ? WBONE[chainId] : undefined,
      ],
      [wrapped?.equals(BUSD_CICNET) ? undefined : wrapped, chainId === ChainId.NEONDEV ? BUSD_CICNET : undefined],
      [chainId ? WBONE[chainId] : undefined, chainId === ChainId.NEONDEV ? BUSD_CICNET : undefined],
    ],
    [chainId, currency, wrapped],
  )
  const [[ethPairState, ethPair], [busdPairState, busdPair], [busdEthPairState, busdEthPair]] = usePairs(
    dexs.forgeTest,
    tokenPairs,
  )

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (wrapped.equals(WBONE[chainId])) {
      if (busdPair) {
        const price = busdPair.priceOf(WBONE[chainId])
        return new Price(currency, BUSD_CICNET, price.denominator, price.numerator)
      }
      return undefined
    }
    // handle busd
    if (wrapped.equals(BUSD_CICNET)) {
      return new Price(BUSD_CICNET, BUSD_CICNET, '1', '1')
    }

    const ethPairETHAmount = ethPair?.reserveOf(WBONE[chainId])
    const ethPairETHBUSDValue: JSBI =
      ethPairETHAmount && busdEthPair ? busdEthPair.priceOf(WBONE[chainId]).quote(ethPairETHAmount, chainId).raw : JSBI.BigInt(0)

    // all other tokens
    // first try the busd pair
    if (
      busdPairState === PairState.EXISTS &&
      busdPair &&
      busdPair.reserveOf(BUSD_CICNET).greaterThan(ethPairETHBUSDValue)
    ) {
      const price = busdPair.priceOf(wrapped)
      return new Price(currency, BUSD_CICNET, price.denominator, price.numerator)
    }
    if (ethPairState === PairState.EXISTS && ethPair && busdEthPairState === PairState.EXISTS && busdEthPair) {
      if (busdEthPair.reserveOf(BUSD_CICNET).greaterThan('0') && ethPair.reserveOf(WBONE[chainId]).greaterThan('0')) {
        const ethBusdPrice = busdEthPair.priceOf(BUSD_CICNET)
        const currencyEthPrice = ethPair.priceOf(WBONE[chainId])
        const busdPrice = ethBusdPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, BUSD_CICNET, busdPrice.denominator, busdPrice.numerator)
      }
    }
    return undefined
  }, [chainId, currency, ethPair, ethPairState, busdEthPair, busdEthPairState, busdPair, busdPairState, wrapped])
}



export const useGetWcicPrice = (dex?: Dex) => {
  const { fastRefresh } = useRefresh();
  const [price, setPrice] = useState<BigNumber>(BIG_ZERO);
  const { chain } = useAccount();

  useEffect(() => {
    async function fetchPrice() {
      // get from Selected dex
      if (dex) {
        const priceRaw = await GetCICPriceFromLBank(dex);
        if (new BigNumber(priceRaw.toString()).gt(0)) {
          setPrice(new BigNumber(priceRaw));
        }
      }
      // if no price, get value from another dex on that chain
      if(dex && price.eq(BIG_ZERO) ) {
        for (const key in dexs) {
          if (dexs[key].chainId === dex.chainId) {
            const priceRaw = await GetCICPriceFromLBank(dexs[key]);
            if (new BigNumber(priceRaw.toString()).gt(0)) {
              setPrice(new BigNumber(priceRaw));
              break;
            }
          }
        }
      }
      // get from current connected chain
      if(!dex || price.eq(BIG_ZERO) ) {
        for (const key in dexs) {
          if (dexs[key].chainId === chain?.id || dexs[key].chainId === dex?.chainId) {
            const priceRaw = await GetCICPriceFromLBank(dexs[key]);
            if (new BigNumber(priceRaw.toString()).gt(0)) {
              setPrice(new BigNumber(priceRaw));
              break;
            }
          }
        }
      }
    }

    fetchPrice();
  }, [fastRefresh, chain, dex]);

  return price;
};

/*
export const useGetTokenPrice = (dex: Dex, token: Token) => {
  const { slowRefresh } = useRefresh()
  const [price, setPrice] = useState<BigNumber>(BIG_ZERO)
  const isMounted = useRef(true);

  useEffect(() => {
    async function fetchInfo() {
      let priceRaw;
        if (token === tokens.wbone) {
          priceRaw = await GetCICPriceFromLBank();
        } else {
          priceRaw = await getTokenPrice(dex, token);
        }
        if (isMounted.current) {
          setPrice(new BigNumber(priceRaw.toString()));
        }
    }
    
    fetchInfo()
     return () => {
      isMounted.current = false;
    };
  }, [slowRefresh, dex, token])

  return price
}
*/

export const useGetTokenPrice = (dex: Dex, token: Token) => {
  const { slowRefresh } = useRefresh()
  const [price, setPrice] = useState<number>(0)

  useEffect(() => {
    async function fetchInfo() {
      const priceRaw = await getTokenPrice(dex, token)

      setPrice(priceRaw)
    }
    fetchInfo()
  }, [slowRefresh, dex, token])

  return price
}

export const useGetTokenPriceString = (dex: Dex, tokenAddress: string, decimals: number, x?: string) => {
  const { slowRefresh } = useRefresh();
  const [price, setPrice] = useState<BigNumber>(BIG_ZERO);

  useEffect(() => {
    async function fetchPrice() {
     
        const priceRaw = await getTokenPriceString(dex, tokenAddress as Address, decimals)
        if (new BigNumber(priceRaw.toString()).gt(0)) {
          setPrice(new BigNumber(priceRaw));
        } else {
        for (const key in dexs) {
          if (dexs[key].chainId === dex.chainId) {
            const priceRaw = await getTokenPriceString(dexs[key], tokenAddress as Address, decimals);
            if (new BigNumber(priceRaw.toString()).gt(0)) {
              setPrice(new BigNumber(priceRaw));
              break;
            }
          }
        }
      }
    }

    fetchPrice();
  }, [slowRefresh, dex, tokenAddress, x])

  return price;
};

export const useGetTokenPriceString2 = (dex: Dex, tokenAddress: string, decimals: number) => {
  const { slowRefresh } = useRefresh()
  const [price, setPrice] = useState<number>(0)

  useEffect(() => {
    async function fetchInfo() {
      const priceRaw = await getTokenPriceString(dex, tokenAddress as Address, decimals)

      setPrice(priceRaw)
    }
    fetchInfo()
  }, [slowRefresh, dex, tokenAddress])

  return price
}
