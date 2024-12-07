import { Address } from "viem"
import { Button, Flex } from "../../uikit"
import NftCard from "./NftCard"
import { useReadContract, useReadContracts } from "wagmi"
import { NFT_MARKETPLACE } from "../../config/marketPlace"
import { nftMarketAbi } from "../../config/abi/nftMarket"
import { useState, useEffect } from "react"
import useRefresh from "hooks/useRefresh"


interface state {
    ids: readonly any[],
    sales: readonly any[],
  }
                               
const MySaleCard: React.FC<React.PropsWithChildren<{
    collectionAddress: Address, 
    colName: string,
    chainId: number
    address: Address
}>> = ({   
    collectionAddress,
    colName,
    chainId,
    address,
}) => {            

    const [ info, setData ] = useState<state>(
        {
          ids: [],
          sales: [],
        }
      )
      const [ howMany, setHowMany] = useState(10)
      const [ atMax, setatMax ] = useState(false)

      const HandleMore = () => {
        setHowMany(howMany+5)
      }
    const { slowRefresh } = useRefresh()
    const {data, isLoading, refetch} = useReadContract({
                address: NFT_MARKETPLACE,
                abi: nftMarketAbi,
                functionName: "viewAsksByCollectionAndSeller",
                args: [collectionAddress, address, BigInt(0), BigInt(10)],
                chainId: chainId,
      })

      useEffect(() => {
        refetch()
      }, [slowRefresh])

      useEffect(() => {
        if(data && !isLoading){
          const dataInfo = data
          setatMax(dataInfo ? howMany > dataInfo[2] : false)
          setData({
            ids: dataInfo ? dataInfo[0] : [],
            sales: dataInfo ? dataInfo[1] : []
          })
        }
      },[data])

      
      
    return (
        <>
                <Flex justifyContent="center" alignItems="center" style={{ overflowY: 'auto', flexWrap: 'wrap'  }}>
                 
                    {info.ids.map((tokenId, index) => (
                      <NftCard
                        key={index}
                        collectionAddress={collectionAddress}
                        colName={colName}
                        nftId={tokenId}
                        chainId={chainId}
                        price={info.sales[index].price}
                        type={1}
                      />
                  ))}
             
                </Flex>
{!atMax &&
<Flex justifyContent="center" alignItems="center">
<Button variant="text" onClick={HandleMore} >
    {'Show More'}
</Button>
</Flex>
}
</>
    )
}

export default MySaleCard