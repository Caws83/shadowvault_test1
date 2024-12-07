import farmageddonNFTPools from './nftpools/farmageddon';
import community from './nftpools/community';
import binance from './nftpools/binance';
import bscTest from './nftpools/bscTest';
import shibv3 from './nftpools/shibv3';
import bscv3 from './nftpools/bscv3';
import crov3 from './nftpools/crov3';
import ethereumv3 from './nftpools/ethereumv3';
import basev3 from './nftpools/basev3';

const nftPools = async () => {
  try {
    const results = []
    
    const poolFunctions = []
    /*
      community,
      binance,
      bscv3,
      crov3,
      shibv3,
      basev3,
      ethereumv3,
      bscTest,
    ]; */

    // Loop through each function and fetch pools individually
    for (const poolFunction of poolFunctions) {
      try {
        const pools = await poolFunction();
        results.push(pools);
      } catch (error) {
        console.error('Error fetching pools for a specific pool function:', error);
        // Handle the error for the specific pool function, if needed
      }
    }

    
     // Concatenate all the results into a single array
     const concatenatedPools = results.flat();
     return farmageddonNFTPools.concat(concatenatedPools);
   } catch (error) {
     console.error('Error getting pools:', error);
     return farmageddonNFTPools;
   }
};

export default nftPools;
