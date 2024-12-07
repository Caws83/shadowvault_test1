import { FlexProps } from 'uikit'
import React from 'react'

const CardWrapper: React.FunctionComponent<FlexProps> = ({ children }) => {
  return <div style={{ position: 'relative', height: '100%' }}>{children}</div>
}

export const CardWrapper3: React.FunctionComponent<FlexProps> = ({ children }) => {
  return <div style={{ position: 'relative', height: '100%', width: '50%' }}>{children}</div>
}

export default CardWrapper
