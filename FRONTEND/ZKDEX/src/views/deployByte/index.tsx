/* eslint-disable no-await-in-loop */
import { Flex, Button, Text } from 'uikit'
import React, { useState, useEffect } from 'react'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useAccount, useEstimateFeesPerGas, useWalletClient } from 'wagmi'
import * as zk from 'zksync-ethers';
import { createWalletClient, custom } from 'viem'
// import erc404 from 'config/abi/tokens/MarswapERC404.json' // compiler info from hardhat using ZKSOLC
// import ultimate from 'config/abi/tokens/UltimateToken.json' // compiler info from hardhat using ZKSOLC
import poolFactory from './todeploy/poolFactory/SmartPoolFactory.json'
import nftLaunchHost from './todeploy/nftHost/NFTHost.json'
import nftPoolFactory from './todeploy/NFTPoolFactory/NFTPoolFactory.json'
import priceChecker from './todeploy/priceCheck/TokenPriceCheck.json'
import quickCalls from './todeploy/QC/QuickCalls.json'
import airDropper from './todeploy/Airdrop.json'

import infoCHef from './code.json'
import { eip712WalletActions } from 'viem/zksync'
import { waitForTransactionReceipt } from '@wagmi/core';
import { config } from 'wagmiConfig';
import { BigNumber } from 'bignumber.js'

import vsg from `./vsg.json`


const Deploy: React.FC = () => {
  const { address: account, chain } = useAccount()
  const [status, setStatus] = useState("Wallet Client Not initialized")
  const [walletClient, setWalletClient] = useState(null)
  const { data: wc, refetch } = useWalletClient({chainId: chain?.id})


  // set walletClient using EIP712
  useEffect(() => {
    const initWalletClient = async () => {
      try {
        const client = createWalletClient({
          chain,
          account,
          transport: custom(window.ethereum!)
        }).extend(eip712WalletActions());
        setWalletClient(client);
        setStatus(`walletSet ${account} - ${chain?.id}`)
      } catch (error) {
        setStatus("error setting wallet");
      }
    };
    if (window.ethereum && account && chain?.id) {
      initWalletClient();
    }
  }, [window.ethereum, account, chain]);

  const {data} = useEstimateFeesPerGas({chainId: chain?.id})

  const onClickConfirmEthers = async () => {
    setStatus("Deploying...PriceChecker");
    try {
    // working
    const factory = new zk.ContractFactory<any[], zk.Contract>(
      priceChecker.abi,
      priceChecker.bytecode,
      walletClient,
      'create',
    );

    // Encode and send the deploy transaction providing factory dependencies.
    const contract = await factory.deploy(
      "0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742","0x9d3A14825316Bf3F5704F5Ed05AF6b84a23E0fE2",["0x2cc4e3E6104c032ceB57D7DdAd7bb23d9D425A1B"],
      {
        customData: {
          factoryDeps: [priceChecker.bytecode],
      },

    });
    
    const address = await contract.getAddress()

    setStatus(`DeploySuccess ${address}`)
  } catch (e) {
    setStatus(`Deployment failed: ${e}`);

  }

}

  const onClickConfirm1 = async () => {
      setStatus("Deploying...PoolFactory");
    try {
      // Viem KSYNC method as per documentation.
      const hash = await walletClient.deployContract({
        abi: poolFactory.abi,
        bytecode: poolFactory.bytecode,
        account,
        args: ["0x2cc4e3E6104c032ceB57D7DdAd7bb23d9D425A1B","1000000000"],
        maxFeePerGas: data?.maxFeePerGas,
        gasPerPubdata: 50000n,
        factoryDeps: ["0x010006f3b8f65e3ee8128b9002d399c824ac6c3f8f0278fff67613b373019dc6", poolFactory.bytecode]
      });
      const receipt = await waitForTransactionReceipt(config, { hash })
      if (receipt.status) {
        setStatus(`DeploySuccess ${receipt.contractAddress}`)
      }      
    } catch (e) {
      setStatus(`Deployment failed: ${e}`);

    }
  };

  const onClickConfirm2 = async () => {
    setStatus("Deploying...NFTHost");
  try {
    // Viem KSYNC method as per documentation.
    const hash = await walletClient.deployContract({
      abi: nftLaunchHost.abi,
      bytecode: nftLaunchHost.bytecode,
      account,
      maxFeePerGas: data?.maxFeePerGas,
      gasPerPubdata: 50000n,
      factoryDeps: [nftLaunchHost.bytecode]
    });
    const receipt = await waitForTransactionReceipt(config, { hash })
    if (receipt.status) {
      setStatus(`DeploySuccess ${receipt.contractAddress}`)
    }      
  } catch (e) {
    setStatus(`Deployment failed: ${e}`);
  }
};

const onClickConfirm3 = async () => {
  setStatus("Deploying...NFT Pool Factory");
try {
  // Viem KSYNC method as per documentation.
  const hash = await walletClient.deployContract({
    abi: nftPoolFactory.abi,
    bytecode: nftPoolFactory.bytecode,
    account,
    args: ["10000000","0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"],
    maxFeePerGas: data?.maxFeePerGas,
    gasPerPubdata: 50000n,
    factoryDeps: ["0x01000b03bea17a2238d38532f2bf1a32dbd3354011452cbd469b2e2fce502e4f", nftPoolFactory.bytecode]
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};
const onClickConfirm4 = async () => {
  setStatus("Deploying...PriceChecker");
try {
  // Viem KSYNC method as per documentation.
  const hash = await walletClient.deployContract({
    abi: priceChecker.abi,
    bytecode: priceChecker.bytecode,
    account,
    args: ["0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742","0x9d3A14825316Bf3F5704F5Ed05AF6b84a23E0fE2",["0x2cc4e3E6104c032ceB57D7DdAd7bb23d9D425A1B"]],
    maxFeePerGas: data?.maxFeePerGas,
    gasPerPubdata: 50000n,
    factoryDeps: [priceChecker.bytecode]
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};
const onClickConfirm5 = async () => {
  setStatus("Deploying...QuickCalls");
try {
  // Viem KSYNC method as per documentation.
  const hash = await walletClient.deployContract({
    abi: quickCalls.abi,
    bytecode: quickCalls.bytecode,
    account,
    args: ["0x73Fd77Fb26192a3FE4f5EFb9EBa5BB5f6Cf96742","0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1"],
    maxFeePerGas: data?.maxFeePerGas,
    gasPerPubdata: 50000n,
    factoryDeps: [quickCalls.bytecode]
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};
const onClickConfirm6 = async () => {
  setStatus("Deploying...AirDropper");
try {
  // Viem KSYNC method as per documentation.
  const hash = await walletClient.deployContract({
    abi: airDropper.abi,
    bytecode: airDropper.bytecode,
    account,
    maxFeePerGas: data?.maxFeePerGas,
    gasPerPubdata: 50000n,
    factoryDeps: [airDropper.bytecode]
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};
  
const onClickConfirm = async () => {
  setStatus("Deploying...InfoChef");
try {
  // Viem KSYNC method as per documentation.
  const hash = await walletClient.deployContract({
    abi: infoCHef.abi,
    bytecode: infoCHef.bytecode,
    account,
    maxFeePerGas: data?.maxFeePerGas,
    gasPerPubdata: 50000n,
    factoryDeps: [infoCHef.bytecode]
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};

const onClickConfirmHost = async () => {
  setStatus("Deploying...VSG");
try {
 
  const hash = await wc.deployContract({
    abi: vsg.abi,
    bytecode: vsg.bytecode,
    account,
    args: [200, 200, 50, 50, 0, "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008", "0x2909F0F72fE53F41e093dE06aDEA2758680DeF46", "0x449183e39d76FA4c1f516d3ea2fEeD3E8c99E8F1", 10000000000, "0x2909F0F72fE53F41e093dE06aDEA2758680DeF46"],
  });
  const receipt = await waitForTransactionReceipt(config, { hash })
  if (receipt.status) {
    setStatus(`DeploySuccess ${receipt.contractAddress}`)
  }      
} catch (e) {
  setStatus(`Deployment failed: ${e}`);
}
};

  if (!account) {
    return (
      <Flex m="10px" alignItems="center" justifyContent="center">
        <ConnectWalletButton chain={56} />
      </Flex>
    );
  }

  return (
    <>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirmHost} disabled={!window.ethereum || !wc}>
          Deploy NFTHost
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm1} disabled={!window.ethereum || !walletClient && !data}>
          Deploy PoolFactory Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm2} disabled={!window.ethereum || !walletClient && !data}>
          Deploy NFT HOST Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm3} disabled={!window.ethereum || !walletClient && !data}>
          Deploy NFT PoolFactory Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm4} disabled={!window.ethereum || !walletClient && !data}>
          Deploy PriceChecker Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm5} disabled={!window.ethereum || !walletClient && !data}>
          Deploy QuickCalls Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm6} disabled={!window.ethereum || !walletClient && !data}>
          Deploy AirDropper Test
        </Button>
      </Flex>

      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirm} disabled={!window.ethereum || !walletClient && !data}>
          Deploy InfoChef Test
        </Button>
      </Flex>
      <Flex justifyContent="center" m="12px">
        <Button onClick={onClickConfirmEthers} disabled={!window.ethereum || !walletClient && !data}>
          Deploy Ether Setup
        </Button>
      </Flex>
      <Text>{status}</Text>
     
    </>
  );
};

export default Deploy;
