// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ShadowVaultMargin
 * @dev MVP margin/leverage: open long/short with BNB collateral; close returns collateral.
 * No oracle PnL in MVP - for team testing flow on BSC testnet.
 */
contract ShadowVaultMargin {
    struct Position {
        address user;
        uint256 collateral;   // wei
        uint256 leverage;     // e.g. 10 = 10x
        bool isLong;
        uint256 openBlock;
        bool closed;
    }

    address public owner;
    Position[] public positions;
    mapping(address => uint256[]) public positionIdsByUser;

    event PositionOpened(uint256 indexed positionId, address indexed user, uint256 collateral, uint256 leverage, bool isLong);
    event PositionClosed(uint256 indexed positionId, address indexed user, uint256 collateralReturned);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function openLong(uint256 leverage) external payable {
        require(msg.value > 0, "Zero collateral");
        require(leverage >= 1 && leverage <= 100, "Bad leverage");
        uint256 id = positions.length;
        positions.push(Position({
            user: msg.sender,
            collateral: msg.value,
            leverage: leverage,
            isLong: true,
            openBlock: block.number,
            closed: false
        }));
        positionIdsByUser[msg.sender].push(id);
        emit PositionOpened(id, msg.sender, msg.value, leverage, true);
    }

    function openShort(uint256 leverage) external payable {
        require(msg.value > 0, "Zero collateral");
        require(leverage >= 1 && leverage <= 100, "Bad leverage");
        uint256 id = positions.length;
        positions.push(Position({
            user: msg.sender,
            collateral: msg.value,
            leverage: leverage,
            isLong: false,
            openBlock: block.number,
            closed: false
        }));
        positionIdsByUser[msg.sender].push(id);
        emit PositionOpened(id, msg.sender, msg.value, leverage, false);
    }

    function closePosition(uint256 positionId) external {
        require(positionId < positions.length, "Invalid position");
        Position storage p = positions[positionId];
        require(p.user == msg.sender, "Not your position");
        require(!p.closed, "Already closed");
        p.closed = true;
        uint256 amount = p.collateral;
        (bool ok,) = msg.sender.call{ value: amount }("");
        require(ok, "Transfer failed");
        emit PositionClosed(positionId, msg.sender, amount);
    }

    function getPosition(uint256 positionId) external view returns (
        address user,
        uint256 collateral,
        uint256 leverage,
        bool isLong,
        uint256 openBlock,
        bool closed
    ) {
        require(positionId < positions.length, "Invalid position");
        Position storage p = positions[positionId];
        return (p.user, p.collateral, p.leverage, p.isLong, p.openBlock, p.closed);
    }

    function getPositionCount() external view returns (uint256) {
        return positions.length;
    }

    function getPositionIdsByUser(address user) external view returns (uint256[] memory) {
        return positionIdsByUser[user];
    }

    function withdrawFees() external onlyOwner {
        (bool ok,) = owner.call{ value: address(this).balance }("");
        require(ok, "Withdraw failed");
    }

    receive() external payable {}
}
