// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INeonERC20Factory {
    // For creating new mintable SPL tokens
    function createERC20ForSplMintable(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _mint_authority
    ) external returns (address);

    // For wrapping existing SPL tokens
    function createERC20ForSpl(bytes32 _tokenMint) external returns (address);
    
    // For checking if an SPL token is already wrapped
    function tokenList(bytes32 _tokenMint) external view returns (address);
} 