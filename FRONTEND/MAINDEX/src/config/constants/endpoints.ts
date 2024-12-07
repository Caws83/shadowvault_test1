export const GRAPH_API_PROFILE = import.meta.env.VITE_GRAPH_API_PROFILE
export const GRAPH_API_PREDICTION = import.meta.env.VITE_GRAPH_API_PREDICTION
export const GRAPH_API_LOTTERY = import.meta.env.VITE_GRAPH_API_LOTTERY
export const SNAPSHOT_VOTING_API = import.meta.env.VITE_SNAPSHOT_VOTING_API
export const SNAPSHOT_BASE_URL = import.meta.env.VITE_SNAPSHOT_BASE_URL
export const SNAPSHOT_API = `${SNAPSHOT_BASE_URL}/graphql`
export const SNAPSHOT_HUB_API = `${SNAPSHOT_BASE_URL}/api/message`
export const BITQUERY_API = 'https://graphql.bitquery.io'

/**
 * V1 will be deprecated but is still used to claim old rounds
 */
export const GRAPH_API_PREDICTION_V1 = 'https://api.thegraph.com/subgraphs/name/pancakeswap/prediction'
