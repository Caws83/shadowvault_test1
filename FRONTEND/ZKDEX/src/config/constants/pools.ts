import farmageddonPools from './pools/farmageddon';
// import singlePools from './pools/singles';
import community from './pools/community';
import testPools from './pools/bscTestnet';
import shibv3 from './pools/shibV3';
import crov3 from './pools/cronosV3';
import bscv3 from './pools/binanceV3';
import ethereumv3 from './pools/ethereumv3';
import basev3 from './pools/basev3';

const pools = async () => {
  try {
    const results = [];

    // List of functions that fetch pools
    const poolFunctions = []
    /*
      community,
      testPools,
      bscv3,
      crov3,
      shibv3,
      basev3,
      ethereumv3,
    ]; */
/*
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
*/
    // Concatenate all the results into a single array
    const concatenatedPools = results.flat();
    return farmageddonPools.concat(concatenatedPools);
  } catch (error) {
    console.error('Error getting pools:', error);
    return farmageddonPools;
  }
};


export default pools;

