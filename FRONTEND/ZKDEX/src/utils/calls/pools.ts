/* eslint-disable import/prefer-default-export */
import poolsConfig from 'config/constants/pools'
import { sousChefV2Abi } from 'config/abi/sousChefV2'
import { getAddress } from '../addressHelpers'
import { readContracts } from '@wagmi/core'
import { config } from 'wagmiConfig'


/**
 * Returns the total number of pools that were active at a given block
 */
export const getActivePools = async (block?: number) => {
  const pools = await poolsConfig()
  const eligiblePools = pools
    .filter((pool) => pool.sousId !== 0)
    .filter((pool) => pool.isFinished === false || pool.isFinished === undefined)
  const blockNumber = block || (await Date.now() / 1000)
  const startBlockCalls = eligiblePools.map(({ contractAddress, chainId }) => ({
    abi: sousChefV2Abi,
    address: getAddress(contractAddress, chainId),
    functionName: 'startBlock',
    chainId
  }))
  const endBlockCalls = eligiblePools.map(({ contractAddress, chainId }) => ({
    abi: sousChefV2Abi,
    address: getAddress(contractAddress, chainId),
    functionName: 'bonusEndBlock',
    chainId
  }))
  const startBlocks = await readContracts(config, { contracts: startBlockCalls })
  const endBlocks = await readContracts(config, { contracts: endBlockCalls })

  return eligiblePools.reduce((accum, poolCheck, index) => {
    const startBlock = startBlocks[index] ? (startBlocks[index].result as bigint) : null
    const endBlock = endBlocks[index] ? (endBlocks[index].result as bigint) : null

    if (!startBlock || !endBlock) {
      return accum
    }

    if (startBlock > blockNumber || endBlock < blockNumber) {
      return accum
    }

    return [...accum, poolCheck]
  }, [])
}
