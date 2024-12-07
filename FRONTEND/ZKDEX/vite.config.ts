import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  const processEnvValues = {
    'process.env': Object.entries(env).reduce(
      (prev, [key, val]) => ({
        ...prev,
        [key]: val
      }),
      {}
    )
  }

  return {    
    plugins: [
      react(), 
      viteTsconfigPaths(),
      svgr({
        include: '**/*.svg?react',
      }),
    ]
  }
})
