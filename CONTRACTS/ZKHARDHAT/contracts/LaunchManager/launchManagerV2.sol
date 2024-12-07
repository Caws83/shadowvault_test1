// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "./standardShot.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
}

contract PreLaunchManagerV2 is Ownable, ReentrancyGuard {
    struct Round {
        uint256 roundId;
        address tokenContract;
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 totalRaised;
        uint256 endEpoch;
        bool isFinished;
        string[4] projectInfo;
        bool sponsored;
        bool croHome;
        address creator;
        IUniswapV2Router02 router;
    }

    struct RoundUserContribution {
        address user;
        uint256 amount;
        bool collected;
    }

    address public deadAddress = 0x000000000000000000000000000000000000dEaD;
    address public WETH;
    uint256 public creationFee;
    uint256 public platformFeePercentage;
    uint256 public prizeFeePercentage;
    uint256 public burnFeePercentage;
    address public burnToken;
    uint256 public sponsorshipFee;
    uint256 public croHomeFee;
    address public treasury;
    address public prizeTreasury;
    IUniswapV2Router02 public burnRouter;

    Round[] public rounds;
    mapping(uint256 => RoundUserContribution[]) public roundContributions;

    event RoundStarted(address tokenContract, string name, string symbol, uint256 endEpoch);
    event Contributed(uint256 roundId, address indexed user, uint256 amount);
    event TokensDistributed(uint256 roundId, uint256 totalDistributed);
    event LiquidityAdded(uint256 roundId, uint256 tokenAmount, uint256 nativeCoinAmount);
    event TokensCollected(uint256 roundId, address indexed user, uint256 amount);

    constructor(
        uint256 _creationFee,
        uint256 _platformFeePercentage,
        uint256 _prizeFeePercentage,
        uint256 _burnFeePercentage,
        address _burnToken,
        IUniswapV2Router02 _burnRouter,
        address _treasury,
        address _prizeTreasury,
        address _WETH,
        uint256 _sponsorshipFee,
        uint256 _croHomeFee
    ) Ownable(msg.sender) {
        if(_burnFeePercentage > 0)  require(burnToken != address(0), "if Burn fee percent > 0, must have a token.");
        creationFee = _creationFee;
        platformFeePercentage = _platformFeePercentage;
        burnFeePercentage = _burnFeePercentage;
        prizeFeePercentage = _prizeFeePercentage;
        prizeTreasury = _prizeTreasury;
        burnToken = _burnToken;
        treasury = _treasury;
        sponsorshipFee = _sponsorshipFee;
        croHomeFee = _croHomeFee;
        WETH = _WETH;
        burnRouter = _burnRouter;
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
        uint256 _endEpoch,
        string[4] memory _projectInfo,
        bool _sponsored,
        bool _croHome,
        IUniswapV2Router02 _router
    ) external payable checkAndFinalizeRounds {
        
        uint256 fee = creationFee;
        if(_sponsored) fee += sponsorshipFee;
        if(_croHome) fee += croHomeFee;
        require(msg.value >= fee, "Insufficient creation fee");
        (bool success,) = treasury.call{value:fee}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        StandardToken token = new StandardToken(_name, _symbol, initialSupply, address(this));
                
        rounds.push(Round({
            roundId: rounds.length,
            tokenContract: address(token),
            name: _name,
            symbol: _symbol,
            totalSupply: initialSupply,
            totalRaised: 0,
            endEpoch: _endEpoch,
            isFinished: false,
            projectInfo: _projectInfo,
            sponsored: _sponsored,
            croHome: _croHome,
            creator: msg.sender,
            router: _router
        }));
        emit RoundStarted(address(token), _name, _symbol, _endEpoch);
    }

    function editProjectInfo(uint256 roundId,  string memory _website, string memory _telegram, string memory _logo) external {
        require(roundId < rounds.length, "Invalid round ID");
        Round storage round = rounds[roundId];
        require(msg.sender == round.creator, "Only creator can edit the socials.");
        round.projectInfo[0] = _website;
        round.projectInfo[1] = _telegram;
        round.projectInfo[2] = _logo;
    }

    function contribute(uint256 roundId) external payable checkAndFinalizeRounds {
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
                amount: msg.value,
                collected: false
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
            addLiquidity(roundId);
        }

        round.isFinished = true;
    }

    function addLiquidity(uint256 roundId) internal {
        Round storage round = rounds[roundId];

        StandardToken token = StandardToken(round.tokenContract);
        uint256 totalSupply = round.totalSupply;
        uint256 liquidityTokens = (totalSupply * 50) / 100;
        uint256 nativeCoinForLiquidity = round.totalRaised - distributePlatformFee(roundId);

        // Add liquidity using Uniswap V2 router
        token.approve(address(round.router), liquidityTokens);
        round.router.addLiquidityETH{value: nativeCoinForLiquidity}(
            address(token),
            liquidityTokens,
            0, // Min token amount
            0, // Min ETH amount
            deadAddress,
            block.timestamp + 3600
        );

        emit LiquidityAdded(roundId, liquidityTokens, nativeCoinForLiquidity);
    }

    function distributePlatformFee(uint256 roundId) internal returns(uint256 amount) {
        Round storage round = rounds[roundId];
        uint256 prizeAmount = (round.totalRaised * prizeFeePercentage) / 100;
        if(prizeAmount > 0) {
            (bool success,) = prizeTreasury.call{value:prizeAmount}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        }
           
        uint256 fee = (round.totalRaised * platformFeePercentage) / 100;
        if(fee> 0) {
            (bool success,) = treasury.call{value:fee}(new bytes(0));
            require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
        }
        uint256 burnFee = (round.totalRaised * burnFeePercentage) / 100;
        if(burnFee > 0){
            address[] memory path = new address[](2);
            path[0] = WETH;
            path[1] = burnToken;
            
            burnRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: burnFee}(
                0, 
                path, 
                deadAddress, 
                block.timestamp + 3600
            );
        }
        return fee + burnFee + prizeAmount;
    }

    function withdrawPlatformFee() external onlyOwner nonReentrant {
        (bool success,) = owner().call{value:address(this).balance}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }

    function setCreationFee(uint256 newCreationFee) external onlyOwner {
        creationFee = newCreationFee;
    }

    function setSponsorshipFee(uint256 newSponsorshipFee) external onlyOwner {
        sponsorshipFee = newSponsorshipFee;
    }
    
    function setCroHomeFee(uint256 newCroHomeFee) external onlyOwner {
        croHomeFee = newCroHomeFee;
    }
    function setBurnRouter(IUniswapV2Router02 newBurnRouter) external onlyOwner {
        burnRouter = newBurnRouter;
    }
    function setFeePercentages(uint256 newPlatformPercentage, uint256 newBurnPercentage, uint256 newPrizePercentage) external onlyOwner {
    // Check the combined fee percentages do not exceed 6%
    require(newPlatformPercentage + newBurnPercentage + newPrizePercentage <= 6, "Max 6% total Percentage Fees");

    // Check if burn percentage is greater than 0, and if so, ensure burn token is set
    if(newBurnPercentage > 0) {
        require(burnToken != address(0), "Burn Token must be set");
    }

    // Update the fee percentages
    platformFeePercentage = newPlatformPercentage;
    burnFeePercentage = newBurnPercentage;
    prizeFeePercentage = newPrizePercentage;
}
   function setBurnToken(address newBurnToken) external onlyOwner {
       // Check if the address is a valid ERC20 token by calling the `symbol()` function.
    try ERC20(newBurnToken).symbol() returns (string memory) {
        burnToken = newBurnToken;
    } catch {
        revert("Not a valid ERC20 token");
    }
}

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury address cannot be zero address");
        treasury = newTreasury;
    }
   
    function getRoundDetails(uint256 roundId) external view returns (Round memory) {
        require(roundId < rounds.length, "Invalid round ID");
        return rounds[roundId];
    }

    function getRoundContributions(uint256 roundId) public view returns (RoundUserContribution[] memory) {
        return roundContributions[roundId];
    }

 

function getLiveRounds(uint256 pageNumber, uint256 pageSize) public view returns (Round[] memory, uint256 total) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 liveCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch) {
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
        if (block.timestamp < rounds[i].endEpoch) {
            if (startIndex <= index && index <= endIndex) {
                liveRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return (liveRounds, liveCount);
}

    function getFinishedRounds(uint256 pageNumber, uint256 pageSize) external view returns (Round[] memory, uint256 total) {
    require(pageSize > 0, "Page size must be greater than zero");

    uint256 finishedCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp > rounds[i].endEpoch) {
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
        if (block.timestamp > rounds[i].endEpoch) {
            if (startIndex <= index && index <= endIndex) {
                finishedRounds[index - startIndex] = rounds[i];
            }
            index++;
        }
    }

    return (finishedRounds, finishedCount);
}

 function getTop(uint256 howMany) external view returns (Round[] memory, uint256 total) {
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
    uint256 count = liveRounds.length > howMany ? howMany : liveRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = liveRounds[i];
    }
    
    return (top5, count);
}

function getUserContributionAndAllocation(uint256 roundId, address user) public view returns (uint256 contribution, uint256 tokenAllocation, bool collected) {
    require(roundId < rounds.length, "Invalid round ID");
    
    Round storage round = rounds[roundId];
    uint256 totalSupply = round.totalSupply;
    uint256 totalDistributed = (totalSupply * 50) / 100;
    
    contribution = 0;
    tokenAllocation = 0;
    collected = false;
    
    for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
        if (roundContributions[roundId][i].user == user) {
            contribution = roundContributions[roundId][i].amount;
            collected = roundContributions[roundId][i].collected;
            if (round.totalRaised > 0) {
                tokenAllocation = (totalDistributed * contribution) / round.totalRaised;
            }
            break;
        }
    }
    
    return (contribution, tokenAllocation, collected);
}



function getTopLiveWithSponsorship(uint256 howMany) external view returns (Round[] memory, uint256 total) {
    // Create a temporary array to store live sponsored rounds
    uint256 liveSponsoredCount = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch && rounds[i].sponsored) {
            liveSponsoredCount++;
        }
    }

    Round[] memory liveSponsoredRounds = new Round[](liveSponsoredCount);
    uint256 liveIndex = 0;
    for (uint256 i = 0; i < rounds.length; i++) {
        if (block.timestamp < rounds[i].endEpoch && rounds[i].sponsored) {
            liveSponsoredRounds[liveIndex] = rounds[i];
            liveIndex++;
        }
    }

    // Perform a simple bubble sort to get the top 5 live sponsored rounds based on total raised amount
    for (uint256 i = 0; i < liveSponsoredRounds.length - 1; i++) {
        for (uint256 j = 0; j < liveSponsoredRounds.length - i - 1; j++) {
            if (liveSponsoredRounds[j].totalRaised < liveSponsoredRounds[j + 1].totalRaised) {
                Round memory temp = liveSponsoredRounds[j];
                liveSponsoredRounds[j] = liveSponsoredRounds[j + 1];
                liveSponsoredRounds[j + 1] = temp;
            }
        }
    }

    // Return only the top 5 live sponsored rounds
    uint256 count = liveSponsoredRounds.length > howMany ? howMany : liveSponsoredRounds.length;
    Round[] memory top5 = new Round[](count);
    for (uint256 i = 0; i < count; i++) {
        top5[i] = liveSponsoredRounds[i];
    }
    
    return (top5, count);
}

function collect(uint256 roundId) external nonReentrant {
    require(roundId < rounds.length, "Invalid round ID");
    Round storage round = rounds[roundId];
    require(round.isFinished, "Round is not finished");

    (uint256 contribution, uint256 tokenAllocation, bool collected) = getUserContributionAndAllocation(roundId, msg.sender);
    require(contribution > 0, "No contributions found for user");
    require(!collected, "Tokens already collected");

    // Mark the tokens as collected
    for (uint256 i = 0; i < roundContributions[roundId].length; i++) {
        if (roundContributions[roundId][i].user == msg.sender) {
            roundContributions[roundId][i].collected = true;
            break;
        }
    }

    // Transfer tokens to the user
    StandardToken token = StandardToken(round.tokenContract);
    token.transfer(msg.sender, tokenAllocation);

    emit TokensCollected(roundId, msg.sender, tokenAllocation);
}

   
}
