/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOKEN: string
  readonly VITE_CLIENT_ID: number
  readonly VITE_CHAIN_ID: string
  readonly VITE_GTAG: string

  readonly VITE_NODE_1: string
  readonly VITE_NODE_2: string
  readonly VITE_NODE_3: string
  readonly VITE_NODE_PRODUCTION: string

  readonly VITE_GRAPH_API_PROFILE: string
  readonly VITE_GRAPH_API_PREDICTION: string
  readonly VITE_GRAPH_API_LOTTERY: string

  readonly VITE_SNAPSHOT_BASE_URL: string
  readonly VITE_SNAPSHOT_VOTING_API: string

  readonly VITE_API_PROFILE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
