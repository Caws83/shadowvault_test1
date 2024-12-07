import React from 'react'
import { Button, ButtonProps, MetamaskIcon, TrustWalletIcon } from 'uikit'
import { registerToken } from 'utils/wallet'

export interface AddToWalletButtonProps {
  tokenAddress: string
  tokenSymbol: string
  tokenDecimals: number
  marginTextBetweenLogo?: string
  noText?: boolean
}

const getWalletText = (tokenSymbol: string) => {
  return `Add ${tokenSymbol} to Wallet`
}

const getWalletIcon = (marginTextBetweenLogo: string) => {
  const iconProps = {
    width: '20px',
    ...(marginTextBetweenLogo && { ml: marginTextBetweenLogo }),
  }
  if (window?.ethereum?.isMetaMask) {
    return <MetamaskIcon {...iconProps} />
  }
  return <TrustWalletIcon {...iconProps} />
}

const AddToWalletButton: React.FC<AddToWalletButtonProps & ButtonProps> = ({
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  marginTextBetweenLogo = '5px',
  variant = 'tertiary',
  noText = false,
  ...props
}) => {
  return (
    <Button mt="3px" mb="3px"
      {...props}
      variant={variant}
      onClick={() => {
        registerToken(tokenAddress, tokenSymbol, tokenDecimals)
      }}
    >
      {!noText && getWalletText(tokenSymbol)}
      {getWalletIcon(marginTextBetweenLogo)}
    </Button>
  )
}

export default AddToWalletButton
