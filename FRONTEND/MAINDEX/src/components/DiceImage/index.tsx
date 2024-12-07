import { BoxProps } from 'uikit'
import React from 'react'
import styled from 'styled-components'
import { Numbers, Sizes } from './diceIndex'
import CardWrapper from './CardWrapper'

interface DiceImageProps extends BoxProps {
  size: number
  number: number
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

let diceSize = 0

const DiceImage: React.FunctionComponent<DiceImageProps> = ({ size, number, width, height, folder }) => {
  if (size !== 6) {
    if (size === 12) diceSize = 1
    else diceSize = 2
  }

  return (
    <CardWrapper>
      <StyledCardImage src={`/images/games/${folder}/${Sizes[diceSize].img}`} width={width} height={height} />
      <StyledCardImage src={`/images/games/${folder}/${Numbers[number].img}`} width={width} height={height} />
    </CardWrapper>
  )
}

export const DiceInline: React.FunctionComponent<DiceImageProps> = ({ size, number, width, height, folder }) => {
  if (size !== 6) {
    if (size === 12) diceSize = 1
    else diceSize = 2
  }

  return (
    <CardWrapper>
      <StyledCardImage3 src={`/images/games/${folder}/${Sizes[diceSize].img}`} width={width} height={height} />
      <StyledCardImage3 src={`/images/games/${folder}/${Numbers[number].img}`} width={width} height={height} />
    </CardWrapper>
  )
}

export const DiceImage2: React.FunctionComponent<DiceImageProps> = ({ size, number, width, height, folder }) => {
  if (size !== 6) {
    if (size === 12) diceSize = 1
    else diceSize = 2
  }

  return (
    <CardWrapper>
      <StyledCardImage2 src={`/images/games/${folder}/${Sizes[diceSize].img}`} width={width} height={height} />
      <StyledCardImage2 src={`/images/games/${folder}/${Numbers[number].img}`} width={width} height={height} />
    </CardWrapper>
  )
}

export default DiceImage
