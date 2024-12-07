import farmageddonNFTLaunch from './nftlaunch/farmageddon'
import { NFTLaunchConfig } from './types'
import getListings from './nftlaunch/getListings'

const manuals: NFTLaunchConfig[] = farmageddonNFTLaunch

const chains = [];

const nftlaunchs = async () => {
try {
    
    const list = await Promise.all(
      chains.map(async (chainId) => {
        try {
          const newList = await getListings(chainId);
          return newList;
        } catch (error) {
          console.error(`Error getting NFTLaunches for chain ${chainId}:`, error);
          return []; // or handle the error as needed
        }
      })
    );
    
   
    const flattenedList = list.flat();
    return manuals.concat(flattenedList);
  } catch (error) {
    console.error('Error fetching Sales:', error);
    return manuals;
  }
};

export default nftlaunchs
