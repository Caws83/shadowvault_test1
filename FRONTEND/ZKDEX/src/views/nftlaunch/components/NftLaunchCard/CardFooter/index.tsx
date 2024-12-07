import React, { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import { Flex, CardFooter, ExpandableLabel } from 'uikit'
import { NFTLaunch } from 'state/types'
import { PublicTag } from 'components/Tags'
import { useIsPublic } from 'hooks/useNftContract'
import ExpandedFooter from './ExpandedFooter'

const ExpandableButtonWrapper = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  button {
    padding: 0;
  }
`
interface CardActionsProps {
  launch: NFTLaunch
  account: string
}

const Footer: React.FC<CardActionsProps> = ({ launch, account }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  const isPublic = useIsPublic(launch.nftCollectionId, launch.chainId)

  return (
    <CardFooter>
      
      <ExpandableButtonWrapper>
        <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? t('Hide') : t('Details')}
        </ExpandableLabel>
        {isPublic && <PublicTag />}
      </ExpandableButtonWrapper>
      {isExpanded && <ExpandedFooter launch={launch} account={account} />}
    </CardFooter>
  )
}

export default Footer
