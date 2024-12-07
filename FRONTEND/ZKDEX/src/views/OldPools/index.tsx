import React, { useEffect, useState } from 'react';
import PageHeader from 'components/PageHeader';
import { oldPoolInfo } from './types';
import PoolCard from './components/poolCard';
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { oldPoolsAbi } from 'config/abi/oldPools';
import { BigNumber } from 'bignumber.js';

const poolConfig = [
  {
    address: '0x048cb93e234a65C7da2da20550ef63Be63CDb6F0',
    stakingSymbol: 'MSWAP',
    earningSymbol: 'MSWAP',
    chainId: 1,
  },
  {
    address: '0xA60b1f1b6E8e05b65647B6C3701B624093700B57',
    stakingSymbol: 'MSWAP',
    earningSymbol: 'MSWAP',
    earning2Symbol: 'SHIB',
    chainId: 1,
    isDual: true,
  },
  {
    address: '0xc88f23fABfD264AeE6DF7a98052fBea4E92b7419',
    stakingSymbol: 'MSWAP',
    earningSymbol: 'MSWAP',
    earning2Symbol: 'BONE',
    chainId: 1,
    isDual: true,
  },
  {
    address: '0x168d86D4bC409516d83819cEf7117fA8FC19Ee61',
    stakingSymbol: 'BAD',
    earningSymbol: 'BAD',
    earning2Symbol: 'TBONE',
    chainId: 1,
    isDual: true,
  },
  {
    address: '0x7438771AD08dE59585b9fA160Bf75c0127Ac09F8',
    stakingSymbol: 'MULTI',
    earningSymbol: 'MULTI',
    chainId: 1,
  },
  {
    address: '0x71eC1678B2f12bEfda387571222c8A8aD2163d69',
    stakingSymbol: 'MULTI',
    earningSymbol: 'MULTI',
    chainId: 1,
  },
  {
    address: '0x5d975EdE7846ddcD321A87561F01A0Aabf329bBa',
    stakingSymbol: 'MULTI',
    earningSymbol: 'MULTI',
    earning2Symbol: 'SHIB',
    chainId: 1,
    isDual: true,
  },
  {
    address: '0x16C5fbC99Fc0C87CeA168edf2a51A0A9D95bB062',
    stakingSymbol: 'MBET',
    earningSymbol: 'MBET',
    chainId: 1,
  },
  {
    address: '0x0cEA47B819FB3dA68668E1e35d8a4F6Ae1961856',
    stakingSymbol: 'EVIL',
    earningSymbol: 'EVIL',
    chainId: 1,
  },
  {
    address: '0x2974d756364B024f64caE99984B2Fa11357Cf3F8',
    stakingSymbol: 'EVIL',
    earningSymbol: 'EVIL',
    chainId: 1,
  },
  {
    address: '0x58409c8538ce7E58C3321Ee2374BBEcf285fc5AD',
    stakingSymbol: 'EVIL',
    earningSymbol: 'EVIL',
    chainId: 1,
  },
  {
    address: '0xC64064e7DFf8F4bF3eb8EdBcD7dAD866752bf4F4',
    stakingSymbol: 'PREME',
    earningSymbol: 'PREME',
    chainId: 1,
  },
  {
    address: '0x721b903e67C41c1A6f7aD789535218b93a413D68',
    stakingSymbol: 'PREME',
    earningSymbol: 'PREME',
    chainId: 1,
  },
  {
    address: '0x0F66e4455740c7AE2F1D4975E71b2387068C05b7',
    stakingSymbol: 'PREME',
    earningSymbol: 'PREME',
    chainId: 1,
  },
  {
    address: '0x559F005d6bC2BBCbfAdc0424bcF5B5E0735f7232',
    stakingSymbol: 'SHIB2',
    earningSymbol: 'SHIB2',
    chainId: 1,
  },
  {
    address: '0x7FffC5613390943cd7667335b552284612213396',
    stakingSymbol: 'SHIB2',
    earningSymbol: 'SHIB2',
    chainId: 1,
  },
  {
    address: '0x1564666CA1c32D5c71F2b4560eCcd783fF3197da',
    stakingSymbol: 'PLYWLD',
    earningSymbol: 'PLYWLD',
    chainId: 56,
  },
  {
    address: '0x08114D23023b9507d937DFD35fc1aeF2792BAd38',
    stakingSymbol: 'CRYPTIQ',
    earningSymbol: 'BONE',
    chainId: 1,
  },
  {
    address: '0x885eB636e49ca9f29Fba1D77Cc2534E43C78791c',
    stakingSymbol: 'CRYPTIQ',
    earningSymbol: 'MSWAP',
    chainId: 1,
  },
  {
    address: '0x829f97891441852b0D4521465eD3A115F42D3124',
    stakingSymbol: 'PAW',
    earningSymbol: 'PAW',
    chainId: 1,
  },
  {
    address: '0xA36d862286375cd6833dA9bc91efFC4216Ab80D6',
    stakingSymbol: 'PAW',
    earningSymbol: 'PAW',
    chainId: 1,
  },
  {
    address: '0xa22C6E076c8adc531F0A8089F3D9722D7C2d34d6',
    stakingSymbol: 'PAW',
    earningSymbol: 'PAW',
    chainId: 1,
  }
] as oldPoolInfo[];

const gridLayout = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  };

function DEFIPools() {
 const { address: account } = useAccount()
// const account = '0xd3eA396bAD36bAf198Da60B82901EcF047076653'
  

  const LedgerCalls = poolConfig.map((poolInfo) => {
    return {
      address: poolInfo.address,
        abi: oldPoolsAbi,
        functionName: 'ledger_length',
        args: [account],
        chainId: poolInfo.chainId,
    }
  })
  const {data, isLoading} = useReadContracts({ contracts: LedgerCalls })

  return (
    <>
      <PageHeader firstHeading="DEFI Pools" secondHeading="WithDrawl From Old Defi Pools" />
  
      <div style={gridLayout}>
        {poolConfig.map((poolInfo, index) => (
          data && !isLoading && data[index].status === 'success' && new BigNumber(data[index].result.toString()).gt(0) ? (
            <PoolCard key={`${poolInfo.address}-${index}`} poolInfo={poolInfo} account={account} ledgerLength={Number(data[index].result)} />
          ) : null
        ))}
      </div>
    </>
  );
  


}

export default DEFIPools;
