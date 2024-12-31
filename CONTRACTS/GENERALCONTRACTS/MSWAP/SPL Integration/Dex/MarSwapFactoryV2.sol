// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../Interfaces/INeonERC20Factory.sol";

contract MarSwapFactoryV2 is Ownable {
    address public treasury;
    uint256 public flatFee;
    uint256 public percentToDividends = 25;
    uint256 public lpFee = 10;
    uint256 public marsFee = 10;
    mapping (address => bool) public isMasterChef;

    uint256 public minPercentOfSupplyForDiv = 1000; // 1000 = 0.01 %
    address public _IDFactory;
    uint256 public claimWait = 3600;

    // SPL specific additions
    uint256 private constant SPL_MAX_UINT = (1 << 64) - 1;
    address public constant NEON_FACTORY_DEVNET = 0xF6b17787154C418d5773Ea22Afc87A95CAA3e957;
    address public constant NEON_FACTORY_MAINNET = 0x6B226a13F5FE3A5cC488084C08bB905533804720;
    address public currentNeonFactory;
    
    mapping(address => bool) public isSPLToken;
    mapping(address => bytes32) public splMints;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    event SPLPairCreated(address indexed token0, address indexed token1, address pair, bytes32 splMint);
   
    constructor(address _DividendFactory, address _treasury, uint256 _initialFlatFee) {
        treasury = _treasury;
        _IDFactory = _DividendFactory;
        flatFee = _initialFlatFee;
        currentNeonFactory = NEON_FACTORY_DEVNET; // Default to devnet
    }

    // do NOT add a masterchef with any of our LP deposited
    function addMasterChef(address _mc) public onlyOwner {
        require(!isMasterChef[_mc], "already added");
        isMasterChef[_mc] = true;
    }
    
    function removeMasterChef(address _mc) public onlyOwner {
        require(isMasterChef[_mc], "already added");
        isMasterChef[_mc] = false;
    }
    
    function changeDividendFactory(address DividendFactory) external onlyOwner {
        _IDFactory = DividendFactory;
    }

    function setPercentToDividends(uint256 _newPercent) external onlyOwner {
        require(_newPercent <= 75 && _newPercent >= 20, "between 20 & 75");
        percentToDividends = _newPercent;
    }
   
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    // Modified createPair to handle SPL tokens
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'MSWAP_LP: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'MSWAP_LP: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'MSWAP_LP: PAIR_EXISTS');

        // Check if either token is SPL
        bool isSPL0 = INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(token0)))) != address(0);
        bool isSPL1 = INeonERC20Factory(currentNeonFactory).tokenList(bytes32(uint256(uint160(token1)))) != address(0);

        bytes memory bytecode = type(MarSwap_Pair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        MarSwap_Pair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        // Track SPL tokens
        if (isSPL0) {
            isSPLToken[token0] = true;
            splMints[token0] = bytes32(uint256(uint160(token0)));
        }
        if (isSPL1) {
            isSPLToken[token1] = true;
            splMints[token1] = bytes32(uint256(uint160(token1)));
        }

        if (isSPL0 || isSPL1) {
            emit SPLPairCreated(token0, token1, pair, isSPL0 ? splMints[token0] : splMints[token1]);
        } else {
            emit PairCreated(token0, token1, pair, allPairs.length);
        }
    }

    function setTreasury(address _treasury) public onlyOwner {
        require(_treasury != treasury, "Identical");
        treasury = _treasury;   
    }

    function setFlatFee(uint256 _newFlatFee) external onlyOwner {
        flatFee = _newFlatFee;
    }

    function setLPFee(uint256 _lpFee) external onlyOwner {
        require(_lpFee < 30,"Fee too high");
        lpFee = _lpFee;
    }

    function setmarsFee(uint256 _marsFee) external onlyOwner {
        require(_marsFee < 30,"Fee too high");
        marsFee = _marsFee;
    }

    function lpInfo() external view returns (address _treasury, uint256 _lpFee, uint256 _marsFee, uint256 _flatFee) {
        return (treasury, lpFee, marsFee, flatFee);
    }

    // SPL specific functions
    function isSPL(address token) external view returns (bool) {
        return isSPLToken[token];
    }

    function getSPLMint(address token) external view returns (bytes32) {
        require(isSPLToken[token], "Not an SPL token");
        return splMints[token];
    }

    // Admin functions for SPL configuration
    function setNeonFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "Invalid factory address");
        currentNeonFactory = newFactory;
    }

    function switchToMainnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_MAINNET;
    }

    function switchToDevnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_DEVNET;
    }
} 