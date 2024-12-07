import React, { useCallback, useEffect, useState } from 'react'
import { ChainId, Currency, Token } from 'sdk'
import styled from 'styled-components'
import { Button, Text, ErrorIcon, ArrowUpIcon, Flex, Box, Link, Spinner, Modal, InjectedModalProps } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import AddToWalletButton from 'components/AddToWallet/AddToWalletButton'
import { AutoColumn } from '../Layout/Column'
import { getBscScanLink } from '../../utils'
import { useChainId } from 'wagmi'
import { waitForTransactionReceipt } from '@wagmi/core'
import { TransactionReceipt } from 'viem'
import { config } from 'wagmiConfig'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const ConfirmedIcon = styled(AutoColumn)`
  padding: 15px 0px;
`

function ConfirmationPendingContent({ pendingText }: { pendingText: string }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
         <AutoColumn justify="center">
      <ConfirmedIcon>
        <Spinner />
      </ConfirmedIcon>
      </AutoColumn>
      <AutoColumn justify="center">
        <Text fontSize="12px" mt="20px" mb="30px">{pendingText}</Text>
        
     
      </AutoColumn>
    </Wrapper>
  )
}

interface Props {
  onDismiss?: () => void;
  chainId: ChainId;
  hash?: `0x${string}`;
  currencyToAdd?: Currency;
}

const TransactionSubmittedContent: React.FC<Props> = ({
  onDismiss = () => {},
  chainId,
  hash,
  currencyToAdd,
}: Props) => {
  const { t } = useTranslation();
  const [ message, setMessage ] = useState('Transaction Submitted')
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!hash) return; // Ensure hash is defined before making the call
      try {
        const receipt = (await waitForTransactionReceipt(config, { hash })) as TransactionReceipt;
          if(receipt.status){
            setMessage(`Transaction Success`)
            setLoading(false)
          } else {
            setMessage(`Transaction Error: ${receipt.status}`)
            setLoading(false)
          }
      } catch (error) {
        setMessage(`Transaction Error: ${error}`)
        setLoading(false)
      }
    };

    fetchReceipt();
  }, [hash]); // Re-run effect when hash changes

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId);

  return (
    <Wrapper>
      <Section>
        <Flex justifyContent={"center"} alignItems="center" mb="30px">

        { loading && <Spinner /> }
        </Flex>
        <AutoColumn gap="12px" justify="center">
          <Text fontSize="14px">{t(message)}</Text>
          {chainId && hash && (
            <Link external small href={getBscScanLink(hash, 'transaction', chainId)}>
              {t('View Transaction')}
            </Link>
          )}
          {currencyToAdd && (
              <Flex justifyContent={"center"} alignItems="center" mt="10px" mb="10px">

<AddToWalletButton tokenAddress={token?.address} tokenSymbol={token?.symbol} tokenDecimals={token?.decimals} />
       
              </Flex>
               )}
  <Flex justifyContent={"center"} alignItems="center" mb="20px">
          <Button onClick={onDismiss} mt="20px">
            {t('Close')}
          </Button>
          </Flex>
        </AutoColumn>
      </Section>
    </Wrapper>
  );
};
export function ConfirmationModalContent({
  bottomContent,
  topContent,
}: {
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Box>{topContent()}</Box>
      <Box>{bottomContent()}</Box>
    </Wrapper>
  )
}


export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const { t } = useTranslation();

  const [showFullError, setShowFullError] = useState(false);

  let solutionMessage = t(`
    Make Sure you are connected to the correct network.
    Make sure your slippage can cover token fees.
    Make sure you have enough gas to cover transaction fee.
    Make sure your decimal amount is no more than token decimals.
    For ZAP Liquidity, ensure zkCRO pairs have sufficient liquidity.
  `)
  
  let errorMessage = t(`Check the following.`)
    console.log(message)
  // Check for specific error messages and update errorMessage accordingly
  if (message.includes("INSUFFICIENT_OUTPUT_AMOUNT") || message.includes("Price impact exceeds slippage") ) {
    errorMessage = t(`Slippage too low.`);
    solutionMessage = t(`Try Increasing Slippage`)
    
  }
  if (message.includes("The total cost (gas * gas fee + value)")) {
    errorMessage = t(`Not enough gas balance.`)
    solutionMessage = t(`Transfer some gas token to perform the transaction.`);
  }
  if (message.includes("Arithmic operation resulted in underflow")) {
    errorMessage = t(`Too many decimals on INPUT or OUTPUT amounts.`)
    solutionMessage = t(`Check and remove decimals from INPUT or OUTPUT Amounts.`);
  }
  if (message.includes("Transaction rejected") || message.includes("User denied transaction signature")) {
    errorMessage = t(`You manually declined the TX in your Wallet.`);
    solutionMessage = t(`Re-send the TX, and confirm in Wallet.`)
    
  }

  const toggleFullError = () => {
    setShowFullError(!showFullError);
  };

  return (
    <Wrapper>
      <AutoColumn justify="center">
        <ErrorIcon color="failure" width="64px" />
        <Text color="failure" fontSize="24px" bold>
            ERROR:
          </Text>
        <Text color="failure" style={{ textAlign: 'center', width: '85%', whiteSpace: 'pre-line' }}>
          {showFullError ? message : errorMessage}
          <hr style={{ borderTop: '1px solid #ccc', margin: '16px 0' }} /> {/* Underline-like border */}
        </Text>
        {!showFullError &&
        <>
       
          <Text color="primary" bold>
            SOLUTION:
          </Text>
          <Text color="textSubtle" style={{ textAlign: 'center', width: '85%', whiteSpace: 'pre-line' }}>
            {solutionMessage}
          </Text>
        </>
        }
        <Text>
            <br />
            <span style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '8px' }} onClick={toggleFullError}>
              {!showFullError ? t(' Click here to see full error') : t(' Hide Full Error')}
            </span>
        
        </Text>
      </AutoColumn>

      <Flex justifyContent="center" pt="24px">
        <Button onClick={onDismiss}>{t('Dismiss')}</Button>
      </Flex>
    </Wrapper>
  );
}




interface ConfirmationModalProps {
  title: string
  chainId: number
  customOnDismiss?: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

const TransactionConfirmationModal: React.FC<InjectedModalProps & ConfirmationModalProps> = ({
  title,
  chainId,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}) => {
  
  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }
    onDismiss()
  }, [customOnDismiss, onDismiss])

  if (!chainId) return null

  return (
    <Modal max-width={'330px'} title={title} headerBackground="gradients.cardHeader" onDismiss={handleDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash as `0x$string`}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default TransactionConfirmationModal
