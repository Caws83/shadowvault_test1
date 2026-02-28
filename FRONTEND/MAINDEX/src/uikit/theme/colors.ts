import { Colors } from './types'

export const baseColors = {
  primary: '#DC143C', // Crimson red - Sith Lord aesthetic
  success: '#00FF41', // Bright green for success
  warning: '#FF6B00', // Orange-red warning
  failure: '#DC143C', // Crimson red for failures
}

export const additionalColors = {
  binance: '#F0B90B',
  overlay: '#000',
  gold: '#FFC700',
  silver: '#B2B2B2',
  bronze: '#E7974D',
}
// 41d1ff
export const lightColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#DC143C', // Crimson red accent
  background:  '#000000', // Pure black background
  backgroundAlt: '#0A0A0A', // Slightly lighter black
  backgroundAlt2: '#1A0000', // Dark red-tinted black
  cardBorder: '#DC143C', // Red borders with glow effect
  contrast: '#FFFFFF',
  dropdown:  '#0A0A0A', // Dark dropdown
  invertedContrast: '#1A1A1A',
  input: '#1A0000', // Dark red-tinted input
  tertiary: '#4A0000', // Dark red tertiary
  text: '#FFFFFF', // White text
  textDisabled: '#4A0000',
  textSubtle: '#DC143C', // Red subtle text
  disabled: '#2A0000',
  gradients: {
    cardHeader: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)', // Red gradient
    gold: 'linear-gradient(180deg, #DC143C 7%, #8B0000 100%)',
  },
}

export const darkColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#DC143C', // Crimson red accent
  background:  '#000000', // Pure black background
  backgroundAlt: '#0A0A0A', // Slightly lighter black
  backgroundAlt2: '#1A0000', // Dark red-tinted black
  cardBorder: '#DC143C', // Red borders with glow effect
  contrast: '#FFFFFF',
  dropdown:  '#0A0A0A', // Dark dropdown
  invertedContrast: '#1A1A1A',
  input: '#1A0000', // Dark red-tinted input
  tertiary: '#4A0000', // Dark red tertiary
  text: '#FFFFFF', // White text
  textDisabled: '#4A0000',
  textSubtle: '#DC143C', // Red subtle text
  disabled: '#2A0000',
  gradients: {
    cardHeader: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)', // Red gradient
    gold: 'linear-gradient(180deg, #DC143C 7%, #8B0000 100%)',
  },
}


