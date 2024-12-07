import { BoxProps, Heading, Flex } from 'uikit'
import React from 'react'
import styled from 'styled-components'
import { Cards, Suits } from './cardIndex'
import CardWrapper, { CardWrapper3 } from './CardWrapper'

interface DeckCardProps extends BoxProps {
  suit: number
  card: number
  width
  height
  folder: string
}

export const StyledCardImage = styled.img`
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

export const StyledCardImage2 = styled.img`
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 50;
  left: 0;
`

export const StyledCardImage3 = styled.img`
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  bottom: 200;
  left: 0;
`

const DeckCard: React.FunctionComponent<DeckCardProps> = ({ suit, card, width, height, folder }) => {
  return (
    <CardWrapper>
      <StyledCardImage src={`/images/games/${folder}/${Suits[suit].img}`} width={width} height={height} />
      <StyledCardImage src={`/images/games/${folder}/${Cards[card].img}`} width={width} height={height} />
    </CardWrapper>
  )
}

export const CardHand: React.FunctionComponent<DeckCardProps> = ({ suit, card, width, height, folder }) => {
  return (
    <>
      <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
        <Heading as="h1" scale="xl" color="secondary" mb="50px" textAlign="center">
          <CardWrapper>
            <StyledCardImage2 src={`/images/games/${folder}/${Suits[suit].img}`} width={width} height={height} />
            <StyledCardImage2 src={`/images/games/${folder}/${Cards[card].img}`} width={width} height={height} />
          </CardWrapper>
        </Heading>
      </Flex>
    </>
  )
}

export const CardInline: React.FunctionComponent<DeckCardProps> = ({ suit, card, width, height, folder }) => {
  return (
    <CardWrapper3>
      <StyledCardImage3 src={`/images/games/${folder}/${Suits[suit].img}`} width={width} height={height} />
      <StyledCardImage3 src={`/images/games/${folder}/${Cards[card].img}`} width={width} height={height} />
    </CardWrapper3>
  )
}

export default DeckCard
