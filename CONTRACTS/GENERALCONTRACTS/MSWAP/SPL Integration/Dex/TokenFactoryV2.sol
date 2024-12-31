// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Interfaces/INeonERC20Factory.sol";

contract TokenFactoryV2 is Ownable, ReentrancyGuard {
    address public immutable treasury;
    uint256 public tokenCreateFee;
    
    // Neon ERC20 Factory addresses
    address public constant NEON_FACTORY_DEVNET = 0xF6b17787154C418d5773Ea22Afc87A95CAA3e957;
    address public constant NEON_FACTORY_MAINNET = 0x6B226a13F5FE3A5cC488084C08bB905533804720;
    address public currentNeonFactory;

    // SPL token constraints
    uint256 private constant SPL_MAX_UINT = (1 << 64) - 1;
    uint8 private constant SPL_MAX_DECIMALS = 9;
    
    // Events
    event TokenCreated(address indexed token, string name, string symbol, uint8 decimals, bool isSPL);
    event SPLTokenWrapped(address indexed token, bytes32 splMint);
    event NeonFactoryUpdated(address indexed newFactory);

    struct TokenInfo {
        bool isSPL;
        bytes32 splMint;  // Only for SPL tokens
        address creator;
        uint256 creationTime;
        bool isLocked;
        uint256 lockDuration;
    }
    
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => bool) public isCreatedHere;

    constructor(address _treasury, uint256 _tokenCreateFee) {
        treasury = _treasury;
        tokenCreateFee = _tokenCreateFee;
        currentNeonFactory = NEON_FACTORY_DEVNET; // Default to devnet
    }

    // Create a new SPL token
    function createSPLToken(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) external payable nonReentrant returns (address) {
        require(msg.value >= tokenCreateFee, "Insufficient creation fee");
        require(decimals <= SPL_MAX_DECIMALS, "SPL tokens max 9 decimals");

        // Create new SPL token through Neon Factory
        address newToken = INeonERC20Factory(currentNeonFactory).createERC20ForSplMintable(
            name,
            symbol,
            decimals,
            msg.sender  // Mint authority
        );

        // Store token info
        tokenInfo[newToken] = TokenInfo({
            isSPL: true,
            splMint: bytes32(0), // Will be set after creation
            creator: msg.sender,
            creationTime: block.timestamp,
            isLocked: false,
            lockDuration: 0
        });

        isCreatedHere[newToken] = true;

        // Send fee to treasury
        (bool success,) = treasury.call{value: msg.value}("");
        require(success, "Fee transfer failed");

        emit TokenCreated(newToken, name, symbol, decimals, true);
        return newToken;
    }

    // Wrap an existing SPL token
    function wrapExistingSPLToken(bytes32 tokenMint) external nonReentrant returns (address) {
        // Check if token is already wrapped
        address existing = INeonERC20Factory(currentNeonFactory).tokenList(tokenMint);
        require(existing == address(0), "Token already wrapped");

        // Create ERC20 wrapper for SPL token
        address wrappedToken = INeonERC20Factory(currentNeonFactory).createERC20ForSpl(tokenMint);

        // Store token info
        tokenInfo[wrappedToken] = TokenInfo({
            isSPL: true,
            splMint: tokenMint,
            creator: msg.sender,
            creationTime: block.timestamp,
            isLocked: false,
            lockDuration: 0
        });

        isCreatedHere[wrappedToken] = true;

        emit SPLTokenWrapped(wrappedToken, tokenMint);
        return wrappedToken;
    }

    // Lock liquidity for a token
    function lockLiquidity(address token, uint256 duration) external {
        require(isCreatedHere[token], "Token not created here");
        require(msg.sender == tokenInfo[token].creator, "Not token creator");
        require(!tokenInfo[token].isLocked, "Already locked");
        
        tokenInfo[token].isLocked = true;
        tokenInfo[token].lockDuration = block.timestamp + duration;
    }

    // Check if a token is an SPL token
    function isSPLToken(address token) external view returns (bool) {
        return tokenInfo[token].isSPL;
    }

    // Get SPL mint address for a wrapped token
    function getSPLMint(address token) external view returns (bytes32) {
        require(tokenInfo[token].isSPL, "Not an SPL token");
        return tokenInfo[token].splMint;
    }

    // Get token creation info
    function getTokenInfo(address token) external view returns (
        bool isSPL,
        bytes32 splMint,
        address creator,
        uint256 creationTime,
        bool isLocked,
        uint256 lockDuration
    ) {
        TokenInfo memory info = tokenInfo[token];
        return (
            info.isSPL,
            info.splMint,
            info.creator,
            info.creationTime,
            info.isLocked,
            info.lockDuration
        );
    }

    // Admin functions
    function setNeonFactory(address newFactory) external onlyOwner {
        require(newFactory != address(0), "Invalid factory address");
        currentNeonFactory = newFactory;
        emit NeonFactoryUpdated(newFactory);
    }

    function updateTokenCreateFee(uint256 newFee) external onlyOwner {
        tokenCreateFee = newFee;
    }

    function switchToMainnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_MAINNET;
        emit NeonFactoryUpdated(NEON_FACTORY_MAINNET);
    }

    function switchToDevnet() external onlyOwner {
        currentNeonFactory = NEON_FACTORY_DEVNET;
        emit NeonFactoryUpdated(NEON_FACTORY_DEVNET);
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        (bool success,) = treasury.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
} 