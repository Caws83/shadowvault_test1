// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract FiftyFiftyGame {
    address public owner;
    address public operator;
    uint public round = 0;
    address public devWallet;

    modifier onlyOwnerOrOperator() {
        require(msg.sender == owner || msg.sender == operator, "Only owner or operator can call this function");
        _;
    }

    struct RoundInfo {
        uint256 ticketPrice;
        uint roundEndTime;
        uint[3] potSplit; // Percentage split for the winner, developer, and remaining amount to stay in the pot
        address[] players;
        address winner;
        uint256 amountWon;
    }

    RoundInfo[] public roundInfo;
    mapping(address => mapping(uint => uint)) public ticketsBought;


    event TicketBought(address indexed player);
    event WinnerSelected(uint roundNumber, address indexed winner, uint256 amountWon);
    event RoundStarted(uint roundNumber, uint256 ticketPrice, uint roundLength, uint[3] potSplit);

    constructor(address _devWallet) {
        owner = msg.sender;
        operator = msg.sender; // Set operator to owner by default
        devWallet = _devWallet;
        // Initialize the first round
        roundInfo.push(RoundInfo({
            ticketPrice: 0,
            potSplit: [uint(0), uint(0), uint(0)],
            roundEndTime: 0,
            players: new address[](0),
            winner: address(0),
            amountWon: 0
        }));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier roundEnded() {
        require(block.timestamp >= roundInfo[round].roundEndTime, "Round has not ended yet");
        _;
    }
    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
    }
function startNewRound(uint256 _ticketPrice, uint _roundLength, uint[3] memory _potSplit) public onlyOwner onlyOwnerOrOperator roundEnded {
    require(_potSplit[0] + _potSplit[1] + _potSplit[2] == 100, "Percentages must add up to 100");

    round++;
    roundInfo.push(RoundInfo({
        ticketPrice: _ticketPrice,
        potSplit: _potSplit,
        roundEndTime: block.timestamp + _roundLength,
        players: new address[](0),
        winner: address(0),
        amountWon: 0
    }));

    emit RoundStarted(round, _ticketPrice, _roundLength, _potSplit);
}

    function buyTickets(uint _numTickets) external payable {
        require(_numTickets > 0, "Number of tickets must be greater than zero");
        require(msg.value >= roundInfo[round].ticketPrice * _numTickets, "Incorrect total ticket price");
        require(block.timestamp < roundInfo[round].roundEndTime, "Round has ended");

        for (uint i = 0; i < _numTickets; i++) {
            roundInfo[round].players.push(msg.sender);
            ticketsBought[msg.sender][round]++;
            emit TicketBought(msg.sender);
        }
    }

    function selectWinner() public onlyOwnerOrOperator roundEnded {
        
        uint winnerIndex = random() % roundInfo[round].players.length;
        address winner = roundInfo[round].players[winnerIndex];
        uint256 amountToWinner = 0;

        if(roundInfo[round].potSplit[0] > 0){
            amountToWinner = (address(this).balance * roundInfo[round].potSplit[0]) / 100;
            payable(winner).transfer(amountToWinner);
             
        }
        if(roundInfo[round].potSplit[1] >0){
            uint256 amountToDev = (address(this).balance * roundInfo[round].potSplit[1]) / 100;
            payable(devWallet).transfer(amountToDev);
        }

        emit WinnerSelected(round, winner, amountToWinner);
        
    }

    function EndAndStartNew(uint256 _ticketPrice, uint _roundLength, uint[3] calldata _potSplit) external onlyOwnerOrOperator  {
        selectWinner();
        startNewRound(_ticketPrice, _roundLength, _potSplit);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, roundInfo[round].players.length)));
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function currentRoundInfo() external view returns(RoundInfo memory currentInfo){
        return roundInfo[round];
    }
    function getRoundInfo(uint256 _round) external view returns(RoundInfo memory thisRoundInfo) {
        return roundInfo[_round];
    }
    function getPotBalance() external view returns (uint256 potBalance) {
        return address(this).balance;
    }

    // fallback function to receive ether
    receive() external payable {}
}
