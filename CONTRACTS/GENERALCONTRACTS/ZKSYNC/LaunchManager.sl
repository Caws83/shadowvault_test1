// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract StandardToken is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply,
        address creator
    ) ERC20(_name, _symbol) {
        _mint(creator, initialSupply * (10**18));
        renounceOwnership();
    }
}

contract PreLaunchManager is Ownable, ReentrancyGuard {
    struct Round {
        uint256 roundId;
        address tokenContract;
        string name;
        string symbol;
        uint256 totalRaised;
        uint256 endEpoch;
        bool isFinished;
        string website;
        string telegram;
        string logo;
        string description;
    }

    struct RoundUserContribution {
        address user;
        uint256 amount;
    }

    address public deadAddress = 0x000000000000000000000000000000000000dEaD;
    uint256 public creationFee;
    uint256 public platformFeePercentage;
    address public treasury;
    IUniswapV2Router02 public router;

    Round[] public rounds;
    mapping(uint256 => RoundUserContribution[]) public roundContributions;

    event RoundStarted(address tokenContract, string name, string symbol, uint256 endEpoch);
    event Contributed(uint256 roundId, address indexed user, uint256 amount);
    event TokensDistributed(uint256 roundId, uint256 totalDistributed);
    event LiquidityAdded(uint256 roundId, uint256 tokenAmount, uint256 nativeCoinAmount);

    constructor(
        uint256 _creationFee,
        uint256 _platformFeePercentage,
        address _treasury,
        address _router
    ) {
        creationFee = _creationFee;
        platformFeePercentage = _platformFeePercentage;
        treasury = _treasury;
        router = IUniswapV2Router02(_router);
    }

    modifier checkAndFinalizeRounds() {
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp >= rounds[i].endEpoch && !rounds[i].isFinished) {
            finalizeRound(i);
            break;
        }
    }
    _;
}


    function startRound(
        string memory _name,
        string memory _symbol,
        uint256 initialSupply,
        uint256 duration,
        string memory _website,
        string memory _telegram,
        string memory _logo,
        string memory _description
    ) external payable checkAndFinalizeRounds {
        require(msg.value >= creationFee, "Insufficient creation fee");
        StandardToken token = new StandardToken(_name, _symbol, initialSupply, address(this));
        uint256 endEpoch = block.timestamp + duration;
        rounds.push(Round({
            roundId: rounds.length,
            tokenContract: address(token),
            name: _name,
            symbol: _symbol,
            totalRaised: 0,
            endEpoch: endEpoch,
            isFinished: false,
            website: _website,
            telegram: _telegram,
            logo: _logo,
            description: _description
        }));
        emit RoundStarted(address(token), _name, _symbol, endEpoch);
    }

    function contribute(uint256 roundId) external payable nonReentrant checkAndFinalizeRounds {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(block.timestamp < round.endEpoch, "Round has ended");
        require(msg.value > 0, "Contribution must be greater than zero");

        // Check if user has already contributed in this round
        bool found = false;
        for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
            if (roundContributions[roundId][i].user == msg.sender) {
                roundContributions[roundId][i].amount += msg.value;
                found = true;
                break;
            }
        }
        // If not found, add new contribution entry
        if (!found) {
            roundContributions[roundId].push(RoundUserContribution({
                user: msg.sender,
                amount: msg.value
            }));
        }

        round.totalRaised += msg.value;

        emit Contributed(roundId, msg.sender, msg.value);
    }

    function finalizeRound(uint256 roundId) public nonReentrant {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(block.timestamp >= round.endEpoch, "Round is still active");
        require(!round.isFinished, "Round is already finished");

        if (round.totalRaised > 0) {
            distributeTokens(roundId);
            addLiquidity(roundId);
        }

        round.isFinished = true;
    }

    function distributeTokens(uint256 roundId) internal {
        Round storage round = rounds[roundId];

        StandardToken token = StandardToken(round.tokenContract);
        uint256 totalSupply = token.balanceOf(address(this));
        uint256 totalDistributed = (totalSupply * 50) / 100;

        for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
            RoundUserContribution storage contribution = roundContributions[roundId][i];
            uint256 userShare = (totalDistributed * contribution.amount) / round.totalRaised;
            token.transfer(contribution.user, userShare);
        }

        emit TokensDistributed(roundId, totalDistributed);
    }

    function addLiquidity(uint256 roundId) internal {
        Round storage round = rounds[roundId];

        StandardToken token = StandardToken(round.tokenContract);
        uint256 totalSupply = token.balanceOf(address(this));
        uint256 liquidityTokens = (totalSupply * 50) / 100;
        uint256 nativeCoinForLiquidity = round.totalRaised - distributePlatformFee(roundId);

        // Add liquidity using Uniswap V2 router
        token.approve(address(router), liquidityTokens);
        router.addLiquidityETH{value: nativeCoinForLiquidity}(
            address(token),
            liquidityTokens,
            0, // Min token amount
            0, // Min ETH amount
            deadAddress,
            block.timestamp + 3600
        );

        emit LiquidityAdded(roundId, liquidityTokens, nativeCoinForLiquidity);
    }

    function distributePlatformFee(uint256 roundId) internal returns( uint256 amount) {
        Round storage round = rounds[roundId];
        uint256 fee = (round.totalRaised * platformFeePercentage) / 100;
        round.totalRaised -= fee; // Deduct fee from total raised
        payable(treasury).transfer(fee);
        return fee;
    }

    function withdrawPlatformFee() external onlyOwner nonReentrant {
        // For withdrawing remaining platform fee (if any) manually after all rounds are finished
        payable(owner()).transfer(address(this).balance);
    }

    function setCreationFee(uint256 newCreationFee) external onlyOwner {
        creationFee = newCreationFee;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury address cannot be zero address");
        treasury = newTreasury;
    }

    function getRoundDetails(uint256 roundId) external view returns (Round memory) {
        require(roundId < rounds.length, "Invalid round ID");
        return rounds[roundId];
    }

    function getRoundContributions(uint256 roundId) external view returns (RoundUserContribution[] memory) {
        return roundContributions[roundId];
    }





function getLiveRounds(uint256 pageNumber, uint256 pageSize) public view returns (Round[] memory) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 liveCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (!rounds[i].isFinished) {
            liveCount++;
        }
    }

    uint256 startIndex = (pageNumber - 1) * pageSize;
    uint256 endIndex = startIndex + pageSize - 1;

    require(startIndex < liveCount, "Start index out of bounds");

    if (endIndex >= liveCount) {
        endIndex = liveCount - 1;
    }

    Round[] memory liveRounds = new Round[](endIndex - startIndex + 1);
    uint256 index = 0;
    for (uint256 i = 0; i < rounds.length && index <= endIndex; i++) {
        if (!rounds[i].isFinished) {
            if (startIndex <= index && index <= endIndex) {
                liveRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return liveRounds;
}

    function getFinishedRounds(uint256 pageNumber, uint256 pageSize) external view returns (Round[] memory) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 finishedCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (rounds[i].isFinished) {
            finishedCount++;
        }
    }

    uint256 startIndex = (pageNumber - 1) * pageSize;
    uint256 endIndex = startIndex + pageSize - 1;

    require(startIndex < finishedCount, "Start index out of bounds");

    if (endIndex >= finishedCount) {
        endIndex = finishedCount - 1;
    }

    Round[] memory finishedRounds = new Round[](endIndex - startIndex + 1);
    uint256 index = 0;
    for (uint256 i = 0; i < rounds.length && index <= endIndex; i++) {
        if (rounds[i].isFinished) {
            if (startIndex <= index && index <= endIndex) {
                finishedRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return finishedRounds;
}

 function getTop5() external view returns (Round[] memory) {
    // Create a temporary array to store live rounds
    uint256 liveCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            liveCount++;
        }
    }

    Round[] memory liveRounds = new Round[](liveCount);
    uint256 liveIndex = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
            liveRounds[liveIndex] = rounds[i];
            liveIndex++;
        }
    }

    // Perform a simple bubble sort to get the top 5 live rounds based on total raised amount
    for (uint256 i = 0; i < liveRounds.length - 1; i++) {
        for (uint256 j = 0; j < liveRounds.length - i - 1; j++) {
            if (liveRounds[j].totalRaised < liveRounds[j + 1].totalRaised) {
                Round memory temp = liveRounds[j];
                liveRounds[j] = liveRounds[j + 1];
                liveRounds[j + 1] = temp;
            }
        }
    }

    // Return only the top 5 live rounds
    uint256 count = liveRounds.length > 5 ? 5 : liveRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = liveRounds[i];
    }
    
    return top5;
}

function getUserContributionAndAllocation(uint256 roundId, address user) external view returns (uint256 contribution, uint256 tokenAllocation) {
    require(roundId < rounds.length, "Invalid round ID");
    
    Round storage round = rounds[roundId];
    StandardToken token = StandardToken(round.tokenContract);
    uint256 totalSupply = token.balanceOf(address(this));
    uint256 totalDistributed = (totalSupply * 50) / 100;
    
    contribution = 0;
    tokenAllocation = 0;
    
    for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
        if (roundContributions[roundId][i].user == user) {
            contribution = roundContributions[roundId][i].amount;
            if (round.totalRaised > 0) {
                tokenAllocation = (totalDistributed * contribution) / round.totalRaised;
            }
            break;
        }
    }
    
    return (contribution, tokenAllocation);
}

function getWeeklyTop5FinishedRounds() external view returns (Round[] memory) {
    uint256 oneWeekAgo = block.timestamp - 1 weeks;

    // Create a temporary array to store rounds finished in the last week
    uint256 recentFinishedCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (rounds[i].isFinished && rounds[i].endEpoch >= oneWeekAgo) {
            recentFinishedCount++;
        }
    }

    Round[] memory recentFinishedRounds = new Round[](recentFinishedCount);
    uint256 index = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (rounds[i].isFinished && rounds[i].endEpoch >= oneWeekAgo) {
            recentFinishedRounds[index] = rounds[i];
            index++;
        }
    }

    // Perform a simple bubble sort to get the top 5 finished rounds based on total raised amount
    for (uint256 i = 0; i < recentFinishedRounds.length - 1; i++) {
        for (uint256 j = 0; j < recentFinishedRounds.length - i - 1; j++) {
            if (recentFinishedRounds[j].totalRaised < recentFinishedRounds[j + 1].totalRaised) {
                Round memory temp = recentFinishedRounds[j];
                recentFinishedRounds[j] = recentFinishedRounds[j + 1];
                recentFinishedRounds[j + 1] = temp;
            }
        }
    }

    // Return only the top 5 finished rounds
    uint256 count = recentFinishedRounds.length > 5 ? 5 : recentFinishedRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = recentFinishedRounds[i];
    }

    return top5;
}


}
