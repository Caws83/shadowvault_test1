// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SVP Token (ShadowVault Protocol)
 * @dev Simple ERC20 for testing: 1 billion supply (18 decimals), all minted to owner.
 * Owner: 0xAd772981ede52C0365265d7e24E2F426210D809b
 */
contract SVPToken {
    string public constant name = "ShadowVault Protocol";
    string public constant symbol = "SVP";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    uint256 public constant SUPPLY = 1_000_000_000 * 10**18; // 1 billion

    constructor(address _owner) {
        require(_owner != address(0), "SVP: zero owner");
        owner = _owner;
        totalSupply = SUPPLY;
        balanceOf[_owner] = SUPPLY;
        emit Transfer(address(0), _owner, SUPPLY);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SVP: not owner");
        _;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "SVP: allowance");
        if (currentAllowance != type(uint256).max) {
            allowance[from][msg.sender] = currentAllowance - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "SVP: from zero");
        require(to != address(0), "SVP: to zero");
        require(balanceOf[from] >= amount, "SVP: balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SVP: zero new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
