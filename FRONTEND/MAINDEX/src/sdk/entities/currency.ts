import JSBI from 'jsbi';
import { SolidityType } from '../constants';
import { validateSolidityTypeInstance } from '../utils';
import { getPublicClient } from '@wagmi/core';
import { config } from 'wagmiConfig';

/**
 * A currency is any fungible financial instrument on Ethereum, including Ether and all ERC20 tokens.
 */
export class Currency {
  [x: string]: any;
  public readonly decimals: number;
  public readonly symbol?: string;
  public readonly name?: string;

  /**
   * Constructs an instance of the base class `Currency`.
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  constructor(decimals: number, symbol?: string, name?: string) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8);

    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }

  /**
   * Create an instance of `Currency` with default values.
   */
  public static createDefault(): Currency {
    return new Currency(18, 'zkCRO', 'zkCRO');
  }
}

/**
 * Get the dynamic ETHER instance based on the provided data.
 * @param data Object containing chain information
 * @returns The dynamic ETHER instance
 */
export function getETHER(chainId?: number): Currency {
  const data = getPublicClient(config, {chainId})
  
  if (data?.chain && data?.chain?.nativeCurrency) {
    return data.chain.nativeCurrency;
  } else {
    return Currency.createDefault();
  }
}


