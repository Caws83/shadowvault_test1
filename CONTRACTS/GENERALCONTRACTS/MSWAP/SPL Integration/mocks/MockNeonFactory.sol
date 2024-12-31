// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockNeonFactory {
    mapping(bytes32 => address) public tokenList;
    
    function createERC20ForSplMintable(
        string memory,
        string memory,
        uint8,
        address
    ) external returns (address) {
        // Return a deterministic address for testing
        return address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp)))));
    }
    
    function createERC20ForSpl(bytes32 tokenMint) external returns (address) {
        require(tokenList[tokenMint] == address(0), "Already wrapped");
        address newToken = address(uint160(uint256(keccak256(abi.encodePacked(tokenMint, block.timestamp)))));
        tokenList[tokenMint] = newToken;
        return newToken;
    }
} 