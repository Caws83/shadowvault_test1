import React from 'react'
import Svg from '../Svg'
import { SvgProps } from '../types'

const Icon: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <path 
        d="M19.2 4H5.19995C4.09995 4 3.19995 4.9 3.19995 6V18C3.19995 19.1 4.09995 20 5.19995 20H19.2C20.3 20 21.2 19.1 21.2 18V6C21.2 4.9 20.3 4 19.2 4ZM19.2 18H5.19995V6H19.2V18Z" 
        fill="#41d1ff"
      />
      <path 
        d="M14.2 11H19.2V13H14.2V11Z" 
        fill="#41d1ff"
      />
    </Svg>
  )
}

export default Icon
