import { Currency, currencyEquals, getETHER, REALWBONE } from 'sdk'
import { useCallback, useMemo, useState } from 'react'
import { tryParseAmount } from '../state/swap/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useAccount, useChainId } from 'wagmi'
import { wethAbi } from 'config/abi/weth'
import { simulateContract, writeContract } from '@wagmi/core'
import { config } from 'wagmiConfig'
import sendTransactionPM from 'utils/easy/calls/paymaster'
import { useGasTokenManager } from 'state/user/hooks'
import { getAddress } from 'utils/addressHelpers'


export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */

export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
  chainId: number,
): { 
  wrapType: WrapType; 
  execute: () => Promise<void>; 
  inputError?: string; 
  getRequest: () => Promise<any | null>; 
} {
  const { address: account } = useAccount();
  const realAddress = REALWBONE[chainId].address;
  const ETHER = getETHER(chainId);
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const balance = useCurrencyBalance(chainId, account ?? undefined, inputCurrency);
  const inputAmount = useMemo(() => tryParseAmount(chainId, typedValue, inputCurrency), [inputCurrency, typedValue]);

  return useMemo(() => {
    if (!chainId || !inputCurrency || !outputCurrency) {
      return {
        wrapType: WrapType.NOT_APPLICABLE,
        execute: async () => {},
        inputError: undefined,
        getRequest: async () => null,
      };
    }

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount);

    const getRequest = async (): Promise<any | null> => {
      if (!inputAmount) return null;

      try {
        if (inputCurrency === ETHER && currencyEquals(REALWBONE[chainId], outputCurrency)) {
          // WRAP: Native to Wrapped
          const { request } = await simulateContract(config, {
            address: realAddress,
            abi: wethAbi,
            functionName: 'deposit',
            value: `0x${inputAmount.raw.toString(16)}`,
            chainId
          });
          return request;
        } else if (currencyEquals(REALWBONE[chainId], inputCurrency) && outputCurrency === ETHER) {
          // UNWRAP: Wrapped to Native
          const { request } = await simulateContract(config, {
            address: realAddress,
            abi: wethAbi,
            functionName: 'withdraw',
            args: [`0x${inputAmount.raw.toString(16)}`],
            chainId
          });
          return request;
        }
      } catch (error) {
        console.error('Error in getRequest', error);
        return null;
      }
      return null;
    };

    const execute = sufficientBalance && inputAmount ? async () => {
      const request = await getRequest();
      if (!request) {
        console.error('Failed to get request');
        return;
      }

      try {
        await sendTransactionPM(request, payWithPM, chainId, getAddress(payToken.address, chainId));
      } catch (error) {
        console.error('Transaction execution failed', error);
      }
    } : async () => {};

    const wrapType = inputCurrency === ETHER && currencyEquals(REALWBONE[chainId], outputCurrency)
      ? WrapType.WRAP
      : currencyEquals(REALWBONE[chainId], inputCurrency) && outputCurrency === ETHER
      ? WrapType.UNWRAP
      : WrapType.NOT_APPLICABLE;

    const inputError = sufficientBalance ? undefined : 'Insufficient balance';

    return {
      wrapType,
      execute,
      inputError,
      getRequest,
    };
  }, [balance, chainId, inputAmount, inputCurrency, outputCurrency, realAddress, payWithPM]);
}


