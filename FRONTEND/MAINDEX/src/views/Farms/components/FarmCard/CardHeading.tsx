import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from 'uikit'
import { Token, Host } from 'config/constants/types'
import { TokenPairImage } from 'components/TokenImage'
import { usePublicClient } from 'wagmi'
import { masterChefAbi } from 'config/abi/masterchef'
import { readContract } from '@wagmi/core'
import { getAddress } from 'utils/addressHelpers'
import { config } from 'wagmiConfig'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: Token
  quoteToken: Token
  host: Host
}

const Wrapper = styled(Flex)`
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
  justify-content: space-around;
`

const CardHeading: React.FC<ExpandableSectionProps> = ({ lpLabel, token, quoteToken, host }) => {
  const client = usePublicClient({ chainId: host.chainId })
  const [startTime, setStartTime] = useState<number>(0)
  const [showTimer, setShowTimer] = useState<boolean>(false)

  // Fetch startBlock only once
  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        const startBlock = await readContract(config, {
          abi: masterChefAbi,
          address: getAddress(host.masterChef, host.chainId),
          functionName: 'startBlock',
          chainId: host.chainId,
        }) as bigint
        const startTimeInSeconds = Number(startBlock)
        setStartTime(startTimeInSeconds)
        setShowTimer(startTimeInSeconds > Math.floor(Date.now() / 1000))
      } catch (error) {
        console.error('Failed to fetch start time:', error)
        setStartTime(0)
      }
    }

    fetchStartTime()
  }, [host])

  function formatTimeLeft(endEpoch: number) {
    const currentUnixTimeInSeconds = Math.floor(Date.now() / 1000);
    const differenceInSeconds = endEpoch - currentUnixTimeInSeconds;
  
    if (differenceInSeconds < 0) {
      setShowTimer(false);
      return `0 sec`;
    }
  
    // Calculate days, hours, minutes, and seconds
    const daysLeft = Math.floor(differenceInSeconds / (24 * 3600));
    const hoursLeft = Math.floor((differenceInSeconds % (24 * 3600)) / 3600);
    const minutesLeft = Math.floor((differenceInSeconds % 3600) / 60);
    const secondsLeft = differenceInSeconds % 60;
  
    // Build the formatted time string
    let timeString = '';
  
    if (daysLeft > 0) {
      timeString += `${daysLeft} day${daysLeft > 1 ? 's' : ''} `;
    }
  
    if (hoursLeft > 0 || daysLeft > 0) {
      timeString += `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} `;
    }
  
    if (minutesLeft > 0 || hoursLeft > 0 || daysLeft > 0) {
      timeString += `${minutesLeft} min${minutesLeft > 1 ? 's' : ''} `;
    }
  
    timeString += `${secondsLeft} sec`;
  
    return timeString;
  }
  

  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px" className="farm-card-header">
      <TokenPairImage
        variant="inverted"
        primaryToken={token}
        secondaryToken={quoteToken}
        host={host}
        chainId={host.chainId}
        width={64}
        height={64}
      />
      <Flex flexDirection="column" alignItems="flex-end">
        <Text fontSize="18px" color="secondary">
          {client.chain.name.toUpperCase()}
        </Text>
        <Heading className="farm-gradient-heading">{lpLabel?.split(' ')[0]}</Heading>
        <Text fontSize="10px">{host.dex.id}</Text>
        {showTimer && (
          <Text fontSize="12px" color="primary">
            Starts in: {formatTimeLeft(startTime)}
          </Text>
        )}
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
