import BigNumber from 'bignumber.js'
import React from 'react'
import { CardBody, Flex, Text, CardRibbon } from 'uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from 'contexts/Localization'
import { BIG_ZERO } from 'utils/bigNumber'
import { Pool } from 'state/types'
import AprRow from './AprRow'
import { StyledCard } from './StyledCard'
import CardFooter from './CardFooter'
import StyledCardHeader from './StyledCardHeader'
import CardActions from './CardActions'
import { useAccount } from 'wagmi'

const PoolCard: React.FC<{ pool: Pool; account: string, isWidget: boolean }> = ({ pool, account, isWidget }) => {
  const { sousId, stakingToken, earningToken, isFinished, userData } = pool
  const { t } = useTranslation()
  const { chain } = useAccount()

  const showConnectButton = !account || chain?.id !== pool.chainId

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance.toString()) : BIG_ZERO
  const accountHasStakedBalance = stakedBalance.gt(0)


  return (
    <StyledCard
      isFinished={isFinished && sousId !== 0}
      ribbon={isFinished && <CardRibbon variantColor="textDisabled" text={t('Finished')} />}
    >
      <StyledCardHeader
        isStaking={accountHasStakedBalance}
        earningToken={earningToken}
        stakingToken={stakingToken}
        isFinished={isFinished && sousId !== 0}
        pool={pool}
      />
      <CardBody>
        <AprRow pool={pool} stakedBalance={stakedBalance} />
        <Flex mt="24px" flexDirection="column">
          {!showConnectButton ? (
            <CardActions pool={pool} stakedBalance={stakedBalance} />
          ) : (
            <>
                         <Flex alignItems={'center'} justifyContent={'center'} mt="20px" mb="20px">
              <ConnectWalletButton chain={pool.chainId} />
              </Flex>
            </>
          )}
        </Flex>
      </CardBody>
      <CardFooter pool={pool} account={account} isWidget={isWidget}/>
    </StyledCard>
  )
}

export default PoolCard
