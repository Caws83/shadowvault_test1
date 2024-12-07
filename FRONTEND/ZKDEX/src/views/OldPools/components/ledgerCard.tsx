import React, { useState, useEffect } from 'react';
import ConnectWalletButton from 'components/ConnectWalletButton';
import { CardBody, Flex, Text, Button, CardRibbon, TimerIcon, AutoRenewIcon, WarningIcon } from 'uikit';
import { StyledCard } from '../StyledCard';
import StyledCardHeader from '../StyledCardHeader';
import { useAccount, useReadContracts } from 'wagmi';
import { simulateContract, writeContract, readContract } from '@wagmi/core'
import { oldPoolInfo } from '../types';
import BigNumber from 'bignumber.js';
import { oldPoolsAbi } from 'config/abi/oldPools';
import { oldPoolsDualAbi } from 'config/abi/oldPoolsDual'
import useToast from 'hooks/useToast'
import { Address } from "viem"
import Balance from 'components/Balance'
import { config } from 'wagmiConfig'
import { ERC20_ABI } from 'config/abi/ERC20ABI';
import useRefresh from 'hooks/useRefresh';

const LedgerCard: React.FC<React.PropsWithChildren<{
  poolInfo: oldPoolInfo;
  ledger: number;
  account: Address
}>> = ({ poolInfo, ledger, account }) => {
  const { chain } = useAccount();
  const chainId = poolInfo.chainId;
  const showConnectButton = !account || chain?.id !== chainId;
  const { toastSuccess, toastError } = useToast()

  const [startTime, setStartTime] = useState(new BigNumber(0));
  const [amount, setAmount] = useState(new BigNumber(0));
  const [isFinished, setEnded] = useState(true);
  const [maturity, setMaturity] = useState(new BigNumber(0));
  const [ owner, setOwner ] = useState<Address>('0x0')

  const [gains1, setG1] = useState(new BigNumber(0))
  const [gains2, setG2] = useState(new BigNumber(0))

  const [ token1, setToken1 ] = useState<Address>('0x0')
  const [ token2, setToken2 ] = useState<Address>('0x0')
  const [ ownerHasTokens, setOHT ] = useState(false)
  const [ ownerHasTokens2, setOHT2 ] = useState(false)
  const { slowRefresh } = useRefresh()

  const nowEpoch = new BigNumber(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const fetchDataForDual = async () => {
      if(poolInfo.isDual){
      try {
        // Fetch data for get_gains2 and asset2 when isDual is true
        const gains2Result = await readContract(config, {
          address: poolInfo.address,
          abi: oldPoolsDualAbi,
          functionName: 'get_gains2',
          args: [account, BigInt(ledger)],
          chainId: chainId,
        });
  
        const asset2Result = await readContract(config, {
          address: poolInfo.address,
          abi: oldPoolsDualAbi,
          functionName: 'asset2',
          chainId: chainId,
        });
  
        // Process the data for get_gains2 and asset2
        if (gains2Result && asset2Result) {
          setG2(new BigNumber(gains2Result.toString()));
          setToken2(asset2Result as Address);
        }
      } catch (error) {
        console.error('Error fetching data for get_gains2 and asset2:', error);
      }
    };
    }
    fetchDataForDual()
  }, [slowRefresh]);
  
 const { data, isLoading, refetch } =  useReadContracts({
    contracts: [
      {
        address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'ledger',
        args: [account, BigInt(ledger)],
        chainId: chainId,
      },
      {
        address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'maturity',
        chainId: chainId,
      },
      {
        address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'getOwner',
        chainId: chainId,
      },
      {
        address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'asset',
        chainId: chainId,
      },
      {
        address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'get_gains',
        args: [account, BigInt(ledger)],
        chainId: chainId,
      } 
    ]
  });

  useEffect(() => {
    
    if (data && !isLoading && data[0].status === "success") {
      const dataInfo = data[0].result;
      setStartTime(new BigNumber(dataInfo[0].toString()));
      setAmount(new BigNumber(dataInfo[1].toString()));
      setEnded(dataInfo[5]);
      setMaturity(new BigNumber(data[1].result.toString()));
      setOwner(data[2].result as Address);
      setToken1(data[3].result as Address);
      setG1(new BigNumber(data[4].result.toString())); // Set gains1
      
    }
  },[data])

  useEffect(() => {
    refetch()
  },[slowRefresh])
  

  useEffect(() => {
  const fetchTokenData = async () => {
 
      let allowance1, balance1;
      if(token1 !== "0x0"){
      allowance1 = await readContract(config, {
        address: token1 as Address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, poolInfo.address],
        chainId: chainId,
      });

      balance1 = await readContract(config, {
        address: token1 as Address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [owner],
        chainId: chainId,
      });
      if (
        new BigNumber(allowance1.toString()).gte(gains1.toString()) &&
        new BigNumber(balance1.toString()).gte(gains1.toString())
      ) {
        setOHT(true);
      } else setOHT(false)
    }

      let allowance2, balance2;

      if (poolInfo.isDual && token2 !== "0x0") {
        allowance2 = await readContract(config, {
          address: token2 as Address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [owner, poolInfo.address],
          chainId: chainId,
        });

        balance2 = await readContract(config, {
          address: token2 as Address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [owner],
          chainId: chainId,
        });
        if (
          new BigNumber(allowance2.toString()).lt(gains2.toString()) ||
          new BigNumber(balance2.toString()).lt(gains2.toString())
        ) {
          setOHT2(false);
        } else setOHT2(true)
      }
  };

  fetchTokenData();
}, [token1, token2, owner, poolInfo, gains1, gains2]);


  const [isEarly, setEarly] = useState(true);

  useEffect(() => {
    if (nowEpoch.gte(startTime.plus(maturity.toString()))) {
      setEarly(false);
    } else {
      setEarly(true);
    }
  }, [nowEpoch, startTime, maturity]);

  const blocksToDisplay = isEarly ? startTime.plus(maturity.toString()).minus(nowEpoch.toString()).toNumber() : 0

  const [pendingTx, setPendingTx] = useState(false)

  const onConfirm = async () => {
    setPendingTx(true)
    try {
      const { request } = await simulateContract(config, {
        abi: oldPoolsAbi,
        address: poolInfo.address,
        functionName: 'end',
        args: [ledger],
        chainId: poolInfo.chainId
      })
      await writeContract(config, request)
      toastSuccess(
        `${'Unstaked'}!`, `Successfully unstaked`)
      setPendingTx(false)
    } catch {
      toastError('Error', 'Please try again. Confirm the transaction and make sure you are paying enough gas!')
      setPendingTx(false)
    }
  }
if(!isFinished) {
  return (
    <StyledCard>
      <StyledCardHeader poolInfo={poolInfo} isFinished={isFinished} />
      <CardBody>
        <Flex mt="24px" flexDirection="column">
          {!showConnectButton ? (
            <>
              <Flex mb="2px" justifyContent="space-between" alignItems="center">
                <Text>Ledger #:</Text>
                <Text>{`${ledger}`}</Text>
              </Flex>
              <Flex mb="2px" justifyContent="space-between" alignItems="center">
                <Text>Amount Staked:</Text>
                <Text>{`${amount.shiftedBy(-18).toFixed(3)}`}</Text>
              </Flex>
              <Flex mb="2px" justifyContent="space-between" alignItems="center">
                <Text>Term Ends In:</Text>
                <Flex>
                  <Balance small value={blocksToDisplay / 86400} decimals={2} color="primary" />
                  <Text small ml="4px" color="primary" textTransform="lowercase">
                    {'Days'}
                  </Text>
                  <TimerIcon ml="4px" color="primary" />
                </Flex>
              </Flex>

              <Flex flexDirection="column">
                <Flex mb="2px" justifyContent="space-between" alignItems="center">
                  <Text color={!ownerHasTokens && 'red' }>Gains:</Text>
                  <Text color={!ownerHasTokens && 'red' }>{`${new BigNumber(gains1.toString()).shiftedBy(-18).toFixed(3)} ${poolInfo.earningSymbol}`}</Text>
                </Flex>

                {poolInfo.isDual && (
                  <Flex mb="2px" justifyContent="space-between" alignItems="center">
                    <Text color={!ownerHasTokens2 && 'red' }>Gains 2:</Text>
                    <Text color={!ownerHasTokens2 && 'red' }>{`${new BigNumber(gains2.toString()).shiftedBy(-18).toFixed(3)} ${poolInfo.earning2Symbol}`}</Text>
                  </Flex>
                )}
                {(!ownerHasTokens || ( poolInfo.isDual && !ownerHasTokens2) )&&
                <>
                  <Flex ml='10px' justifyContent='space-between' mr="10px" >
                    <WarningIcon color="secondary" /> <WarningIcon color="secondary" />
                  </Flex>
                  <Text fontSize='10px'> Owner Does Not Have the required tokens to pay interest, Or they have not Approved the tokens yet.</Text>
                  <Text fontSize='10px'> If you proceed you will forfeit your rewards, and Collect your stake. </Text>
                </>
                }
                <Button
                  mt="8px"
                  isLoading={pendingTx}
                  onClick={onConfirm}
                  endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
                >
                  { pendingTx ? 'Confirming' : isEarly ? 'EMERGENCY UNSTAKE' : 'Claim & Unstake'}
                </Button>
              </Flex>
            </>
          ) : (
            <>
              <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
                Connect to withdrawl
              </Text>
              <ConnectWalletButton chain={chainId} />
            </>
          )}
        </Flex>
      </CardBody>
    </StyledCard>
  );
} else {
  return null
}
};

export default LedgerCard;
