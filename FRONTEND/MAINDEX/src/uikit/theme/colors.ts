import { Colors } from './types'

// ShadowVault Protocol — Trade in Shadows. Leverage Fearlesslyly
// Whitepaper: dark background, vibrant red accents, white text
export const baseColors = {
  primary: '#E63946',   // Vibrant red (SVP accent)
  success: '#00B42A',   // Green for success / Long
  warning: '#F59E0B',   // Amber warning
  failure: '#C53030',   // Muted red for risk/short
}

export const additionalColors = {
  binance: '#F0B90B',
  overlay: '#000',
  gold: '#FFC700',
  silver: '#B2B2B2',
  bronze: '#E7974D',
}

export const lightColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#E63946',
  background: '#0A0A0A',
  backgroundAlt: '#111111',
  backgroundAlt2: '#1A1A1A',
  cardBorder: 'rgba(230, 57, 70, 0.25)',
  contrast: '#FFFFFF',
  dropdown: '#111111',
  invertedContrast: '#1A1A1A',
  input: '#141414',
  tertiary: '#262626',
  text: '#FFFFFF',
  textDisabled: 'rgba(255,255,255,0.35)',
  textSubtle: 'rgba(255,255,255,0.65)',
  disabled: '#262626',
  gradients: {
    cardHeader: 'linear-gradient(135deg, rgba(230, 57, 70, 0.2) 0%, rgba(139, 0, 0, 0.15) 100%)',
    gold: 'linear-gradient(180deg, #E63946 7%, #8B0000 100%)',
  },
}

export const darkColors: Colors = {
  ...baseColors,
  ...additionalColors,
  secondary: '#E63946',
  background: '#0A0A0A',
  backgroundAlt: '#111111',
  backgroundAlt2: '#1A1A1A',
  cardBorder: 'rgba(230, 57, 70, 0.25)',
  contrast: '#FFFFFF',
  dropdown: '#111111',
  invertedContrast: '#1A1A1A',
  input: '#141414',
  tertiary: '#262626',
  text: '#FFFFFF',
  textDisabled: 'rgba(255,255,255,0.35)',
  textSubtle: 'rgba(255,255,255,0.65)',
  disabled: '#262626',
  gradients: {
    cardHeader: 'linear-gradient(135deg, rgba(230, 57, 70, 0.2) 0%, rgba(139, 0, 0, 0.15) 100%)',
    gold: 'linear-gradient(180deg, #E63946 7%, #8B0000 100%)',
  },
}


