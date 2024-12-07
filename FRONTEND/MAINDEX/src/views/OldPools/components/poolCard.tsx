import React, { useState, useEffect } from 'react';
import LedgerCard from './ledgerCard';
import { oldPoolInfo } from '../types';
import { oldPoolsAbi } from 'config/abi/oldPools';
import { Address } from 'viem'
import { useReadContracts } from 'wagmi';


const PoolCard: React.FC<React.PropsWithChildren<{
  poolInfo: oldPoolInfo;
  account: Address
  ledgerLength: number
}>> = ({ poolInfo, account, ledgerLength}) => {

  const ledgerArray = Array.from({ length: ledgerLength }, (_, index) => index);

  const LedgerCalls = ledgerArray.map((ledger) => {
    return {
      address: poolInfo.address,
      abi: oldPoolsAbi,
      functionName: 'ledger',
      args: [account, BigInt(ledger)],
      chainId: poolInfo.chainId,
    }
  })
  const {data, isLoading} = useReadContracts({ contracts: LedgerCalls })
  
  return (
    <>
      {ledgerLength > 0 && (
        ledgerArray.map((index) => (
          !isLoading && data && data[index].status === 'success' && !data[index].result[5] ? (
            <LedgerCard key={`${poolInfo.address}-${index}`} poolInfo={poolInfo} ledger={index} account={account} />
          ) : null
        ))
      )}
    </>
  );
  
  
};

export default PoolCard;
