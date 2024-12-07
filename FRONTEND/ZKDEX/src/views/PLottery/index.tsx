import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
import React from 'react'
import { useFetchPLotteryPublicData, usePLottery } from 'state/plottery/hooks'
import PLotteryTable from './LotteryTable/PLotteryTable'
import { useAccount } from 'wagmi'

const Partners: React.FC = () => {
  const { address: account } = useAccount()
  const { plotteries, userDataLoaded } = usePLottery()

  useFetchPLotteryPublicData()

  return (
    <>
      <PageHeader firstHeading="Lotteries" secondHeading="Play, Game, Win!!" />
      <Page>
        <PLotteryTable plotteries={plotteries} userDataLoaded={userDataLoaded} account={account} />
      </Page>
    </>
  )
}

export default Partners
