import { getWalletClient, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { encodeFunctionData, erc20Abi, hexToBigInt, TransactionReceipt } from 'viem'
import { eip712WalletActions } from 'viem/zksync'
import { config } from 'wagmiConfig'
import { useAccount } from 'wagmi'
import { useGasTokenManager } from 'state/user/hooks'
import useToast from './useToast'
import BigNumber from 'bignumber.js'
import { getAddress } from 'utils/addressHelpers'
import { defaultChainId } from 'config/constants/chains'

function normalizeValue(value: string | bigint | BigNumber | number): string {
  if (typeof value === 'string') {
    // Check if the string is a hexadecimal value
    if (value.startsWith('0x')) {
      // Convert hex string to a BigNumber and then to a decimal string
      return BigNumber(value, 16).toString();
    }
    // If it's a string and not a hex, assume it's already in a valid format
    return value;
  } else if (typeof value === 'bigint') {
    // Convert bigint to string
    return value.toString();
  } else if (typeof value === 'number') {
    // Convert number to string using BigNumber to handle large numbers
    return new BigNumber(value).toString();
  } else if (value instanceof BigNumber) {
    // If it's already a BigNumber, just convert to string
    return value.toString();
  } else {
    throw new Error('Unsupported value type');
  }
}

// Custom Hook to handle the Paymaster transaction
export function usePaymaster() {

  const { chain } = useAccount()
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const { toastSuccess, toastError } = useToast()
  const chainId = chain?.id ?? defaultChainId


  // Function to fetch API response data
  const fetchPaymaster = async (payload: any) => {
    const normalizedValue = normalizeValue(payload.value ?? '0');
    const encodedFunctionData = encodeFunctionData({
      abi: payload.abi,
      functionName: payload.functionName,
      args: payload.args,
    })

    const apiRequestData = {
      chainId: chainId,
      feeTokenAddress: getAddress(payToken.address, chainId),
      txData: {
        from: payload.account.address,
        to: payload.address,
        data: encodedFunctionData,
        value: normalizedValue,
      },
    }
    const response = await fetch('https://api.zyfi.org/api/erc20_paymaster/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequestData),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch API response data.')
    }

    const apiResponseData = await response.json()
    return apiResponseData
  }

  const sendTransaction = async (payload: any): Promise<`0x${string}`> => {
    if (payWithPM) {
      console.log(payload)
      const normalizedValue = normalizeValue(payload.value ?? '0');
      // Step 1: Encode the function data for the transfer
      const encodedFunctionData = encodeFunctionData({
        abi: payload.abi,
        functionName: payload.functionName,
        args: payload.args,
      })

      // Step 2: Prepare the API request payload
      const apiRequestData = {
        chainId: chainId,
        feeTokenAddress: getAddress(payToken.address, chainId),
        txData: {
          from: payload.account.address,
          to: payload.address,
          data: encodedFunctionData,
          value: normalizedValue,
        },
      }
      console.log(apiRequestData)
      const response = await fetch('https://api.zyfi.org/api/erc20_paymaster/v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequestData),
      })

      const apiResponseData = await response.json()
      // Step 4: Get the wallet client and extend it with EIP-712 wallet actions
      const walletClient = (await getWalletClient(config)).extend(eip712WalletActions()) as any
      const nonce = await getTransactionCount(config, { address: apiResponseData.txData.from })
console.log(apiResponseData)
      // Step 5: Prepare the transaction data for the paymaster
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
        data: apiResponseData.txData.data,
        nonce
      };
          
      // CHECK FOR BALANCE
      const balance = await readContract(config,{
        address: getAddress(payToken.address, chainId),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [apiResponseData.txData.from],
        chainId
      })
      const needed = apiResponseData.feeTokenAmount
      if(new BigNumber(balance.toString()).lte(needed)) {
        toastError('Error', 'Not enough Balance of GAS Token')
        return;
      } else {
        toastSuccess(
          'Estimated Tokens Needed:', 
            `${new BigNumber(needed.toString()).shiftedBy(-18)} Tokens for Gas`
        )
      }
console.log(paymasterTxData)
      try {
        //const { request } = await simulateContract(config, paymasterTxData)
      const hash = await walletClient.sendTransaction(paymasterTxData)
      // const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, {hash}) as TransactionReceipt
      
      if (receipt.status) {
        toastSuccess(
          'Congrats', 
            'Your Swap Was Successful Using Paymaster'
        )
      } else {
        // user rejected tx or didn't go thru
        toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
      }
      
      return hash
    } catch (e){
      toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
      console.log(e)
      throw new Error('Transaction rejected.')
    }
    } else {
      try {
      // Fallback: Send the transaction directly without paymaster
      const hash = await writeContract(config, payload)
      const receipt = await waitForTransactionReceipt(config, {hash}) as TransactionReceipt
      
      if (receipt.status) {
        toastSuccess(
          'Congrats', 
            'Your Swap  Was Successful'
        )
      } else {
        // user rejected tx or didn't go thru
        toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
      }
      return hash
    } catch (e){
      toastError('Error', 'Likely Due to User Rejecting the tx. Or TX Reverted')
      console.log(e)
      throw new Error('Transaction rejected.')
      return undefined
    }
    }
  }

  return { sendTransaction, fetchPaymaster }
}
