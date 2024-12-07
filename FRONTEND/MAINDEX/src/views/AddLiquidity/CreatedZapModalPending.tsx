import React, { useState, useEffect } from 'react';
import { Flex, Modal, Text, Spinner, Button } from 'uikit';
import { useTranslation } from 'contexts/Localization';
import { useZapLiquidity } from 'views/Farms/hooks/useStakeFarms';
import { Token } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { useGetWcicPrice } from 'hooks/useBUSDPrice'
import { TransactionErrorContent } from 'components/TransactionConfirmationModal';
import { useGetTokenPrice } from '../../hooks/useBUSDPrice';
import { dexList } from '../../config/constants/dex';
import { getETHER } from '../../sdk';
import { useGasTokenManager } from '../../state/user/hooks'
import PayMasterPreview from 'components/Menu/UserMenu/payMasterPreview'
import { usePaymaster } from 'hooks/usePaymaster'


const CreatedZapModalPending: React.FC<{
  onDismiss?: () => void;
  inToken: Token;
  tokenA: `0x${string}`;
  tokenB: `0x${string}`;
  chainId: number;
  inRouter: `0x${string}`;
  isBNB: boolean;
  amount: string;
  canZap: boolean;
  pair: string;
}> = ({
  onDismiss,
  inToken,
  tokenA,
  tokenB,
  chainId,
  inRouter,
  isBNB,
  amount,
  canZap,
  pair,
}) => {
  const { t } = useTranslation();
  const handleDismiss = onDismiss || (() => {});
  const [pending, setPending] = useState<boolean>(false);
  const [worked, setWorked] = useState<boolean>(false);
  const ETHER = getETHER(chainId)
  const [displayMessage, setMessage] = useState("Please Confirm Your Liquidity ZAP!");
  const nativeValue = useGetWcicPrice()

  const localDex = dexList.find((d) => d.chainId === chainId)

  const tokenPrice = useGetTokenPrice(localDex, inToken)
  const inTokenValue = inToken === ETHER ? nativeValue : tokenPrice
  const cost = `$${Number(new BigNumber(amount).multipliedBy(inTokenValue).toFixed(3)).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  const [payWithPM, setPayWithPM, payToken, setPayToken] = useGasTokenManager()
  const { fetchPaymaster } = usePaymaster()


  const { onZap } = useZapLiquidity(
    inToken,
    tokenA,
    tokenB,
    chainId,
    inRouter,
    isBNB
  );

  const handleClick = async () => {
    setPending(true);
    setMessage("We are ZAPPING your liquidity right now ...");
    try {
      await onZap(amount);
      setWorked(true);
      setPending(false);
      setMessage("You successfully zapped the liquidity");  
    } catch (error: any) {
      setWorked(true);  
      console.log(error.message)
      setMessage(error.message)
    }
  };

  const [paymasterInfo, setPaymasterInfo] = useState<any | null>(null)
  const [ entireError, setEntireError ] = useState<string>(null)



  useEffect(() => {
    setEntireError(undefined)
    
    const fetchRequest = async () => {
      try {
        if (payWithPM && payToken) {
          const result = await onZap(amount, true)
          const info = await fetchPaymaster(result)
          setPaymasterInfo(info)
        } else {
          setPaymasterInfo(undefined)
        }

      } catch (e: any) {
        console.error('Error fetching swap request:', e);
        setEntireError(e.message)
        setPaymasterInfo(undefined)
      }
    };

    fetchRequest();
  }, [ payWithPM, payToken ])

  const [ disabled, setDisabled] = useState(true)
  const handleDisableStatusChange = (disabled: boolean) => {
    setDisabled(disabled)
  }

  return (
    <Modal title={t('Zapping Liquidity Confirm')} onDismiss={handleDismiss} overflow="none">
      <>
        {pending && !worked &&
          <Flex justifyContent="center" alignItems="center" mt="20px" mb="20px">
            <Spinner /> 
          </Flex>
        }
        {worked && pending ? ( 
           <TransactionErrorContent onDismiss={onDismiss} message={displayMessage} />
        ): (
        <Flex justifyContent="center" alignItems="center" mt="20px" mb="20px">
          <Text>{displayMessage}</Text>
        </Flex>
        )}
        {!worked && !pending &&
        <>
        <Flex justifyContent="center" flexDirection="column" alignItems="center" mt="20px" mb="20px">
          <Text>{`${cost}`}</Text>
          <Text>{`${new BigNumber(amount).toFixed(4)} ${inToken?.symbol}`}</Text>
          <Text>{pair}</Text>
        </Flex>

        <PayMasterPreview paymasterInfo={paymasterInfo} dex={localDex} error={entireError} onDisableStatusChange={handleDisableStatusChange}/>
       
        <Flex justifyContent='center' mt='20px' mb='20px'>
          <Button
            variant={!canZap && !!amount ? 'danger' : 'primary'}
            onClick={worked ? handleDismiss : handleClick}
            disabled={!canZap || pending || disabled}
          >
            {worked ? "Close" : !pending ? `Confirm` :  "Tx Pending ..."}
          </Button>
        </Flex>
        </>
        }
      </>
    </Modal>
  );
};

export default CreatedZapModalPending;
