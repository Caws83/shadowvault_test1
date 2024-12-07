import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Text, useMatchBreakpoints, Image, Skeleton } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { NFTPool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { readContract } from '@wagmi/core'
import { IPFS_GATEWAY } from 'config/constants/nfts'
import BaseCell, { CellContent } from './BaseCell'
import { nftCollectionAbi } from 'config/abi/nftCollection'
import { getAddress } from 'utils/addressHelpers'
import { usePublicClient } from 'wagmi'
import { config } from 'wagmiConfig'

interface NameCellProps {
  pool: NFTPool
}

const StyledCell = styled(BaseCell)`
  flex-direction: row;
`

const NameCell: React.FC<NameCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { stakingToken, earningToken, userData, isFinished, currentRound } = pool
  const [imageURI, setImageURI] = useState('')
  const round = new BigNumber(currentRound).toNumber()
  const client = usePublicClient({chainId: pool.chainId})
  const currentRToken = earningToken[round]

  const stakingTokenSymbol = stakingToken.name
  const earningTokenSymbol = currentRToken.symbol

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const isStaked = stakedBalance.gt(0)

  const showStakedTag = isStaked

  const title = `${t('Earn')} ${earningTokenSymbol}`
  const subtitle = `${t('Stake')} ${stakingTokenSymbol}`
  const showSubtitle = true

  useEffect(() => {
    async function get() {
      const baseUrl = await readContract(config, {
        abi: nftCollectionAbi,
        address: getAddress(stakingToken.address, pool.chainId),
        functionName: 'tokenURI',
        args: [1n],
        chainId: pool.chainId
      })
      const ipfsChecker = baseUrl.substring(0, 4).toLowerCase()
      let jsonUrl
      if (ipfsChecker === 'http') {
        jsonUrl = baseUrl
      } else {
        const properSubUrl = baseUrl.substring(7)
        jsonUrl = `${IPFS_GATEWAY}/${properSubUrl}`
      }
      fetch(jsonUrl).then((nftResponse) => {
        if (nftResponse.status === 200) {
          nftResponse.json().then((nftJson) => {
            const ipfsChecker2 = nftJson.image.substring(0, 4).toLowerCase()
            let imageUrl
            if (ipfsChecker2 === 'http') {
              imageUrl = nftJson.image
            } else {
              const imageBase = nftJson.image.substring(7)
              imageUrl = `${IPFS_GATEWAY}/${imageBase}`
            }
            setImageURI(imageUrl)
          })
        }
      })  
      
    }
  get()
  }, [pool.nftCollectionId])

  return (
    <StyledCell role="cell">
      {imageURI === '' ? (
        <Skeleton height={70} width={70} animation="waves" variant="rect" />
      ) : (
        <Image src={imageURI} height={70} width={70} mr="5px" />
      )}
      <CellContent>
        {showStakedTag && (
          <Text fontSize="12px" bold color={isFinished ? 'failure' : 'secondary'} textTransform="uppercase">
            {t('Staked')}
          </Text>
        )}
        <Text fontSize="12px" color="secondary">
          {client.chain.name}
        </Text>
        <Text fontSize="16px" bold={!isMobile} small={isMobile}>
          {title}
        </Text>
        {showSubtitle && (
          <Text fontSize="14px" color="textSubtle">
            {subtitle}
          </Text>
        )}
      </CellContent>
    </StyledCell>
  )
}

export default NameCell
