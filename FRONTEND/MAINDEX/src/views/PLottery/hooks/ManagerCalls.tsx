import { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import useRefresh from 'hooks/useRefresh'
import { PLottery } from 'state/types'
import { getAddress, getLotteryKeeperAddress } from 'utils/addressHelpers'
import { lotteryV3Abi } from 'config/abi/lotteryV3'
import { keeperAbi } from 'config/abi/keeper'
import { simulateContract, readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'
import useToast from 'hooks/useToast'

export const useManagerCalls = (plottery: PLottery) => {
  const { toastSuccess, toastError } = useToast()
  const { t } = useTranslation()
  const lotteryAddress = getAddress(plottery.lotteryAddress, plottery.chainId)

  const useGetKeeperInfo = () => {
    const { slowRefresh } = useRefresh()
    const [ticketFee, setTicketFee] = useState<BigNumber>()

    useEffect(() => {
      async function fetchInfo() {
        const info2 = await readContract(config, {
          abi: lotteryV3Abi,
          address: getAddress(plottery.lotteryAddress, plottery.chainId),
          functionName: 'BNBfee',
          chainId: plottery.chainId
        })
        const ticketFeeRaw = new BigNumber(info2.toString())

        setTicketFee(ticketFeeRaw)
      }
      fetchInfo()
    }, [slowRefresh, plottery])

    return { ticketFee }
  }

  const handleExtendLottery = useCallback(
    async (howMany, amount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: keeperAbi,
          address: getLotteryKeeperAddress(),
          functionName: 'extendLottery',
          args: [lotteryAddress, howMany],
          value: amount,
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess, lotteryAddress],
  )

  const handleExtendLotteryAdmin = useCallback(
    async (howMany) => {
      try {
        const { request } = await simulateContract(config, {
          abi: keeperAbi,
          address: getLotteryKeeperAddress(),
          functionName: 'addToNumberOfDrawsAdmin',
          args: [lotteryAddress, howMany],
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess, lotteryAddress],
  )

  const handleAdminFundKeeper = useCallback(
    async (amount) => {
      try {
        const { request } = await simulateContract(config, {
          abi: keeperAbi,
          address: getLotteryKeeperAddress(),
          functionName: 'fundCLAdmin',
          value: amount,
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess],
  )

  const handleChangeTicketCost = useCallback(
    async (newCost: string) => {
      try {
        const { request } = await simulateContract(config, {
          abi: keeperAbi,
          address: getLotteryKeeperAddress(),
          functionName: 'changeLotteryTicketPrice',
          args: [lotteryAddress, newCost],
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess, lotteryAddress],
  )

  const handleChangeDrawFee = useCallback(
    async (newCost) => {
      try {
        const { request } = await simulateContract(config, {
          abi: keeperAbi,
          address: getLotteryKeeperAddress(),
          functionName: 'changeLotteryBNBFee',
          args: [lotteryAddress, newCost],
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess, lotteryAddress],
  )

  const handleTicketFee = useCallback(
    async (newCost) => {
      try {
        const { request } = await simulateContract(config, {
          abi: lotteryV3Abi,
          address: getAddress(plottery.lotteryAddress, plottery.chainId),
          functionName: 'setCostBNB',
          args: [newCost],
          chainId: plottery.chainId
        })
        const hash = await writeContract(config, request)
        const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

        if (receipt.status === 'success') {
          toastSuccess(t('Transaction Success'))
        } else {
          // user rejected tx or didn't go thru
          toastError(
            t('Error'),
            t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
          )
        }
      } catch (e) {
        console.error(e)
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError, toastSuccess, plottery.lotteryAddress],
  )

  const handleManualUpKeep = useCallback(async () => {
    try {
      const { request } = await simulateContract(config, {
        abi: keeperAbi,
        address: getLotteryKeeperAddress(),
        functionName: 'manualUpkeep',
        chainId: plottery.chainId
      })
      const hash = await writeContract(config, request)
      const receipt = (await waitForTransactionReceipt(config, {hash})) as TransactionReceipt

      if (receipt.status === 'success') {
        toastSuccess(t('UpKeep Success'))
      } else {
        // user rejected tx or didn't go thru
        toastError(
          t('Error'),
          t('User Rejected tx or it did not go through properly. Please Try again, and check gas!'),
        )
      }
    } catch (e) {
      console.error(e)
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    }
  }, [t, toastError, toastSuccess])

  return {
    onInfo: useGetKeeperInfo,
    onTicketFee: handleTicketFee,
    onExtend: handleExtendLottery,
    onADA: handleExtendLotteryAdmin,
    onTCost: handleChangeTicketCost,
    onDF: handleChangeDrawFee,
    onAdminFund: handleAdminFundKeeper,
    onDraw: handleManualUpKeep,
  }
}
