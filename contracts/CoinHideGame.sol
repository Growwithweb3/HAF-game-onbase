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
    
    mapping(uint256 => Game) private games;
    mapping(uint256 => mapping(uint256 => Round)) private rounds; // gameId => round => Round
    mapping(uint256 => mapping(address => PlayerHistory)) private playerHistory; // gameId => player => history
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
        
        initializeGame(gameId, msg.sender, msg.value);
        
        playerGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, msg.value);
        return gameId;
    }
    
    function initializeGame(uint256 gameId, address creator, uint256 stake) internal {
        Game storage game = games[gameId];
        game.creator = creator;
        game.joiner = address(0);
        game.stake = stake;
        game.totalRounds = 0;
        game.currentRound = 0;
        game.status = GameStatus.Waiting;
        game.creatorReady = false;
        game.joinerReady = false;
        game.hideStartTime = 0;
        game.findStartTime = 0;
        game.currentHider = address(0);
        game.currentSeeker = address(0);
        game.currentHideBox = 0;
        game.creatorHiding = true;
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
        uint256 newRound = game.currentRound;
        game.totalRounds = newRound;
        game.creatorReady = false;
        game.joinerReady = false;
        
        // Initialize round
        initializeRound(gameId, newRound);
        
        // Creator hides first
        game.creatorHiding = true;
        game.currentHider = game.creator;
        game.currentSeeker = game.joiner;
        game.status = GameStatus.Hiding;
        game.hideStartTime = block.timestamp;
    }
    
    function initializeRound(uint256 gameId, uint256 roundNum) internal {
        Round storage round = rounds[gameId][roundNum];
        round.creatorHideBox = 0;
        round.joinerHideBox = 0;
        round.creatorFindBox = 0;
        round.joinerFindBox = 0;
        round.creatorFound = false;
        round.joinerFound = false;
        round.creatorScore = 0;
        round.joinerScore = 0;
        round.completed = false;
    }
    
    function hideCoin(uint256 gameId, uint8 box) external validGame(gameId) {
        require(box >= 1 && box <= 9, "Invalid box (1-9)");
        
        Game storage game = games[gameId];
        require(game.status == GameStatus.Hiding, "Not in hiding phase");
        require(msg.sender == game.currentHider, "Not your turn to hide");
        require(block.timestamp <= game.hideStartTime + HIDE_DURATION, "Hiding time expired");
        
        // Check if box was used before
        checkBoxAvailable(gameId, msg.sender, game.currentRound, box);
        
        // Set hide box
        setHideBox(gameId, game.currentRound, game.creatorHiding, box);
        
        // Add to history
        playerHistory[gameId][msg.sender].usedBoxes.push(box);
        
        emit CoinHidden(gameId, game.currentRound, msg.sender, box);
        
        // Move to finding phase
        game.status = GameStatus.Finding;
        game.findStartTime = block.timestamp;
        game.currentHideBox = box;
    }
    
    function checkBoxAvailable(uint256 gameId, address player, uint256 currentRound, uint8 box) internal view {
        if (currentRound > 1) {
            PlayerHistory storage history = playerHistory[gameId][player];
            for (uint i = 0; i < history.usedBoxes.length; i++) {
                require(history.usedBoxes[i] != box, "Cannot hide in same box as previous round");
            }
        }
    }
    
    function setHideBox(uint256 gameId, uint256 roundNum, bool creatorHiding, uint8 box) internal {
        Round storage round = rounds[gameId][roundNum];
        
        if (creatorHiding) {
            require(round.creatorHideBox == 0, "Already hid coin");
            round.creatorHideBox = box;
        } else {
            require(round.joinerHideBox == 0, "Already hid coin");
            round.joinerHideBox = box;
        }
    }
    
    function findCoin(uint256 gameId, uint8 box) external validGame(gameId) {
        require(box >= 1 && box <= 9, "Invalid box (1-9)");
        
        Game storage game = games[gameId];
        require(game.status == GameStatus.Finding, "Not in finding phase");
        require(msg.sender == game.currentSeeker, "Not your turn to find");
        require(block.timestamp <= game.findStartTime + FIND_DURATION, "Finding time expired");
        
        bool found = (box == game.currentHideBox);
        
        // Record find attempt and update score
        recordFindAttempt(gameId, game.currentRound, game.creatorHiding, box, found);
        
        emit CoinFound(gameId, game.currentRound, msg.sender, box, found);
        
        // Check if round is complete
        checkRoundComplete(gameId);
    }
    
    function recordFindAttempt(uint256 gameId, uint256 roundNum, bool creatorHiding, uint8 box, bool found) internal {
        Round storage round = rounds[gameId][roundNum];
        
        if (creatorHiding) {
            // Creator is hiding, joiner is seeking
            require(round.joinerFindBox == 0, "Already tried to find");
            round.joinerFindBox = box;
            round.joinerFound = found;
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
            if (found) {
                round.creatorScore++;
            } else {
                round.joinerScore++;
            }
        }
    }
    
    function checkRoundComplete(uint256 gameId) internal {
        uint256 roundNum = games[gameId].currentRound;
        
        // Check if round is complete
        if (isRoundComplete(gameId, roundNum)) {
            completeRound(gameId, roundNum);
        } else {
            switchRoles(gameId);
        }
    }
    
    function isRoundComplete(uint256 gameId, uint256 roundNum) internal view returns (bool) {
        Round storage round = rounds[gameId][roundNum];
        return (round.creatorHideBox != 0 && round.joinerHideBox != 0 && 
                round.creatorFindBox != 0 && round.joinerFindBox != 0);
    }
    
    function completeRound(uint256 gameId, uint256 roundNum) internal {
        Game storage game = games[gameId];
        Round storage round = rounds[gameId][roundNum];
        
        round.completed = true;
        game.status = GameStatus.RoundComplete;
        
        uint256 creatorScore = round.creatorScore;
        uint256 joinerScore = round.joinerScore;
        
        emit RoundComplete(gameId, roundNum, creatorScore, joinerScore);
        
        // Check for winner
        if (creatorScore >= WIN_SCORE) {
            finishGame(gameId, game.creator);
        } else if (joinerScore >= WIN_SCORE) {
            finishGame(gameId, game.joiner);
        } else {
            startNewRound(gameId);
        }
    }
    
    function switchRoles(uint256 gameId) internal {
        Game storage game = games[gameId];
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
    
    function finishGame(uint256 gameId, address winner) internal {
        Game storage game = games[gameId];
        game.status = GameStatus.Finished;
        uint256 reward = game.stake;
        game.stake = 0;
        
        payable(winner).transfer(reward);
        
        emit GameFinished(gameId, winner, reward);
    }
    
    // Individual getters to avoid stack too deep
    function getGameCreator(uint256 gameId) external view returns (address) {
        return games[gameId].creator;
    }
    
    function getGameJoiner(uint256 gameId) external view returns (address) {
        return games[gameId].joiner;
    }
    
    function getGameStake(uint256 gameId) external view returns (uint256) {
        return games[gameId].stake;
    }
    
    function getGameCurrentRound(uint256 gameId) external view returns (uint256) {
        return games[gameId].currentRound;
    }
    
    function getGameStatus(uint256 gameId) external view returns (GameStatus) {
        return games[gameId].status;
    }
    
    function getGameCreatorReady(uint256 gameId) external view returns (bool) {
        return games[gameId].creatorReady;
    }
    
    function getGameJoinerReady(uint256 gameId) external view returns (bool) {
        return games[gameId].joinerReady;
    }
    
    function getGameCurrentHider(uint256 gameId) external view returns (address) {
        return games[gameId].currentHider;
    }
    
    function getGameCurrentSeeker(uint256 gameId) external view returns (address) {
        return games[gameId].currentSeeker;
    }
    
    function getGameCurrentHideBox(uint256 gameId) external view returns (uint8) {
        return games[gameId].currentHideBox;
    }
    
    function getGameCreatorHiding(uint256 gameId) external view returns (bool) {
        return games[gameId].creatorHiding;
    }
    
    function getRoundCreatorScore(uint256 gameId, uint256 roundNum) external view returns (uint256) {
        return rounds[gameId][roundNum].creatorScore;
    }
    
    function getRoundJoinerScore(uint256 gameId, uint256 roundNum) external view returns (uint256) {
        return rounds[gameId][roundNum].joinerScore;
    }
    
    function getRoundCompleted(uint256 gameId, uint256 roundNum) external view returns (bool) {
        return rounds[gameId][roundNum].completed;
    }
    
    function getRoundCreatorHideBox(uint256 gameId, uint256 roundNum) external view returns (uint8) {
        return rounds[gameId][roundNum].creatorHideBox;
    }
    
    function getRoundJoinerHideBox(uint256 gameId, uint256 roundNum) external view returns (uint8) {
        return rounds[gameId][roundNum].joinerHideBox;
    }
    
    function getRoundCreatorFindBox(uint256 gameId, uint256 roundNum) external view returns (uint8) {
        return rounds[gameId][roundNum].creatorFindBox;
    }
    
    function getRoundJoinerFindBox(uint256 gameId, uint256 roundNum) external view returns (uint8) {
        return rounds[gameId][roundNum].joinerFindBox;
    }
    
    function getRoundCreatorFound(uint256 gameId, uint256 roundNum) external view returns (bool) {
        return rounds[gameId][roundNum].creatorFound;
    }
    
    function getRoundJoinerFound(uint256 gameId, uint256 roundNum) external view returns (bool) {
        return rounds[gameId][roundNum].joinerFound;
    }
    
    function getPlayerHistory(uint256 gameId, address player) external view returns (uint8[] memory) {
        return playerHistory[gameId][player].usedBoxes;
    }
    
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }
}