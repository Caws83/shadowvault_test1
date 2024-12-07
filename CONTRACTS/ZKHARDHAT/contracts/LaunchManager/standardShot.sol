pragma solidity ^0.8.20;

// SPDX-License-Identifier: UNLICENSED


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract StandardToken is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply,
        address creator
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        _mint(creator, initialSupply);
        renounceOwnership();
    }
}
