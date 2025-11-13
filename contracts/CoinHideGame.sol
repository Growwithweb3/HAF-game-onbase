// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CoinHideGame {
    enum GameStatus { Waiting, Ready, Hiding, Finding, RoundComplete, Finished }
    
    struct Game {
        address creator;      // Player 001/002
        address joiner;       // Player 003/004
        uint256 stake;
        uint256 totalRounds;
        uint256 currentRound;
        GameStatus status;
        bool creatorReady;
        bool joinerReady;
        uint256 hideStartTime;
        uint256 findStartTime;
        address currentHider;  // Who is hiding in current turn
        address currentSeeker; // Who is seeking in current turn
        uint8 currentHideBox;  // Box where coin is hidden (1-9)
        bool creatorHiding;    // true if creator is hiding, false if joiner
    }
    
    struct Round {
        uint8 creatorHideBox;    // Box creator hid coin (0 if not hidden yet)
        uint8 joinerHideBox;     // Box joiner hid coin (0 if not hidden yet)
        uint8 creatorFindBox;    // Box creator tried to find (0 if not found yet)
        uint8 joinerFindBox;     // Box joiner tried to find (0 if not found yet)
        bool creatorFound;       // Did creator find joiner's coin?
        bool joinerFound;        // Did joiner find creator's coin?
        uint256 creatorScore;   // Creator's score this round
        uint256 joinerScore;     // Joiner's score this round
        bool completed;
    }
    
    struct PlayerHistory {
        uint8[] usedBoxes;  // Boxes this player has hidden in (for draw prevention)
    }
    
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(uint256 => Round)) public rounds; // gameId => round => Round
    mapping(uint256 => mapping(address => PlayerHistory)) public playerHistory; // gameId => player => history
    mapping(address => uint256[]) public playerGames;
    
    uint256 public gameCounter;
    uint256 public constant HIDE_DURATION = 15 seconds;
    uint256 public constant FIND_DURATION = 10 seconds;
    uint256 public constant MIN_STAKE = 0.00001 ether;
    uint256 public constant WIN_SCORE = 2; // Need 2 wins to win a round
    
    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 stake);
    event PlayerJoined(uint256 indexed gameId, address indexed joiner);
    event PlayerReady(uint256 indexed gameId, address indexed player);
    event CoinHidden(uint256 indexed gameId, uint256 indexed round, address indexed hider, uint8 box);
    event CoinFound(uint256 indexed gameId, uint256 indexed round, address indexed seeker, uint8 box, bool found);
    event RoundComplete(uint256 indexed gameId, uint256 indexed round, uint256 creatorScore, uint256 joinerScore);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 amount);
    
    modifier validGame(uint256 gameId) {
        require(games[gameId].creator != address(0), "Game does not exist");
        _;
    }
    
    function createGame() external payable returns (uint256) {
        require(msg.value >= MIN_STAKE, "Stake too low");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        games[gameId] = Game({
            creator: msg.sender,
            joiner: address(0),
            stake: msg.value,
            totalRounds: 0,
            currentRound: 0,
            status: GameStatus.Waiting,
            creatorReady: false,
            joinerReady: false,
            hideStartTime: 0,
            findStartTime: 0,
            currentHider: address(0),
            currentSeeker: address(0),
            currentHideBox: 0,
            creatorHiding: true
        });
        
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, msg.value);
        return gameId;
    }
    
    function joinGame(uint256 gameId) external payable validGame(gameId) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Waiting, "Game not available");
        require(game.creator != msg.sender, "Cannot join own game");
        require(msg.value >= game.stake, "Insufficient stake");
        
        game.joiner = msg.sender;
        game.stake += msg.value;
        
        playerGames[msg.sender].push(gameId);
        
        emit PlayerJoined(gameId, msg.sender);
    }
    
    function setReady(uint256 gameId) external validGame(gameId) {
        Game storage game = games[gameId];
        require(game.joiner != address(0), "No joiner yet");
        require(game.status == GameStatus.Waiting || game.status == GameStatus.Ready, "Game already started");
        
        if (msg.sender == game.creator) {
            require(!game.creatorReady, "Already ready");
            game.creatorReady = true;
        } else if (msg.sender == game.joiner) {
            require(!game.joinerReady, "Already ready");
            game.joinerReady = true;
        } else {
            revert("Not a player");
        }
        
        emit PlayerReady(gameId, msg.sender);
        
        // Both ready - start first round
        if (game.creatorReady && game.joinerReady) {
            game.status = GameStatus.Ready;
            startNewRound(gameId);
        }
    }
    
    function startNewRound(uint256 gameId) internal {
        Game storage game = games[gameId];
        game.currentRound++;
        game.totalRounds = game.currentRound;
        game.creatorReady = false;
        game.joinerReady = false;
        
        // Initialize round
        rounds[gameId][game.currentRound] = Round({
            creatorHideBox: 0,
            joinerHideBox: 0,
            creatorFindBox: 0,
            joinerFindBox: 0,
            creatorFound: false,
            joinerFound: false,
            creatorScore: 0,
            joinerScore: 0,
            completed: false
        });
        
        // Creator hides first
        game.creatorHiding = true;
        game.currentHider = game.creator;
        game.currentSeeker = game.joiner;
        game.status = GameStatus.Hiding;
        game.hideStartTime = block.timestamp;
    }
    
    function hideCoin(uint256 gameId, uint8 box) external validGame(gameId) {
        require(box >= 1 && box <= 9, "Invalid box (1-9)");
        
        Game storage game = games[gameId];
        require(game.status == GameStatus.Hiding, "Not in hiding phase");
        require(msg.sender == game.currentHider, "Not your turn to hide");
        require(block.timestamp <= game.hideStartTime + HIDE_DURATION, "Hiding time expired");
        
        Round storage round = rounds[gameId][game.currentRound];
        PlayerHistory storage history = playerHistory[gameId][msg.sender];
        
        // Check if this box was used before (only if not first round)
        if (game.currentRound > 1) {
            for (uint i = 0; i < history.usedBoxes.length; i++) {
                require(history.usedBoxes[i] != box, "Cannot hide in same box as previous round");
            }
        }
        
        if (game.creatorHiding) {
            require(round.creatorHideBox == 0, "Already hid coin");
            round.creatorHideBox = box;
            game.currentHideBox = box;
        } else {
            require(round.joinerHideBox == 0, "Already hid coin");
            round.joinerHideBox = box;
            game.currentHideBox = box;
        }
        
        // Add to history
        history.usedBoxes.push(box);
        
        emit CoinHidden(gameId, game.currentRound, msg.sender, box);
        
        // Move to finding phase
        game.status = GameStatus.Finding;
        game.findStartTime = block.timestamp;
    }
    
    function findCoin(uint256 gameId, uint8 box) external validGame(gameId) {
        require(box >= 1 && box <= 9, "Invalid box (1-9)");
        
        Game storage game = games[gameId];
        require(game.status == GameStatus.Finding, "Not in finding phase");
        require(msg.sender == game.currentSeeker, "Not your turn to find");
        require(block.timestamp <= game.findStartTime + FIND_DURATION, "Finding time expired");
        
        Round storage round = rounds[gameId][game.currentRound];
        bool found = (box == game.currentHideBox);
        
        if (game.creatorHiding) {
            // Creator is hiding, joiner is seeking
            require(round.joinerFindBox == 0, "Already tried to find");
            round.joinerFindBox = box;
            round.joinerFound = found;
            // If joiner found creator's coin → joiner wins 1 point
            // If joiner didn't find creator's coin → creator wins 1 point
            if (found) {
                round.joinerScore++;
            } else {
                round.creatorScore++;
            }
        } else {
            // Joiner is hiding, creator is seeking
            require(round.creatorFindBox == 0, "Already tried to find");
            round.creatorFindBox = box;
            round.creatorFound = found;
            // If creator found joiner's coin → creator wins 1 point
            // If creator didn't find joiner's coin → joiner wins 1 point
            if (found) {
                round.creatorScore++;
            } else {
                round.joinerScore++;
            }
        }
        
        emit CoinFound(gameId, game.currentRound, msg.sender, box, found);
        
        // Check if both players have hidden and found
        if (round.creatorHideBox != 0 && round.joinerHideBox != 0 && 
            round.creatorFindBox != 0 && round.joinerFindBox != 0) {
            // Round complete - calculate final scores
            round.completed = true;
            game.status = GameStatus.RoundComplete;
            
            emit RoundComplete(gameId, game.currentRound, round.creatorScore, round.joinerScore);
            
            // Check for winner (need 2 points to win a round)
            if (round.creatorScore >= WIN_SCORE) {
                finishGame(gameId, game.creator);
            } else if (round.joinerScore >= WIN_SCORE) {
                finishGame(gameId, game.joiner);
            } else {
                // Draw - start new round
                startNewRound(gameId);
            }
        } else {
            // Switch roles - other player hides now
            game.creatorHiding = !game.creatorHiding;
            if (game.creatorHiding) {
                game.currentHider = game.creator;
                game.currentSeeker = game.joiner;
            } else {
                game.currentHider = game.joiner;
                game.currentSeeker = game.creator;
            }
            game.status = GameStatus.Hiding;
            game.hideStartTime = block.timestamp;
            game.currentHideBox = 0;
        }
    }
    
    function finishGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];
        game.status = GameStatus.Finished;
        uint256 reward = game.stake;
        game.stake = 0;
        
        payable(winner).transfer(reward);
        
        emit GameFinished(gameId, winner, reward);
    }
    
    function getGame(uint256 gameId) external view returns (
        address creator,
        address joiner,
        uint256 stake,
        uint256 currentRound,
        GameStatus status,
        bool creatorReady,
        bool joinerReady,
        address currentHider,
        address currentSeeker,
        uint8 currentHideBox,
        bool creatorHiding
    ) {
        Game memory game = games[gameId];
        return (
            game.creator,
            game.joiner,
            game.stake,
            game.currentRound,
            game.status,
            game.creatorReady,
            game.joinerReady,
            game.currentHider,
            game.currentSeeker,
            game.currentHideBox,
            game.creatorHiding
        );
    }
    
    function getRound(uint256 gameId, uint256 roundNum) external view returns (
        uint8 creatorHideBox,
        uint8 joinerHideBox,
        uint8 creatorFindBox,
        uint8 joinerFindBox,
        bool creatorFound,
        bool joinerFound,
        uint256 creatorScore,
        uint256 joinerScore,
        bool completed
    ) {
        Round memory round = rounds[gameId][roundNum];
        return (
            round.creatorHideBox,
            round.joinerHideBox,
            round.creatorFindBox,
            round.joinerFindBox,
            round.creatorFound,
            round.joinerFound,
            round.creatorScore,
            round.joinerScore,
            round.completed
        );
    }
    
    function getPlayerHistory(uint256 gameId, address player) external view returns (uint8[] memory) {
        return playerHistory[gameId][player].usedBoxes;
    }
    
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
}

