


// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

interface Token{
     function balanceOf(address account) external view returns (uint256);
     function decimals() external view returns (uint8 decimals);
     function symbol() external view returns (string calldata symbol);
     function name() external view returns (string calldata name);
}

interface LPToken {
    function balanceOf(address account) external view returns (uint256);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function totalSupply() external view returns (uint256);
    function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast);
}

interface IFactory {
    function allPairsLength() external view returns (uint);
    function allPairs(uint) external view returns (address);
}


// edit this and MasterChef address for different masterchefs
interface MasterChef {                               // change with masterchef
    function cake() external view returns (address);                                        // change with masterchef
    function poolLength() external view returns (uint256);
    
    function poolInfo(uint256 pid) external view returns (address, uint256, uint256, uint256);
    function totalAllocPoint() external view returns (uint256);
    
    function userInfo(uint256, address) external view returns (uint256, uint256);
    function pendingCake(uint256 pid, address user) external view returns(uint256);         // change with masterchef
}

interface IFOFactory {
    function howManySales() external view returns (uint256);
    function getSale(uint256 number) external view returns (address);
}
interface Ifo {
    function offeringToken() external view returns (address);
    function finalized() external view returns (bool);
    function logoURI() external view returns (string memory);
    function bannerURI() external view returns (string memory);
    function websiteURI() external view returns (string memory);
    function userCount() external view returns (uint256);
    function claimCount() external view returns (uint256);
}
interface IPFactory {
    function howManyPools() external view returns (uint256);
    function getPool(uint256) external view returns (address);
    
}
interface IPool {
    function stakedToken() external view returns (address);
    function rewardToken() external view returns (address);
    function rewardTokenCount() external view returns (uint256);
    function roundInfo(uint256) external view returns (
        address rwdToken,
        uint256 accTokenPerShare,
        uint256 rewardPerBlock,
        uint256 prevAndCurrentRewardsBalance,
        uint256 PRECISION_FACTOR
    );
}



contract FarmCollection  {       

    function getApiInfo(address factory, uint256 start, uint256 end) external view returns(
        address[] memory pair,
        address[] memory tokenA,
        string[] memory aName,
        string[] memory aSym,
        uint256[] memory aDec,
        address[] memory tokenB,
        string[] memory bName,
        string[] memory bSym,
        uint256[] memory bDec
    ) {
        uint256 howMany = end - start;
         pair = new address[](howMany);
         tokenA = new address[](howMany);
         aName = new string[](howMany);
         aSym = new string[](howMany);
         aDec = new uint256[](howMany);
         tokenB = new address[](howMany);
         bName = new string[](howMany);
         bSym = new string[](howMany);
         bDec = new uint256[](howMany);

        for(uint i=0; i<howMany; i++){
            pair[i] = IFactory(factory).allPairs(start+i);
            LPToken lpToken = LPToken(pair[i]);
            tokenA[i] = lpToken.token0();
            tokenB[i] = lpToken.token1();
            Token tA = Token(tokenA[i]);
            Token tB = Token(tokenB[i]);
            aName[i] = tA.name();
            aSym[i] = tA.symbol();
            aDec[i] = tA.decimals(); 
            bName[i] = tB.name();
            bSym[i] = tB.symbol();
            bDec[i] = tB.decimals(); 
        }

    }

    

   
// V1 calls for original code
    function farmInfo(uint256 pid, address _MC, address lpToken, address qToken, address token) public view returns ( uint256 APOINT, uint256 TAPOINT, uint256 tBalLP, uint256 qtBalLP, uint256 lpBalMC, uint256 lpTotalSupply ) {
  
            (,APOINT,,) = MasterChef(_MC).poolInfo(pid);
            TAPOINT = MasterChef(_MC).totalAllocPoint();
        
          
        tBalLP = Token(token).balanceOf(lpToken);
        qtBalLP = Token(qToken).balanceOf(lpToken);
        lpBalMC = LPToken(lpToken).balanceOf(_MC);
        lpTotalSupply = LPToken(lpToken).totalSupply();
     }

     function getFarmInfo(address MC) external view returns(
        address[] memory pair,
        address[] memory tokenA,
        string[] memory aName,
        string[] memory aSym,
        uint256[] memory aDec,
        address[] memory tokenB,
        string[] memory bName,
        string[] memory bSym,
        uint256[] memory bDec
    ) {
        uint256 pairLength = MasterChef(MC).poolLength();
         pair = new address[](pairLength);
         tokenA = new address[](pairLength);
         aName = new string[](pairLength);
         aSym = new string[](pairLength);
         aDec = new uint256[](pairLength);
         tokenB = new address[](pairLength);
         bName = new string[](pairLength);
         bSym = new string[](pairLength);
         bDec = new uint256[](pairLength);

        for(uint i=0; i<pairLength; i++){
            (address thisPair,,,) = MasterChef(MC).poolInfo(i);
            pair[i] = thisPair;
            LPToken lpToken = LPToken(pair[i]);
        try lpToken.token0()
        {
            tokenA[i] = lpToken.token0();
            tokenB[i] = lpToken.token1();
            Token tA = Token(tokenA[i]);
            Token tB = Token(tokenB[i]);
            aName[i] = tA.name();
            aSym[i] = tA.symbol();
            aDec[i] = tA.decimals(); 
            bName[i] = tB.name();
            bSym[i] = tB.symbol();
            bDec[i] = tB.decimals(); 
        } catch {}
        }

    }

     function getSaleInfos(address factory) public view returns (
        address[] memory sale, 
        address[] memory token, 
        string[] memory tName, 
        string[] memory tSym, 
        uint256[] memory tDec,
        bool[] memory finalized
        ) {
        uint256 l = IFOFactory(factory).howManySales();

         sale = new address[](l);
         token = new address[](l);
         tName = new string[](l);
         tSym = new string[](l);
         tDec = new uint256[](l);
         finalized =new bool[](l);

        

        for(uint i=0; i<l; i++){
            sale[i] = IFOFactory(factory).getSale(i);
            token[i] = Ifo(sale[i]).offeringToken();
            Token tokenC = Token(token[i]);
            tName[i] = tokenC.name();
            tSym[i] = tokenC.symbol();
            tDec[i] = tokenC.decimals();
            finalized[i] = Ifo(sale[i]).finalized();
        }
    }

    function getSaleInfos2(address factory) public view returns (
        address[] memory sale, 
        address[] memory token, 
        string[] memory tName, 
        string[] memory tSym, 
        uint256[] memory tDec,
        bool[] memory finalized,
        string[] memory logoURI,
        string[] memory websiteURI,
        string[] memory bannerURI,
        uint256[] memory userCount,
        uint256[] memory claimCount
        ) {
        uint256 l = IFOFactory(factory).howManySales();

         sale = new address[](l);
         token = new address[](l);
         tName = new string[](l);
         tSym = new string[](l);
         tDec = new uint256[](l);
         finalized =new bool[](l);
         logoURI = new string[](l);
         websiteURI = new string[](l);
         bannerURI = new string[](l);
         userCount = new uint256[](l);
         claimCount = new uint256[](l);

        for(uint i=0; i<l; i++){
            sale[i] = IFOFactory(factory).getSale(i);
            token[i] = Ifo(sale[i]).offeringToken();
            Token tokenC = Token(token[i]);
            tName[i] = tokenC.name();
            tSym[i] = tokenC.symbol();
            tDec[i] = tokenC.decimals();
            finalized[i] = Ifo(sale[i]).finalized();
            logoURI[i] = Ifo(sale[i]).logoURI();
            websiteURI[i] = Ifo(sale[i]).websiteURI();
            bannerURI[i] = Ifo(sale[i]).bannerURI();
            userCount[i] = Ifo(sale[i]).userCount();
            claimCount[i] = Ifo(sale[i]).claimCount();
        }
    }

   


    function getPoolInfo(address poolFactory) external view returns (
        address[] memory contractAddress,
        address[] memory stakeAddress,
        string[] memory stakeName,
        string[] memory stakeSym,
        uint256[] memory stakeDec,
        address[] memory earnAddress,
        string[] memory earnName,
        string[] memory earnSym,
        uint256[] memory earnDec
    ) {
        IPFactory pfactory = IPFactory(poolFactory);
        uint256 howMany = pfactory.howManyPools();

        contractAddress = new address[](howMany);
        stakeAddress = new address[](howMany);
        stakeName = new string[](howMany);
        stakeSym = new string[](howMany);
        stakeDec = new uint256[](howMany);
        earnAddress = new address[](howMany);
        earnName = new string[](howMany);
        earnSym = new string[](howMany);
        earnDec = new uint256[](howMany);

        for(uint i=0; i<howMany; i++) {
            contractAddress[i] = pfactory.getPool(i);
            stakeAddress[i] = IPool(contractAddress[i]).stakedToken();
                Token sToken = Token(stakeAddress[i]);
                stakeName[i] = sToken.name();
                stakeSym[i] = sToken.symbol();
                stakeDec[i] = sToken.decimals();
             earnAddress[i] = IPool(contractAddress[i]).rewardToken();
                Token eToken = Token(earnAddress[i]);
                earnName[i] = eToken.name();
                earnSym[i] = eToken.symbol();
                earnDec[i] = eToken.decimals();

        }
    }

    

     struct EarningTokens {
        address[] earnAddress;
    }

     function getNftPoolInfo(address poolFactory) external view returns (
        address[] memory contractAddress,
        address[] memory stakeAddress,
        string[] memory stakeName,
        string[] memory stakeSym,
        EarningTokens[] memory earnAddresses  
    ) {

        IPFactory pfactory = IPFactory(poolFactory);
        uint256 howMany = pfactory.howManyPools();

        contractAddress = new address[](howMany);
        stakeAddress = new address[](howMany);
        stakeName = new string[](howMany);
        stakeSym = new string[](howMany);
        earnAddresses = new EarningTokens[](howMany);
       

        for(uint i=0; i<howMany; i++) {
            contractAddress[i] = pfactory.getPool(i);
            stakeAddress[i] = IPool(contractAddress[i]).stakedToken();
                Token sToken = Token(stakeAddress[i]);
                stakeName[i] = sToken.name();
                stakeSym[i] = sToken.symbol();
                uint256 rTokenCount = IPool(contractAddress[i]).rewardTokenCount();
                address[] memory earnAddress = new address[](rTokenCount);
                for( uint l=0; l<rTokenCount; l++){
                     (address ad,,,,) = IPool(contractAddress[i]).roundInfo(l);
                     earnAddress[l] = ad;
                }
                EarningTokens memory earningTokens = EarningTokens({
                    earnAddress: earnAddress
                });
                earnAddresses[i] = earningTokens;

        }
    }
     
}
