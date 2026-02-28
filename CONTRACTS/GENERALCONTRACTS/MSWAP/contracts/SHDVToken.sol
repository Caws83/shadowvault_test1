// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title SHDV Token
 * @dev ShadowVault Protocol native token ($SHDV)
 * 
 * Tokenomics:
 * - Total Supply: 1,000,000,000 SHDV (1B)
 * - 20% Presale
 * - 30% Liquidity
 * - 20% Team (vested)
 * - 15% Marketing
 * - 15% Ecosystem Rewards
 * 
 * Utility:
 * - Staking for AI access
 * - Fee discounts (0.05-0.3% swaps)
 * - Governance votes
 * - Premium AI features
 */
contract SHDVToken is ERC20, ERC20Burnable, Ownable, ERC20Pausable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1B tokens
    
    // Tokenomics allocations
    uint256 public constant PRESALE_ALLOCATION = TOTAL_SUPPLY * 20 / 100; // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = TOTAL_SUPPLY * 30 / 100; // 30%
    uint256 public constant TEAM_ALLOCATION = TOTAL_SUPPLY * 20 / 100; // 20%
    uint256 public constant MARKETING_ALLOCATION = TOTAL_SUPPLY * 15 / 100; // 15%
    uint256 public constant ECOSYSTEM_ALLOCATION = TOTAL_SUPPLY * 15 / 100; // 15%
    
    // Vesting for team allocation
    uint256 public constant VESTING_DURATION = 4 * 365 days; // 4 years
    uint256 public constant VESTING_CLIFF = 365 days; // 1 year cliff
    uint256 public vestingStartTime;
    address public teamWallet;
    
    // Fee discount tiers (holders get reduced swap fees)
    mapping(address => bool) public feeDiscountEligible;
    mapping(address => uint256) public stakedAmount;
    
    event FeeDiscountGranted(address indexed account);
    event Staked(address indexed account, uint256 amount);
    event Unstaked(address indexed account, uint256 amount);
    
    constructor(
        address _presaleWallet,
        address _liquidityWallet,
        address _teamWallet,
        address _marketingWallet,
        address _ecosystemWallet
    ) ERC20("ShadowVault Protocol", "SHDV") {
        require(_presaleWallet != address(0), "Invalid presale wallet");
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        require(_ecosystemWallet != address(0), "Invalid ecosystem wallet");
        
        teamWallet = _teamWallet;
        vestingStartTime = block.timestamp;
        
        // Mint allocations
        _mint(_presaleWallet, PRESALE_ALLOCATION);
        _mint(_liquidityWallet, LIQUIDITY_ALLOCATION);
        _mint(_teamWallet, TEAM_ALLOCATION);
        _mint(_marketingWallet, MARKETING_ALLOCATION);
        _mint(_ecosystemWallet, ECOSYSTEM_ALLOCATION);
        
        require(totalSupply() == TOTAL_SUPPLY, "Total supply mismatch");
    }
    
    /**
     * @dev Grant fee discount eligibility to an address
     * Users with fee discounts pay reduced swap fees (0.05% instead of 0.3%)
     */
    function grantFeeDiscount(address account) external onlyOwner {
        feeDiscountEligible[account] = true;
        emit FeeDiscountGranted(account);
    }
    
    /**
     * @dev Stake tokens to unlock premium AI features
     * Minimum staking amount required for AI agent access
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        
        stakedAmount[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Check if user has minimum staking for AI access
     */
    function hasAIAccess(address account) external view returns (bool) {
        return stakedAmount[account] >= 1000 * 10**18; // Minimum 1000 SHDV for AI access
    }
    
    /**
     * @dev Get fee discount percentage for an address
     * Returns discount percentage (e.g., 83 for 83% discount = 0.05% fee instead of 0.3%)
     */
    function getFeeDiscount(address account) external view returns (uint256) {
        if (feeDiscountEligible[account] || stakedAmount[account] >= 10000 * 10**18) {
            return 83; // 83% discount: 0.3% -> 0.05%
        }
        if (stakedAmount[account] >= 5000 * 10**18) {
            return 50; // 50% discount: 0.3% -> 0.15%
        }
        return 0;
    }
    
    /**
     * @dev Release vested team tokens
     * Team tokens vest over 4 years with 1 year cliff
     */
    function releaseVestedTokens() external {
        require(block.timestamp >= vestingStartTime + VESTING_CLIFF, "Vesting cliff not reached");
        
        uint256 elapsed = block.timestamp - vestingStartTime;
        uint256 totalVested = (TEAM_ALLOCATION * elapsed) / VESTING_DURATION;
        uint256 released = totalVested - balanceOf(teamWallet);
        
        if (released > 0) {
            _transfer(address(this), teamWallet, released);
        }
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}

