import { getWalletClient, readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core"
import BigNumber from "bignumber.js"
import { encodeFunctionData, erc20Abi, TransactionReceipt, Address } from "viem"
import { eip712WalletActions } from "viem/zksync"
import { config, chains } from "wagmiConfig"

function normalizeValue(value: string | bigint | BigNumber | number): string {
  if (typeof value === 'string') {
    if (value.startsWith('0x')) {
      return BigNumber(value, 16).toString();
    }
    return value;
  } else if (typeof value === 'bigint') {
    return value.toString();
  } else if (typeof value === 'number') {
    return new BigNumber(value).toString();
  } else if (value instanceof BigNumber) {
    return value.toString();
  } else {
    throw new Error('Unsupported value type');
  }
}

const sendTransactionPM = async (payload: any, payWithPM: boolean, chainId: number, feeTokenAddress: string): Promise<`0x${string}` | undefined> => {
  const attemptDirectTransaction = async () => {
    try {
      const hash = await writeContract(config, payload);
      const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt;
      return hash;
    } catch (e) {
      console.log(e);
      throw new Error('Transaction rejected.');
    }
  };

  if (payWithPM) {
    try {
      console.log("payload", payload);
      const normalizedValue = normalizeValue(payload.value ?? '0');
      const chain = chains.find((c) => c.id === chainId);
      const encodedFunctionData = encodeFunctionData({
        abi: payload.abi,
        functionName: payload.functionName,
        args: payload.args ?? [],
      });

      const apiRequestData = {
        chainId,
        feeTokenAddress: feeTokenAddress,
        txData: {
          from: payload.account.address,
          to: payload.address,
          data: encodedFunctionData,
          value: normalizedValue,
        },
      };
      console.log("request", apiRequestData);
      const response = await fetch('https://api.zyfi.org/api/erc20_paymaster/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequestData),
      });

      const apiResponseData = await response.json();
      console.log("response", apiResponseData);
      const walletClient = (await getWalletClient(config)).extend(eip712WalletActions()) as any;

      const paymasterTxData = {
        account: apiResponseData.txData.from,
        to: apiResponseData.txData.to,
        value: BigInt(apiResponseData.txData.value),
        chain,
        gas: BigInt(apiResponseData.gasLimit),
        gasPerPubdata: BigInt(apiResponseData.txData.customData.gasPerPubdata),
        maxFeePerGas: BigInt(apiResponseData.txData.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(0),
        paymaster: apiResponseData.txData.customData.paymasterParams.paymaster,
        paymasterInput: apiResponseData.txData.customData.paymasterParams.paymasterInput,
        data: apiResponseData.txData.data
      };
      console.log("txData", paymasterTxData);
      const balance = await readContract(config, {
        address: feeTokenAddress as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payload.account.address],
        chainId
      });

      const needed = apiResponseData.feeTokenAmount;

      if (new BigNumber(balance.toString()).lte(needed)) {
        console.log("Not enough balance for gas.");
        return undefined;
      }

      console.log("sending");
      const hash = await walletClient.sendTransaction(paymasterTxData);
      console.log("sent");
      const receipt = await waitForTransactionReceipt(config, { hash }) as TransactionReceipt;

      return hash;
    } catch (e) {
      console.log("Paymaster transaction failed", e);
    }
  } else {
    return await attemptDirectTransaction();
  }
};

export default sendTransactionPM;
