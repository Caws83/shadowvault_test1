import React from 'react'
import styled from 'styled-components'
import { lightColors, darkColors, Text } from 'uikit'
import { StyledCardInner } from 'uikit/components/Card/StyledCard'

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.disabled};
  height: 1px;
  margin: 16px auto;
  width: 100%;
`

// Combine all color objects into an array
const allColors = [darkColors, lightColors]

const ColorDisplay: React.FC = () => {
  return (
    <div>
      {allColors.map((colors, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index}>
          <Text>{` Color Set ${index + 1}`}</Text>
          <div className="color-set">
            {Object.keys(colors).map((colorKey) => (
              <div key={colorKey}>
                {typeof colors[colorKey] === 'string' ? (
                  // Render a simple color value if it's a string
                  <StyledCardInner background={`${colors[colorKey]}`} hasCustomBorder>
                    <Text color={colors[colorKey]}>{`${colorKey} : ${colors[colorKey]}`}</Text>
                    <Text>{`${colorKey} : ${colors[colorKey]}`}</Text>
                    <Divider />
                  </StyledCardInner>
                ) : (
                  // Handle gradients differently (for example, display as text)
                  <Text color={colors[colorKey]}>{`${colorKey} : ${colors[colorKey]}`}</Text>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ColorDisplay
