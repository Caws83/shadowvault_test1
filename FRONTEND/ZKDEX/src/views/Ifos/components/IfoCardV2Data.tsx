import React from 'react'
import useGetPublicIfoV3Data from 'views/Ifos/hooks/v3/useGetPublicIfoData'
import useGetWalletIfoV3Data from 'views/Ifos/hooks/v3/useGetWalletIfoData'
import { Ifo } from 'config/constants/types'
import IfoFoldableCard from './IfoFoldableCard'

interface Props {
  ifo: Ifo
  isInitiallyVisible: boolean
}

const IfoCardV2Data: React.FC<Props> = ({ ifo, isInitiallyVisible }) => {
  const publicIfoDataV3 = useGetPublicIfoV3Data(ifo)
  const walletIfoData = useGetWalletIfoV3Data(ifo)

  return (
    <IfoFoldableCard
      ifo={ifo}
      publicIfoData={publicIfoDataV3}
      walletIfoData={walletIfoData}
      isInitiallyVisible={isInitiallyVisible}
    />
  )
}

export default IfoCardV2Data
