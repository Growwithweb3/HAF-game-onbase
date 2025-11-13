// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EscroGame {
    enum GameStatus { Waiting, Hiding, Seeking, Found, Timeout }
    
    struct Game {
        address hider;
        address seeker;
        uint256 stake;
        uint256 hideTime;
        uint256 seekTime;
        uint256 hideLocation; // Location hash
        uint256 revealTime;
        GameStatus status;
        bool hiderRevealed;
    }
    
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public balances;
    
    uint256 public gameCounter;
    uint256 public constant HIDE_DURATION = 5 minutes;
    uint256 public constant SEEK_DURATION = 10 minutes;
    uint256 public constant MIN_STAKE = 0.01 ether;
    
    event GameCreated(uint256 indexed gameId, address indexed hider, uint256 stake);
    event SeekerJoined(uint256 indexed gameId, address indexed seeker);
    event HideLocationSet(uint256 indexed gameId, bytes32 locationHash);
    event LocationRevealed(uint256 indexed gameId, uint256 location);
    event GameWon(uint256 indexed gameId, address winner, uint256 amount);
    event GameTimeout(uint256 indexed gameId, address winner, uint256 amount);
    
    modifier validGame(uint256 gameId) {
        require(games[gameId].hider != address(0), "Game does not exist");
        _;
    }
    
    function createGame() external payable returns (uint256) {
        require(msg.value >= MIN_STAKE, "Stake too low");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        games[gameId] = Game({
            hider: msg.sender,
            seeker: address(0),
            stake: msg.value,
            hideTime: 0,
            seekTime: 0,
            hideLocation: 0,
            revealTime: 0,
            status: GameStatus.Waiting,
            hiderRevealed: false
        });
        
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, msg.value);
        return gameId;
    }
    
    function joinGame(uint256 gameId) external payable validGame(gameId) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(game.hider != msg.sender, "Cannot join own game");
        require(msg.value >= game.stake, "Insufficient stake");
        
        game.seeker = msg.sender;
        game.stake += msg.value;
        game.status = GameStatus.Hiding;
        game.hideTime = block.timestamp;
        
        playerGames[msg.sender].push(gameId);
        
        emit SeekerJoined(gameId, msg.sender);
    }
    
    function setHideLocation(uint256 gameId, bytes32 locationHash) external validGame(gameId) {
        Game storage game = games[gameId];
        require(game.hider == msg.sender, "Not the hider");
        require(game.status == GameStatus.Hiding, "Not in hiding phase");
        require(block.timestamp <= game.hideTime + HIDE_DURATION, "Hiding time expired");
        
        game.hideLocation = uint256(locationHash);
        game.status = GameStatus.Seeking;
        game.seekTime = block.timestamp;
        
        emit HideLocationSet(gameId, locationHash);
    }
    
    function revealLocation(uint256 gameId, uint256 location, string memory secret) external validGame(gameId) {
        Game storage game = games[gameId];
        require(game.hider == msg.sender, "Not the hider");
        require(game.status == GameStatus.Seeking, "Not in seeking phase");
        require(!game.hiderRevealed, "Already revealed");
        
        bytes32 locationHash = keccak256(abi.encodePacked(location, secret));
        require(uint256(locationHash) == game.hideLocation, "Invalid reveal");
        
        game.hideLocation = location;
        game.hiderRevealed = true;
        game.revealTime = block.timestamp;
        
        emit LocationRevealed(gameId, location);
    }
    
    function claimFound(uint256 gameId, uint256 location) external validGame(gameId) {
        Game storage game = games[gameId];
        require(game.seeker == msg.sender, "Not the seeker");
        require(game.status == GameStatus.Seeking, "Not in seeking phase");
        require(game.hiderRevealed, "Location not revealed yet");
        require(location == game.hideLocation, "Wrong location");
        
        game.status = GameStatus.Found;
        uint256 reward = game.stake;
        game.stake = 0;
        
        payable(msg.sender).transfer(reward);
        
        emit GameWon(gameId, msg.sender, reward);
    }
    
    function claimTimeout(uint256 gameId) external validGame(gameId) {
        Game storage game = games[gameId];
        require(
            (game.status == GameStatus.Seeking && block.timestamp > game.seekTime + SEEK_DURATION) ||
            (game.status == GameStatus.Hiding && block.timestamp > game.hideTime + HIDE_DURATION),
            "Not timeout yet"
        );
        
        address winner;
        if (game.status == GameStatus.Seeking) {
            winner = game.hider; // Seeker didn't find in time
        } else {
            winner = game.seeker; // Hider didn't hide in time
        }
        
        game.status = GameStatus.Timeout;
        uint256 reward = game.stake;
        game.stake = 0;
        
        payable(winner).transfer(reward);
        
        emit GameTimeout(gameId, winner, reward);
    }
    
    function getGame(uint256 gameId) external view returns (
        address hider,
        address seeker,
        uint256 stake,
        uint256 hideTime,
        uint256 seekTime,
        GameStatus status,
        bool hiderRevealed
    ) {
        Game memory game = games[gameId];
        return (
            game.hider,
            game.seeker,
            game.stake,
            game.hideTime,
            game.seekTime,
            game.status,
            game.hiderRevealed
        );
    }
    
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
}

