import React from 'react'
import {
  TokenPairImage as UIKitTokenPairImage,
  TokenPairImageProps as UIKitTokenPairImageProps,
  TokenImage as UIKitTokenImage,
  ImageProps,
} from 'uikit'
import tokens from 'config/constants/tokens'
import hosts from 'config/constants/hosts'
import { Token, Host } from 'config/constants/types'
import { getAddress } from 'utils/addressHelpers'
import { getPublicClient } from '@wagmi/core'
import { config } from 'wagmiConfig'
import { Address } from 'viem'

interface TokenPairImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryToken: Token
  secondaryToken: Token
  host: Host
  chainId?: number
}

interface NftLaunchImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryImage: string
  secondaryToken: Token
  host: Host
  chainId?: number
}

const getImageUrlFromToken = (token: Token, host: Host | undefined, chainId?: number) => {
  // Use the provided chainId if available, otherwise fallback to host.chainId
  const chainIdToUse = chainId ?? host?.chainId;

  if (!chainIdToUse) {
    console.error("No chainId provided or found.");
    return '';
  }
  if(!token){
    console.error("no Token provided")
  }

  const client = getPublicClient(config, { chainId: chainIdToUse });
  // Ensure address is defined before use
  const address = token
    ? getAddress(
        !token.address
          ? tokens.wNative.address
          : token.baseAddress ?? token.address,
        chainIdToUse
      )
    : undefined;
    

  if (!address) {
    console.error("Error with:", token, chainIdToUse, client?.chain.nativeCurrency.symbol);
    return '';
  }

  const stringAddress = address as string;

  // Check if host is defined and has a site property
  if (host?.site) {
    return `${host.site}/images/tokens/${stringAddress}.png`;
  }

  // Fallback to default path if host.site is undefined
  return `/images/tokens/${stringAddress.toUpperCase()}.png`;
}



const getImageUrlFromAddress = (address: string) => {
  return `/images/tokens/${address.toUpperCase()}.png`
}



export const TokenPairImage: React.FC<TokenPairImageProps> = ({ primaryToken, secondaryToken, host, chainId, ...props }) => {
  return (
    <UIKitTokenPairImage
      primarySrc={getImageUrlFromToken(primaryToken, host, chainId)}
      secondarySrc={getImageUrlFromToken(secondaryToken, host, chainId)}
      {...props}
    />
  )
}

export const NftLaunchPairImage: React.FC<NftLaunchImageProps> = ({ primaryImage, secondaryToken, host, chainId, ...props }) => {
  return (
    <UIKitTokenPairImage
      primarySrc={primaryImage}
      secondarySrc={getImageUrlFromToken(secondaryToken, host, chainId)}
      {...props}
    />
  )
}

interface NftImageProps extends Omit<UIKitTokenPairImageProps, 'primarySrc' | 'secondarySrc'> {
  primaryImage: string
}
export const NftImage: React.FC<NftImageProps> = ({ primaryImage, ...props }) => {
  return <UIKitTokenImage src={primaryImage} {...props} />
}

interface TokenImageProps extends ImageProps {
  token: Token
  host: Host
  chainId?: number
}
interface IFOImageProps extends ImageProps {
  source: string
}
export const TokenImageIFO: React.FC<IFOImageProps> = ({source, ...props }) => {
  return <UIKitTokenImage src={source} {...props} />
}
export const TokenImageString: React.FC<IFOImageProps> = ({source, ...props }) => {
  return <UIKitTokenImage src={getImageUrlFromAddress(source)} {...props} />
}

export const TokenImage: React.FC<TokenImageProps> = ({ token, host, chainId, ...props }) => {
  return <UIKitTokenImage src={getImageUrlFromToken(token, host, chainId)} {...props} />
}
