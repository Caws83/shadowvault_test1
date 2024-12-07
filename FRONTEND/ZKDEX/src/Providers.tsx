import React from 'react'
import { ModalProvider, light, dark } from 'uikit'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { useThemeManager } from 'state/user/hooks'
import { LanguageProvider } from 'contexts/Localization'
import { RefreshContextProvider } from 'contexts/RefreshContext'
import { ToastsProvider } from 'contexts/ToastsContext'
import { ThirdwebProvider } from "thirdweb/react";
import store from 'state'

const ThemeProviderWrapper = (props) => {
  const [isDark] = useThemeManager()
  return <ThemeProvider theme={isDark ? dark : light} {...props} />
}


const Providers: React.FC<{children: any}> = ({ children }) => {
  return (
    <Provider store={store}>
      <ToastsProvider>
        <HelmetProvider>
          <ThemeProviderWrapper>
            <LanguageProvider>
            <ThirdwebProvider >
              <RefreshContextProvider>
                <ModalProvider>{children}</ModalProvider>
              </RefreshContextProvider>
            </ThirdwebProvider>  
            </LanguageProvider>
          </ThemeProviderWrapper>
        </HelmetProvider>
      </ToastsProvider>
    </Provider>
  )
}

export default Providers
