import { createGlobalStyle } from 'styled-components'
// eslint-disable-next-line import/no-unresolved
import { PancakeTheme } from 'uikit/theme'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'DM Sans';
  }
  body {
    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export const SASStyle = createGlobalStyle`
  * {
    font-family: 'DM Sans';
  }
    img {
      height: auto;
      max-width: 100%;
    }
  }
`

export default GlobalStyle