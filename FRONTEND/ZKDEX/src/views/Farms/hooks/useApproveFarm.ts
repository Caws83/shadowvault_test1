import { useCallback } from 'react'
import { Address, Host } from 'config/constants/types'
import { getAddress } from 'utils/addressHelpers'
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { maxUint256 } from 'viem'
import { lpTokenAbi } from 'config/abi/lpToken'
import { config } from 'wagmiConfig'
import { useGasTokenManager } from 'state/user/hooks'
import sendTransactionPM from 'utils/easy/calls/paymaster'

const useApproveFarm = (masterChefAddress: `0x${string}`, lpAddress: Address, chainId: number) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleApprove = useCallback(async () => {
    try {
      const {request} = await simulateContract(config, {
        abi: lpTokenAbi,
        address: getAddress(lpAddress, chainId),
        functionName: 'approve',
        args: [masterChefAddress, maxUint256],
        chainId
      })
      const hash = await sendTransactionPM(request, payWithPM, chainId, getAddress(payToken.address, chainId))
      // const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash })
      return receipt.status
    } catch (e) {
      console.log((e as Error).message)
      return false
    }
  }, [lpAddress, masterChefAddress])

  return { onApprove: handleApprove }
}

export const useApproveFarmFromHost = (host: Host, lpAddress: Address) => {
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()

  const handleApprove = useCallback(async () => {
    try {
      const {request} = await simulateContract(config, {
        abi: lpTokenAbi,
        address: getAddress(lpAddress, host.chainId),
        functionName: 'approve',
        args: [getAddress(host.masterChef, host.chainId), maxUint256],
        chainId: host.chainId
      })
      const hash = await sendTransactionPM(request, payWithPM, host.chainId, getAddress(payToken.address, host.chainId))
      // const hash = await writeContract(config, request)
      const receipt = await waitForTransactionReceipt(config, { hash })
      return receipt.status
    } catch (e) {
      console.log((e as Error).message)
      return false
    }
  }, [lpAddress, host])

  return { onApprove: handleApprove }
}

export default useApproveFarm
