import React from 'react'
import { Heading, Text, Flex } from 'uikit'

import { useTranslation } from 'contexts/Localization'

const StyledCardHeader: React.FC<{
  GameName: string
  CasinoName: string
  folder: string
}> = ({ GameName, CasinoName, folder }) => {
  const { t } = useTranslation()
  // const background = 'cardHeader'

  const getHeadingPrefix = () => {
    // all other pools
    return t(`${GameName}`)
  }

  const getSubHeading = () => {
    return t(`${CasinoName}`)
  }

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Flex flexDirection="column">
        <Heading color="body" scale="lg">
          {`${getHeadingPrefix()} `}
        </Heading>
        <Text color="textSubtle">{getSubHeading()}</Text>
      </Flex>
      <img src={`/images/games/${folder}/deckcut/cardflip.gif`} alt="flipping coin" height="50px" width="50px" />
    </Flex>
  )
}

export default StyledCardHeader
