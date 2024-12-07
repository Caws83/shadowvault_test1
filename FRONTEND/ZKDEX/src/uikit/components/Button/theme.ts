import { backgroundColor } from 'styled-system'
import { scales, variants } from './types'

export const scaleVariants = {
  [scales.MD]: {
    height: '32px',
    fontSize: '14px',
    padding: '0 24px',
  },
  [scales.SM]: {
    height: '28px',
    fontSize: '12px',
    padding: '0 10px',
  },
  [scales.XS]: {
    height: '20px',
    fontSize: '10px',
    padding: '0 8px',
  }
}

export const styleVariants = {
  [variants.PRIMARY]: {
    backgroundColor: 'secondary',
    color: 'backgroundAlt',
  },
  [variants.SECONDARY]: {
    backgroundColor: 'transparent',
    border: '2px solid',
    borderColor: 'primary',
    boxShadow: 'none',
    color: 'primary',
    ':disabled': {
      backgroundColor: 'transparent',
    },
  },
  [variants.TERTIARY]: {
    backgroundColor: 'tertiary',
    boxShadow: 'none',
    color: 'primary',
  },
  [variants.SUBTLE]: {
    backgroundColor: 'textSubtle',
    color: 'backgroundAlt',
  },
  [variants.DANGER]: {
    backgroundColor: 'failure',
    color: 'white',
  },
  [variants.SUCCESS]: {
    backgroundColor: 'success',
    color: 'white',
  },
  [variants.TEXT]: {
    backgroundColor: 'transparent',
    color: 'primary',
    boxShadow: 'none',
  },
  [variants.ORANGE]: {
    backgroundColor: '#da6805;',
    color: 'primary',
    boxShadow: 'none',
  },
  [variants.LIGHT]: {
    backgroundColor: 'input',
    color: 'textSubtle',
    boxShadow: 'none',
  },
}
