// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Interfaces/INeonERC20Factory.sol";
import "./TokenFactoryV2.sol";

contract PreLaunchManagerV3 is Ownable, ReentrancyGuard {
    // SPL token constraints
    uint256 private constant SPL_MAX_UINT = (1 << 64) - 1;
    uint8 private constant SPL_MAX_DECIMALS = 9;

    struct LaunchInfo {
        address token;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool isSPL;
        bytes32 splMint;
        bool isActive;
        uint256 totalParticipants;
        uint256 totalSponsorship;
        address creator;
    }

    struct ParticipantInfo {
        uint256 sponsorshipAmount;
        bool hasParticipated;
        uint256 tokensClaimed;
    }

    mapping(uint256 => LaunchInfo) public launches;
    mapping(uint256 => mapping(address => ParticipantInfo)) public launchParticipants;
    uint256 public launchCount;

    TokenFactoryV2 public immutable tokenFactory;
    address public immutable treasury;
    address public immutable router;
    address public immutable prizeTreasury;

    uint256 public launchCreationFee;
    uint256 public percentFee;
    uint256 public prizePercent;
    uint256 public burnPercent;
    uint256 public sponsorshipFee;

    // Events
    event LaunchCreated(
        uint256 indexed launchId,
        address indexed token,
        uint256 amount,
        bool isSPL,
        bytes32 splMint,
        uint256 startTime,
        uint256 endTime
    );
    event ParticipantJoined(
        uint256 indexed launchId,
        address indexed participant,
        uint256 sponsorshipAmount
    );
    event TokensClaimed(
        uint256 indexed launchId,
        address indexed participant,
        uint256 amount
    );
    event LaunchCancelled(uint256 indexed launchId);
    event EmergencyWithdraw(address token, uint256 amount);

    constructor(
        uint256 _launchCreationFee,
        uint256 _percentFee,
        uint256 _prizePercent,
        uint256 _burnPercent,
        address _tokenFactory,
        address _treasury,
        address _prizeTreasury,
        address _router,
        uint256 _sponsorshipFee
    ) {
        require(_prizePercent + _burnPercent <= 10000, "Invalid percentages");
        launchCreationFee = _launchCreationFee;
        percentFee = _percentFee;
        prizePercent = _prizePercent;
        burnPercent = _burnPercent;
        tokenFactory = TokenFactoryV2(_tokenFactory);
        treasury = _treasury;
        prizeTreasury = _prizeTreasury;
        router = _router;
        sponsorshipFee = _sponsorshipFee;
    }

    function createLaunch(
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 duration
    ) external payable nonReentrant {
        require(msg.value >= launchCreationFee, "Insufficient launch fee");
        require(startTime > block.timestamp, "Invalid start time");
        require(duration > 0, "Invalid duration");

        // Check if token is SPL and validate amounts
        bool isSPL = tokenFactory.isSPLToken(token);
        if (isSPL) {
            require(amount <= SPL_MAX_UINT, "Amount exceeds SPL maximum");
        }

        uint256 launchId = launchCount++;
        launches[launchId] = LaunchInfo({
            token: token,
            amount: amount,
            startTime: startTime,
            endTime: startTime + duration,
            isSPL: isSPL,
            splMint: isSPL ? tokenFactory.getSPLMint(token) : bytes32(0),
            isActive: true,
            totalParticipants: 0,
            totalSponsorship: 0,
            creator: msg.sender
        });

        // Transfer tokens to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Transfer creation fee to treasury
        (bool success,) = treasury.call{value: msg.value}("");
        require(success, "Fee transfer failed");

        emit LaunchCreated(
            launchId,
            token,
            amount,
            isSPL,
            launches[launchId].splMint,
            startTime,
            startTime + duration
        );
    }

    function participateInLaunch(uint256 launchId) external payable nonReentrant {
        require(msg.value >= sponsorshipFee, "Insufficient sponsorship");
        LaunchInfo storage launch = launches[launchId];
        require(launch.isActive, "Launch not active");
        require(block.timestamp >= launch.startTime, "Launch not started");
        require(block.timestamp <= launch.endTime, "Launch ended");
        require(!launchParticipants[launchId][msg.sender].hasParticipated, "Already participated");

        launch.totalParticipants++;
        launch.totalSponsorship += msg.value;

        launchParticipants[launchId][msg.sender] = ParticipantInfo({
            sponsorshipAmount: msg.value,
            hasParticipated: true,
            tokensClaimed: 0
        });

        // Transfer sponsorship fee
        uint256 prizeAmount = (msg.value * prizePercent) / 10000;
        uint256 burnAmount = (msg.value * burnPercent) / 10000;
        uint256 treasuryAmount = msg.value - prizeAmount - burnAmount;

        (bool prizeSent,) = prizeTreasury.call{value: prizeAmount}("");
        require(prizeSent, "Prize transfer failed");
        
        (bool treasurySent,) = treasury.call{value: treasuryAmount}("");
        require(treasurySent, "Treasury transfer failed");

        // Burn amount stays in contract

        emit ParticipantJoined(launchId, msg.sender, msg.value);
    }

    function claimTokens(uint256 launchId) external nonReentrant {
        LaunchInfo storage launch = launches[launchId];
        require(launch.isActive, "Launch not active");
        require(block.timestamp > launch.endTime, "Launch not ended");
        
        ParticipantInfo storage participant = launchParticipants[launchId][msg.sender];
        require(participant.hasParticipated, "Not participated");
        require(participant.tokensClaimed == 0, "Already claimed");

        uint256 tokenAmount = (launch.amount * participant.sponsorshipAmount) / launch.totalSponsorship;
        
        if (launch.isSPL) {
            require(tokenAmount <= SPL_MAX_UINT, "Claim amount exceeds SPL maximum");
        }

        participant.tokensClaimed = tokenAmount;
        IERC20(launch.token).transfer(msg.sender, tokenAmount);

        emit TokensClaimed(launchId, msg.sender, tokenAmount);
    }

    function cancelLaunch(uint256 launchId) external {
        LaunchInfo storage launch = launches[launchId];
        require(msg.sender == launch.creator || msg.sender == owner(), "Unauthorized");
        require(launch.isActive, "Already cancelled");
        require(block.timestamp < launch.startTime, "Launch already started");

        launch.isActive = false;
        IERC20(launch.token).transfer(launch.creator, launch.amount);

        emit LaunchCancelled(launchId);
    }

    // View functions
    function getLaunchInfo(uint256 launchId) external view returns (
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 endTime,
        bool isSPL,
        bytes32 splMint,
        bool isActive,
        uint256 totalParticipants,
        uint256 totalSponsorship,
        address creator
    ) {
        LaunchInfo storage launch = launches[launchId];
        return (
            launch.token,
            launch.amount,
            launch.startTime,
            launch.endTime,
            launch.isSPL,
            launch.splMint,
            launch.isActive,
            launch.totalParticipants,
            launch.totalSponsorship,
            launch.creator
        );
    }

    function getParticipantInfo(uint256 launchId, address participant) external view returns (
        uint256 sponsorshipAmount,
        bool hasParticipated,
        uint256 tokensClaimed
    ) {
        ParticipantInfo storage info = launchParticipants[launchId][participant];
        return (
            info.sponsorshipAmount,
            info.hasParticipated,
            info.tokensClaimed
        );
    }

    // Admin functions
    function updateFees(
        uint256 _launchCreationFee,
        uint256 _percentFee,
        uint256 _prizePercent,
        uint256 _burnPercent,
        uint256 _sponsorshipFee
    ) external onlyOwner {
        require(_prizePercent + _burnPercent <= 10000, "Invalid percentages");
        launchCreationFee = _launchCreationFee;
        percentFee = _percentFee;
        prizePercent = _prizePercent;
        burnPercent = _burnPercent;
        sponsorshipFee = _sponsorshipFee;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (tokenFactory.isSPLToken(token)) {
            require(amount <= SPL_MAX_UINT, "Amount exceeds SPL maximum");
        }
        IERC20(token).transfer(owner(), amount);
        emit EmergencyWithdraw(token, amount);
    }

    // Utility functions
    function validateSPLAmount(uint256 amount) internal pure {
        require(amount <= SPL_MAX_UINT, "Amount exceeds SPL maximum");
    }

    receive() external payable {}
} 