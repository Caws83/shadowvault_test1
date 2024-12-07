import { useAccount, useSwitchChain } from 'wagmi'
import { Button, Flex } from '../uikit'

export function SwitchToNetwork({ chainId }: { chainId?: number }) {
  const { chain } = useAccount()
  const { chains, switchChain } = useSwitchChain()

  return (
    <Flex justifyContent="center">
      {switchChain && (
        <div>
          {chains.map((x) =>
            x.id === chain?.id || x.id !== chainId ? null : (
              <Button key={x.id} onClick={() => switchChain({chainId: x.id}) }>
              Switch to {x.name}
            </Button>
            ),
          )}
        </div>
      )}
    </Flex>
  )
}
