import React from 'react'
import { CardBody, Flex } from 'uikit'
import { NFTLaunch } from 'state/types'
import { StyledCard } from './StyledCard'
import CardFooter from './CardFooter'
import StyledCardHeader from './StyledCardHeader'
import CardActions from './CardActions'

const NftLaunchCard: React.FC<{ launch: NFTLaunch; account: string; isLoading: boolean }> = ({
  launch,
  account,
  isLoading,
}) => {
  const { payToken, nftCollectionName } = launch

  return (
    <StyledCard isFinished={false}>
      <StyledCardHeader payToken={payToken} launch={launch} nftCollectionName={nftCollectionName} />
      <CardBody>
        <Flex mt="24px" flexDirection="column">
        
            <CardActions launch={launch} isLoading={isLoading} account={account} />
         
        </Flex>
      </CardBody>
      <CardFooter launch={launch} account={account} />
    </StyledCard>
  )
}

export default NftLaunchCard
