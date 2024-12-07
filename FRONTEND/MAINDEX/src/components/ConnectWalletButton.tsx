import { useAccount } from 'wagmi'
import { SwitchToNetwork } from './SwitchToNetWork'
import { defaultChainId } from 'config/constants/chains'

function ConnectWalletButton({ chain }: { chain: number }){
  const { address: account } = useAccount()
  const chainId = chain ?? defaultChainId
  
  if(!account)  return <w3m-button balance='hide' />
  return <SwitchToNetwork chainId={chainId}/>
  
}

export default ConnectWalletButton
