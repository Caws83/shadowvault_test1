import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Text } from 'uikit'
import { BigNumber } from 'bignumber.js'
import { AutoColumn } from 'components/Layout/Column'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { useAccount, useReadContract } from 'wagmi'
import { useGasTokenManager } from 'state/user/hooks'
import { getAddress } from 'utils/addressHelpers'
import { erc20Abi } from 'viem'
import { Dex } from 'config/constants/types'
import PMTokenSelector from './payMasterSelectButton'

const SwapModalFooterContainer = styled(AutoColumn)`
  margin-top: 24px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`
interface PreviewProps {
  paymasterInfo: any,
  dex: Dex
  error: string
  onDisableStatusChange?: (disabled: boolean) => void
  isApproved?: boolean
}
const PayMasterPreview: React.FC<PreviewProps> = ({ paymasterInfo, dex, error, isApproved = true, onDisableStatusChange }) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const [ disabledDoToPM, setDTTPM ] = useState(true)
  const { address } = useAccount()
  const [payWithPM, setUsePaymaster, payToken, setPaytoken] = useGasTokenManager()
  const { data, refetch } = useReadContract({
    address: getAddress(payToken?.address, dex.chainId),
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: dex.chainId,
  })
 
  useEffect(() => {
    setBalance(new BigNumber(0))
    setDTTPM(true)
    refetch()
  },[payToken])

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch() // Periodic fetch every 3 seconds
    }, 3000)

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [refetch])

  useEffect(() => {
    if (data) {
      setBalance(new BigNumber(data.toString()) ?? new BigNumber(0))
    } else {
      setBalance(new BigNumber(0))
    }
  }, [data])

  

  useEffect(() => {
    if(!payWithPM || ( balance.gt(paymasterInfo?.feeTokenAmount)) ) {
      setDTTPM(false)
    } else {
      setDTTPM(true)
    }
  },[payWithPM, balance, paymasterInfo])
  

  // Notify the parent component about the status change
  useEffect(() => {
    if(onDisableStatusChange) {
      onDisableStatusChange(disabledDoToPM)
    }
  }, [disabledDoToPM, onDisableStatusChange])

  let displayError
  console.log(error)
  if(error?.includes('insufficient balance for transfer')) displayError = 'insufficient balance for transfer'
  else if(error?.includes('Cannot read properties of undefined')) displayError = 'Select Values'
  else if(error?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) displayError = 'Check Slippage'
   else if(error?.includes('TRANSFER_FROM_FAILED')) displayError = 'Approval Needed'
  else if(!isApproved) displayError = 'Needs Approval'

  console.log(displayError)
  return (
    <>
    {payWithPM &&
      <SwapModalFooterContainer>
        <RowBetween>
          <RowFixed>
            <Text fontSize="10px">Gas Token</Text>
          </RowFixed>
          <Text fontSize="10px">{payToken?.symbol}</Text>
        </RowBetween>
        {!paymasterInfo && payWithPM && !displayError &&
          <Text>Loading Gas Info ...</Text>
        }

        {paymasterInfo && (
          <>
            <RowBetween>
              <RowFixed>
                <Text fontSize="10px">{`${payToken?.symbol} Balance`}</Text>
              </RowFixed>
              <Text fontSize="12px">{balance.shiftedBy(-payToken.decimals).toFixed(6)}</Text>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <Text fontSize="10px">{`${payToken.symbol} Required`}</Text>
              </RowFixed>
              <Text fontSize="12px">{new BigNumber(paymasterInfo.feeTokenAmount).shiftedBy(-paymasterInfo.feeTokendecimals).toFixed(6)}</Text>
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <Text fontSize="10px">{`~USD`}</Text>
              </RowFixed>
              <Text fontSize="12px">{paymasterInfo.feeUSD}</Text>
            </RowBetween>
            
          </>
        )}
        {displayError &&
          <Text>{displayError}</Text>
        }
        
          {payWithPM && disabledDoToPM && paymasterInfo && isApproved && (
              <Text color="red">ERROR: Not Enough Tokens For Gas or Loading.</Text>
            )}
            {payWithPM && paymasterInfo && error !== undefined && isApproved && 
              <Text>Check Slippage, Token Amount</Text>
            }
            {paymasterInfo && isApproved === false &&
              <Text>{error}</Text>
            }
        
      </SwapModalFooterContainer>
      }
    </>
  )
}

export default PayMasterPreview
