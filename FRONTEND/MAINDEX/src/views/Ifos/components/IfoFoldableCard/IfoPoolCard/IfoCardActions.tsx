import React from 'react';
import { Ifo, PoolIds } from 'config/constants/types';
import { WalletIfoData, PublicIfoData } from 'views/Ifos/types';
import ConnectWalletButton from 'components/ConnectWalletButton';
import ContributeButton from './ContributeButton';
import RevokeButton from './RevokeButton';
import ClaimButton from './ClaimButton';
import { useAccount } from 'wagmi';
import { Flex } from 'uikit';
import styled from 'styled-components';
import { isMobile } from 'components/isMobile';

interface Props {
  poolId: PoolIds;
  ifo: Ifo;
  publicIfoData: PublicIfoData;
  walletIfoData: WalletIfoData;
}

const FlexLayout = styled(Flex)`
  flex-direction: ${isMobile ? 'column' : 'row'};
  justify-content: center;
  align-items: center;
  gap: 15px; /* Adjust the gap value as needed */
`;

const IfoCardActions: React.FC<Props> = ({ poolId, ifo, publicIfoData, walletIfoData }) => {
  const { address: account } = useAccount();
  const { chain } = useAccount();
  const showConnectButton = !account || chain?.id !== ifo.dex.chainId;
  const userPoolCharacteristics = walletIfoData[poolId];
  const poolCharacteristic = publicIfoData[poolId];
  const pool2 = publicIfoData[poolId === 'poolUnlimited' ? 'poolBasic' : 'poolUnlimited'];

  const { softCap } = publicIfoData;
  const totalStaked = poolCharacteristic.totalAmountPool.plus(pool2.totalAmountPool);
  const isRefund = totalStaked.lt(softCap);

  if (showConnectButton) {
    return (
      <Flex justifyContent="center" m="40px">
        <ConnectWalletButton chain={ifo.dex.chainId} />
      </Flex>
    );
  }

  return (
    <>
      {publicIfoData.status === 'live' && (
        <FlexLayout>
          <Flex>
          <RevokeButton poolId={poolId} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          </Flex>
          <Flex>
           <ContributeButton poolId={poolId} ifo={ifo} publicIfoData={publicIfoData} walletIfoData={walletIfoData} />
          </Flex>
        </FlexLayout>
      )}
      {publicIfoData.status === 'finished' && publicIfoData.finalized &&
        !userPoolCharacteristics.hasClaimed &&
        (userPoolCharacteristics.offeringAmountInToken.isGreaterThan(0) ||
          userPoolCharacteristics.refundingAmountInLP.isGreaterThan(0)) && (
          <ClaimButton poolId={poolId} walletIfoData={walletIfoData} isRefund={isRefund} ifo={ifo} />
        )}
    </>
  );
};

export default IfoCardActions;
