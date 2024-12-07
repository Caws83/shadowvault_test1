import { Colors } from './types'

export const baseColors = {
  primary: '#ffffff',//'#FFA61D',
  success: '#0577DA',
  warning: '#FF8000',
  failure: '#E00808',
}

export const additionalColors = {
  binance: '#F0B90B',
  overlay: '#000',
  gold: '#FFC700',
  silver: '#B2B2B2',
  bronze: '#E7974D',
}
// 0577DA
export const lightColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#0577DA',
  background:  '#000000',
  backgroundAlt: '#151315',
  backgroundAlt2: '#000000',
  cardBorder: '#4D4C4E',
  contrast: '#FFFFFF',
  dropdown:  '#000000', //'linear-gradient(to bottom right, #1e1d20 0%, #000000 100%)',
  invertedContrast: '#303030',
  input: '#303030',
  tertiary: '#595959',
  text: '#D5D5D5',
  textDisabled: '#5F5F5F',
  textSubtle: '#B0B0B0',
  disabled: '#808080',
  gradients: {
    cardHeader: '#0577DA',
    gold: 'linear-gradient(180deg, #FFD800 7%, #FDAB32 100%)',
  },
}

export const darkColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#0577DA',
  background:  '#000000',
  backgroundAlt: '#151315',
  backgroundAlt2: '#000000',
  cardBorder: '#4D4C4E',
  contrast: '#FFFFFF',
  dropdown:  '#000000', //'linear-gradient(to bottom right, #1e1d20 0%, #000000 100%)',
  invertedContrast: '#303030',
  input: '#303030',
  tertiary: '#595959',
  text: '#cccccc',
  textDisabled: '#8a8a8a',
  textSubtle: '#949494',
  disabled: '#808080',
  gradients: {
    cardHeader: '#0577DA',
    gold: 'linear-gradient(180deg, #FFD800 7%, #FDAB32 100%)',
  },
}


