import getListingv3 from './ifos/getIFOsV3'


const v3chains = [245022926]


const ifos = async () => {
  try {
    
    
    const v3list = await Promise.all(
      v3chains.map(async (chainId) => {
        try {
          const newList = await getListingv3(chainId);
          return newList;
        } catch (error) {
          console.error(`Error getting pools for V3 good on chain ${chainId}:`, error);
          return []; // or handle the error as needed
        }
      })
    );

    const flattenedList = v3list.flat();

    return flattenedList;
  } catch (error) {
    console.error('Error fetching IFOs:', error);
    return [];
  }
};

export default ifos;
