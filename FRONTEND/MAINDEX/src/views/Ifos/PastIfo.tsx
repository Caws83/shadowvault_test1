import React, { useEffect, useState } from 'react'
import { Ifo as IfoType } from 'config/constants/types'
import IfoLayout from './components/IfoLayout'
import IfoCardV2Data from './components/IfoCardV2Data'
import ifosConfig from 'config/constants/ifos'
import { useAccount } from 'wagmi'
import { Flex } from 'uikit'

const Ifo = () => {
  const { chain } = useAccount()

  const [activeIfo, setActiveIfo] = useState<IfoType[]>([])

  useEffect(() => {
    const fetchPoolsData = async () => {

      const fetchedList = await ifosConfig()
      const activeIfoList = fetchedList.filter(
        ifo => !ifo.isActive && (chain?.id !== 245022926 ? ifo.dex.chainId !== 245022926 : true),
      )
      setActiveIfo(activeIfoList)
    }


    fetchPoolsData()
  }, [])

  return (
    <IfoLayout>
      <Flex
        justifyContent='center'
        alignItems='center'
        style={{ paddingTop: 40, paddingBottom: 20, overflowY: 'auto', flexWrap: 'wrap', rowGap: 40, columnGap: 40 }}
      >
        {activeIfo.length > 0 &&
          activeIfo
            .slice()
            .reverse()
            .map(ifo => <IfoCardV2Data key={ifo.id} ifo={ifo} isInitiallyVisible={false} />)}
      </Flex>
    </IfoLayout>
  )
}

export default Ifo
