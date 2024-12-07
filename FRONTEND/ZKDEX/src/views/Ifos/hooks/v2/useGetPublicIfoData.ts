import { useEffect, useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { EPOCH_TIME } from 'config'
import { Ifo, IfoStatus } from 'config/constants/types'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import useRefresh from 'hooks/useRefresh'
import { BIG_ZERO } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import { PublicIfoData } from '../../types'
import { getStatus } from '../helpers'
import { ifoV2Abi } from 'config/abi/ifoV2'
import { readContracts } from '@wagmi/core'
import {config } from 'wagmiConfig'

// https://github.com/pancakeswap/pancake-contracts/blob/master/projects/ifo/contracts/IFOV2.sol#L431
// 1,000,000,000 / 100
const TAX_PRECISION = 10000000000

const formatPool = (pool) => ({
  raisingAmountPool: pool ? new BigNumber(pool[0].toString()) : BIG_ZERO,
  offeringAmountPool: pool ? new BigNumber(pool[1].toString()) : BIG_ZERO,
  limitPerUserInLP: pool ? new BigNumber(pool[2].toString()) : BIG_ZERO,
  hasTax: pool ? pool[3] : false,
  totalAmountPool: pool ? new BigNumber(pool[4].toString()) : BIG_ZERO,
  sumTaxesOverflow: pool ? new BigNumber(pool[5].toString()) : BIG_ZERO,
})

/**
 * Gets all public data of an IFO
 */
const useGetPublicIfoData = (ifo: Ifo): PublicIfoData => {
  const { address: addressRaw } = ifo
  const address = getAddress(addressRaw, ifo.dex.chainId)
  const lpTokenPriceInUsd = useGetWcicPrice(ifo.dex)
  const { slowRefresh } = useRefresh()

  const [state, setState] = useState({
    status: 'idle' as IfoStatus,
    blocksRemaining: 0,
    secondsUntilStart: 0,
    progress: 5,
    secondsUntilEnd: 0,
    poolBasic: {
      raisingAmountPool: BIG_ZERO,
      offeringAmountPool: BIG_ZERO,
      limitPerUserInLP: BIG_ZERO,
      taxRate: 0,
      totalAmountPool: BIG_ZERO,
      sumTaxesOverflow: BIG_ZERO,
    },
    poolUnlimited: {
      raisingAmountPool: BIG_ZERO,
      offeringAmountPool: BIG_ZERO,
      limitPerUserInLP: BIG_ZERO,
      taxRate: 0,
      totalAmountPool: BIG_ZERO,
      sumTaxesOverflow: BIG_ZERO,
    },
    startBlockNum: 0,
    endBlockNum: 0,
    softCap: BIG_ZERO,
    hardCap: BIG_ZERO,
    fgFee: BIG_ZERO,
    finalized: true,
    admin: '',
  })
  // const { currentBlock } = useBlock()
  const currentBlock = Date.now() / 1000

  const fetchIfoData = useCallback(async () => {
    const data = await readContracts(config, {
      contracts: [
      {
        abi: ifoV2Abi,
        address,
        functionName: 'startBlock',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'endBlock',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'viewPoolInformation',
        args: [0n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'viewPoolInformation',
        args: [1n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'viewPoolTaxRateOverflow',
        args: [1n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'SoftCap',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'HardCap',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'marsFee',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'finalized',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV2Abi,
        address,
        functionName: 'devWallet',
        chainId: ifo.dex.chainId
      },
    ]
  })
    const startBlock = data[0].result
    const endBlock = data[1].result
    const poolBasic = data[2].result
    const poolUnlimited = data[3].result
    const taxRate = data[4].result
    const SoftCap = data[5].result
    const HardCap = data[6].result
    const marsFee = data[7].result
    const finalized = data[8].result
    const devWallet = data[9].result

    const poolBasicFormatted = formatPool(poolBasic)
    const poolUnlimitedFormatted = formatPool(poolUnlimited)

    const startBlockNum = startBlock ? Number(startBlock) : 0
    const endBlockNum = endBlock ? Number(endBlock) : 0
    const taxRateNum = taxRate ? new BigNumber(taxRate.toString()).div(TAX_PRECISION).toNumber() : 0
    const hardCapNum = HardCap ? new BigNumber(HardCap.toString()) : BIG_ZERO
    const softCapNum = SoftCap ? new BigNumber(SoftCap.toString()) : BIG_ZERO
    const fgFeeNum = marsFee ? new BigNumber(marsFee.toString()) : BIG_ZERO
    const adminString = devWallet

    const status = getStatus(currentBlock, startBlockNum, endBlockNum)
    const totalBlocks = endBlockNum - startBlockNum
    const blocksRemaining = endBlockNum - currentBlock

    // Calculate the total progress until finished or until start
    const progress =
      currentBlock > startBlockNum
        ? ((currentBlock - startBlockNum) / totalBlocks) * 100
        : ((currentBlock - endBlockNum) / (startBlockNum - endBlockNum)) * 100

    setState((prev) => ({
      ...prev,
      secondsUntilEnd: blocksRemaining * Number(EPOCH_TIME),
      secondsUntilStart: (startBlockNum - Number(currentBlock)) * Number(EPOCH_TIME),
      poolBasic: { ...poolBasicFormatted, taxRate: 0 },
      poolUnlimited: { ...poolUnlimitedFormatted, taxRate: taxRateNum },
      status,
      progress,
      blocksRemaining,
      startBlockNum,
      endBlockNum,
      softCap: softCapNum,
      hardCap: hardCapNum,
      fgFee: fgFeeNum,
      finalized: finalized,
      admin: adminString,
    }))
  }, [address, currentBlock])

  useEffect(() => {
    fetchIfoData()
  }, [fetchIfoData, slowRefresh])

  return { ...state, currencyPriceInUSD: new BigNumber(lpTokenPriceInUsd.toString()), fetchIfoData }
}

export default useGetPublicIfoData
