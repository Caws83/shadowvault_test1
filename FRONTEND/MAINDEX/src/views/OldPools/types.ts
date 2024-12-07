import { Address } from "viem"

export interface oldPoolInfo {
    address: Address
    stakingSymbol: string
    earningSymbol: string
    earning2Symbol?: string
    chainId: number
    isDual?: boolean
  }