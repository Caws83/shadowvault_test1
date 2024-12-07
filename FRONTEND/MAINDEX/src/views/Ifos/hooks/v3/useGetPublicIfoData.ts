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
import { ifoV3Abi } from 'config/abi/ifoV3'
import { readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'

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
    percentToLiquidy: BIG_ZERO,
    isLocked: false,
    listingPrice: BIG_ZERO,
    lockLength: BIG_ZERO,
    initialLockTime: BIG_ZERO,
    autoBurn: false,
    logo: "",
    banner: "",
    telegram: "",
    twitter: "",
    website: ""
  })
  // const { currentBlock } = useBlock()
  const currentBlock = Date.now() / 1000

  const fetchIfoData = useCallback(async () => {
    const data = await readContracts(config, {
      contracts: [
      {
        abi: ifoV3Abi,
        address,
        functionName: 'viewData',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV3Abi,
        address,
        functionName: 'viewPoolInformation',
        args: [0n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV3Abi,
        address,
        functionName: 'viewPoolInformation',
        args: [1n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV3Abi,
        address,
        functionName: 'viewPoolTaxRateOverflow',
        args: [1n],
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV3Abi,
        address,
        functionName: 'socials',
        chainId: ifo.dex.chainId
      },
      {
        abi: ifoV3Abi,
        address,
        functionName: 'autoBurnLP',
        chainId: ifo.dex.chainId
      }
    ]
  })
  
  if(!data[0]) return

    const startBlock = data[0].result[0]
    const endBlock = data[0].result[1]
    const poolBasic = data[1].result
    const poolUnlimited = data[2].result
    const taxRate = data[3].result
    const SoftCap = data[0].result[2]
    const HardCap = data[0].result[3]
    const marsFee = data[0].result[4]
    const finalized = data[0].result[5]
    const devWallet = data[0].result[6]
    const toLiquify = data[0].result[7]
    const listingP = data[0].result[8]
    const lockDays = data[0].result[9]
    const isLockedRaw = data[0].result[10]
    const initialLockTime = data[0].result[11]
    const logo = data[4].result[0]
    const website = data[4].result[1]
    const banner = data[4].result[2]
    const tg = data[4].result[3]
    const x = data[4].result[4]
    const autoBurn = data[5].result
    

    const poolBasicFormatted = formatPool(poolBasic)
    const poolUnlimitedFormatted = formatPool(poolUnlimited)

    const startBlockNum = startBlock ? Number(startBlock) : 0
    const endBlockNum = endBlock ? Number(endBlock) : 0
    const taxRateNum = taxRate ? new BigNumber(taxRate.toString()).div(TAX_PRECISION).toNumber() : 0
    const hardCapNum = HardCap ? new BigNumber(HardCap.toString()) : BIG_ZERO
    const softCapNum = SoftCap ? new BigNumber(SoftCap.toString()) : BIG_ZERO
    const fgFeeNum = marsFee ? new BigNumber(marsFee.toString()) : BIG_ZERO
    const adminString = devWallet
    const toLiquifyNum = toLiquify ? new BigNumber(toLiquify.toString()) : BIG_ZERO
    const listingPNum = listingP ? new BigNumber(listingP.toString()) : BIG_ZERO
    const lockDaysNum = lockDays ? new BigNumber(lockDays.toString()) : BIG_ZERO
    const isLocked = isLockedRaw ? isLockedRaw : false
    const initialLockTimeNum = initialLockTime ? new BigNumber(initialLockTime.toString()) : BIG_ZERO

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
      percentToLiquidy: toLiquifyNum,
      isLocked: isLocked,
      listingPrice: listingPNum,
      lockLength: lockDaysNum,
      initialLockTime: initialLockTimeNum,
      autoBurn,
      logo,
      website,
      banner,
      telegram: tg,
      twitter: x
    }))
  }, [address, currentBlock])

  useEffect(() => {
    fetchIfoData()
  }, [slowRefresh])

  return { ...state, currencyPriceInUSD: new BigNumber(lpTokenPriceInUsd.toString()), fetchIfoData }
}

export default useGetPublicIfoData
