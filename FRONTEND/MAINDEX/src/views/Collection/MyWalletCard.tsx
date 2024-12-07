import { Address } from "viem"
import { Flex } from "../../uikit"
import NftCard from "./NftCard"
import {  useReadContract } from "wagmi"
import { useEffect, useState } from "react"
import { nftCollectionAbi } from "../../config/abi/nftCollection"
import useMarket from "../../hooks/useNftMarket"
import useRefresh from "hooks/useRefresh"
                            
const MyWalletCard: React.FC<React.PropsWithChildren<{
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

    const [ balance, setData ] = useState(0n)
    const { getUserIds } = useMarket(collectionAddress, chainId)
    const { slowRefresh } = useRefresh()
      
    const {data, isLoading, refetch} = useReadContract({
                address: collectionAddress,
                abi: nftCollectionAbi,
                functionName: "balanceOf",
                args: [address ?? "0x0"],
                chainId: chainId,
    
      })
      
      useEffect(() => {
        refetch()
      }, [slowRefresh])

      useEffect(() => {
        if(data && !isLoading) setData(data as bigint ?? 0n)
      },[data])

      const [ userIds, setUserIds ] = useState<readonly bigint[]>([])

      useEffect(() => {
        async function fetch() {
          const uIds = await getUserIds(balance)
          setUserIds(uIds)
          }
        fetch()
       },[balance])

      
    return (
      <>
                
                <Flex justifyContent="center" alignItems="center" style={{ overflowY: 'auto', flexWrap: 'wrap'  }}>
                 
                    {userIds.map((tokenId, index) => (
                      <NftCard
                        key={index}
                        collectionAddress={collectionAddress}
                        colName={colName}
                        nftId={tokenId}
                        chainId={chainId}
                        price={0n}
                        type={2}
                      />
                  ))}
             
                </Flex>
      </>
    )
}

export default MyWalletCard

