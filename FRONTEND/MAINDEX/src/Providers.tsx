// Providers.tsx

import React, { useMemo } from 'react'
import { ModalProvider, light, dark } from 'uikit'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { useThemeManager } from 'state/user/hooks'
import { LanguageProvider } from 'contexts/Localization'
import { RefreshContextProvider } from 'contexts/RefreshContext'
import { ToastsProvider } from 'contexts/ToastsContext'
import { ThirdwebProvider } from 'thirdweb/react'
import store from 'state'

// 1) Import the Solana wallet adapter libraries
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

// 2) Required for default styling of the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css'


const ThemeProviderWrapper = (props) => {
  const [isDark] = useThemeManager()
  return <ThemeProvider theme={isDark ? dark : light} {...props} />
}

const Providers: React.FC<{children: any}> = ({ children }) => {
  // 3) Set the Solana RPC endpoint (mainnet or devnet, etc.)
  const solanaEndpoint = 'https://api.mainnet-beta.solana.com'
  
  // 4) Phantom adapter in a useMemo
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    // 5) Wrap everything in Solana's ConnectionProvider + WalletProvider
    <ConnectionProvider endpoint={solanaEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {/* The WalletModalProvider gives you the <WalletMultiButton> etc. */}
        <WalletModalProvider>
          {/* Your existing providers stay inside */}
          <Provider store={store}>
            <ToastsProvider>
              <HelmetProvider>
                <ThemeProviderWrapper>
                  <LanguageProvider>
                    <ThirdwebProvider>
                      <RefreshContextProvider>
                        <ModalProvider>
                          {/* Finally, we render children (your entire app) */}
                          {children}
                        </ModalProvider>
                      </RefreshContextProvider>
                    </ThirdwebProvider>
                  </LanguageProvider>
                </ThemeProviderWrapper>
              </HelmetProvider>
            </ToastsProvider>
          </Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Providers
