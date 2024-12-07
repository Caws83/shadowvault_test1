import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import { Flex } from 'uikit'
import { isMobile } from 'components/isMobile'


interface InputPanelProps {
  onProcessInput: (addresses: string[], amounts: number[]) => void
}

const InputPanel: React.FC<InputPanelProps> = ({ onProcessInput }) => {
  const [inputText, setInputText] = useState('')
  const { theme } = useTheme()

  const handleInputChange = (text: string) => {
    setInputText(text)

    const lines = text.split('\n')
    const newAddresses: string[] = []
    const newAmounts: number[] = []

    lines.forEach((line) => {
      const [address, amount] = line.split(',')
      if (address && amount) {
        newAddresses.push(address.trim())
        newAmounts.push(parseFloat(amount.trim()))
      }
    })

    // Automatically process the input whenever it changes
    onProcessInput(newAddresses, newAmounts)
  }

  return (
    <Flex>
      <textarea
        rows={20}
        cols={isMobile ? 45 : 50}
        placeholder={`0x94469F872659eeC9f1DF185c2cB3EC5B2D52937c, 100 \n0x94469F872659eeC9f1DF185c2cB3EC5B2D52937c, 200`}
        value={inputText}
        onChange={(e) => handleInputChange(e.target.value)}
        style={{
          borderRadius: '20px',
          padding: isMobile ? "10px" : "20px",
          backgroundColor: theme.colors.backgroundAlt2,
          color: theme.colors.primary,
          fontSize: isMobile ? "8px" : "12px",
          maxWidth: isMobile ? "280px" : "350px",
          minWidth: isMobile ? "280px" : "350px"

        }}
      />
    </Flex>
  )
}

export default InputPanel
