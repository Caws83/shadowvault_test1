import React from 'react'
import { Modal, Text, Button } from 'uikit'
import useTheme from 'hooks/useTheme'


interface Props {
  onDismiss?: () => void
}


const terms: React.FC<Props> = ({ onDismiss }) => {
  const { theme } = useTheme()

  return (
    <Modal
      title="Disclaimer"
      onDismiss={onDismiss}
      headerBackground={theme.colors.secondary}
    >
      <Text color="secondary" bold>
      Disclaimer:
      </Text>
     
      
      <Text>
        Investing in cryptocurrencies carries inherent risks, including the potential loss of your entire investment due to their volatile nature and potential liquidity issues. Historical performance, simulations, and predictions should not be solely relied upon to gauge future outcomes. Before engaging in cryptocurrency trading or ownership, carefully assess whether it aligns with your financial circumstances and risk tolerance.
      </Text>     
      <Text>
      Copyright c 2024 Marswap
      </Text>
     
      <Button variant="text" onClick={onDismiss}>
        Close Window
      </Button>
    </Modal>
  )
}

export default terms
