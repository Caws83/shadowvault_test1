import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Providers from './Providers';
import { config } from './wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi';

const container = document.getElementById('root') as HTMLElement | null;
const queryClient = new QueryClient()

if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <App />
        </Providers>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
} else {
  console.error('Container element not found');
}
