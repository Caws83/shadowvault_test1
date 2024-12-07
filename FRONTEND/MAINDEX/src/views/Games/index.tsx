import { Text, Box } from 'uikit'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
import EasySelect from 'components/Select/EasySelect'
import { useTranslation } from 'contexts/Localization'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  useFetchGamePublicData,
  useFetchMultiplierPublicData,
  useFetchGameUserData,
  // useFetchHighCardUserDataAsync,
  // useFetchBlackJackUserDataAsync,
  // useFetchMultiplier2PublicData,
  useFetchScratcherPublicData,
  // useFetchHighRollerUserDataAsync,
  // useFetchLowRollerUserDataAsync,
  useDefaultsFromURLSearch,
  useGames,
} from 'state/games/hooks'
import tokens from 'config/constants/tokens'
import { Token } from 'config/constants/types'
import GameCardMain from './components'
import { useAccount } from 'wagmi'

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

const Games: React.FC = () => {
  const loadedUrlParams = useDefaultsFromURLSearch()

  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { games } = useGames()
  const [tokenOptions, setTokenOptions] = useState([])
  const [currentToken, setCurrentToken] = useState<Token>(undefined)
  const [currentId, setCurrentId] = useState<number>(undefined)

  useEffect(() => {
    if (loadedUrlParams !== undefined) {
      setCurrentToken(loadedUrlParams)
    } else {
      setCurrentToken(tokens.mswap)
    }
  }, [loadedUrlParams])

  useFetchGamePublicData()
  useFetchMultiplierPublicData()
  // useFetchHighCardUserDataAsync(account)
  // useFetchBlackJackUserDataAsync(account)
  useFetchGameUserData(account)
  // useFetchMultiplier2PublicData()
  useFetchScratcherPublicData()
  // useFetchHighRollerUserDataAsync(account)
  // useFetchLowRollerUserDataAsync(account)

  useEffect(() => {
    const tempTokenOptions = []
    let index = 0
    games.forEach((game1) => {
      if (game1.gameContract === 1) {
        tempTokenOptions.push(game1.payToken)
        if (game1.payToken === currentToken) {
          setCurrentId(index)
        }
        index++
      }
    })
    setTokenOptions(tempTokenOptions)
  }, [setTokenOptions, games, currentToken])

  const onChangeOutToken = (token: Token) => {
    if (currentToken !== token) {
      setCurrentToken(token)
    }
  }

  const getKeyProp = (index, GameId) => {
    return index * GameId
  }

  return (
    <>
      <PageHeader firstHeading="Pocket Casino" secondHeading="Play, Gamble, Win!!" />

      <Page>
        <Box>
          <Text textTransform="uppercase">{t('Choose Token')}</Text>
          <EasySelect options={tokenOptions} selectedId={currentId} onChange={onChangeOutToken} />
        </Box>

        <CardLayout style={{ marginTop: '25px' }}>
          {games
            .filter((playToken) => playToken.payToken === currentToken)
            .map((game) =>
              game.GameType.map((gametype, index) => (
                <GameCardMain key={getKeyProp(index, game.GameId)} game={game} account={account} gametype={gametype} />
              )),
            )}
        </CardLayout>
      </Page>
    </>
  )
}

export default Games
