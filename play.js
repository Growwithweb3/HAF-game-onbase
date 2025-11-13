// Coin Hide & Find Game Logic
let currentGameId = null;
let gameInterval = null;
let timerInterval = null;
let userAddress = null;
let contract = null;

// Initialize game page
async function initializeGame() {
    try {
        // Get game ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentGameId = parseInt(urlParams.get('id'));
        
        if (!currentGameId) {
            showError('No game ID provided');
            setTimeout(() => window.location.href = 'game.html', 2000);
            return;
        }
        
        // Initialize Web3
        await initWeb3();
        userAddress = (await provider.getSigner()).getAddress();
        
        // Initialize contract (will need new ABI)
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Create game board
        createGameBoard();
        
        // Start game loop
        startGameLoop();
        
        // Update balance
        updateBalance();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize game: ' + error.message);
    }
}

// Create 3x3 game board
function createGameBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
        const box = document.createElement('div');
        box.className = 'game-box';
        box.id = `box-${i}`;
        box.dataset.box = i;
        box.textContent = i;
        box.addEventListener('click', () => handleBoxClick(i));
        board.appendChild(box);
    }
}

// Handle box click
async function handleBoxClick(boxNum) {
    const box = document.getElementById(`box-${boxNum}`);
    if (box.classList.contains('disabled')) return;
    
    try {
        const game = await getGame(currentGameId);
        
        if (game.status === 2) { // Hiding phase
            await hideCoin(boxNum);
        } else if (game.status === 3) { // Finding phase
            await findCoin(boxNum);
        }
    } catch (error) {
        showError(error.message);
    }
}

// Get game data (using individual getters to avoid stack too deep)
async function getGame(gameId) {
    try {
        const [
            creator, joiner, stake, currentRound, status,
            creatorReady, joinerReady,
            currentHider, currentSeeker, currentHideBox, creatorHiding
        ] = await Promise.all([
            contract.getGameCreator(gameId),
            contract.getGameJoiner(gameId),
            contract.getGameStake(gameId),
            contract.getGameCurrentRound(gameId),
            contract.getGameStatus(gameId),
            contract.getGameCreatorReady(gameId),
            contract.getGameJoinerReady(gameId),
            contract.getGameCurrentHider(gameId),
            contract.getGameCurrentSeeker(gameId),
            contract.getGameCurrentHideBox(gameId),
            contract.getGameCreatorHiding(gameId)
        ]);
        
        return {
            creator,
            joiner,
            stake: ethers.utils.formatEther(stake),
            currentRound: currentRound.toNumber(),
            status,
            creatorReady,
            joinerReady,
            currentHider,
            currentSeeker,
            currentHideBox,
            creatorHiding
        };
    } catch (error) {
        throw new Error('Failed to get game: ' + error.message);
    }
}

// Set ready
async function setReady() {
    try {
        showLoading('Setting ready...');
        const tx = await contract.setReady(currentGameId);
        await tx.wait();
        showSuccess('You are ready! Waiting for opponent...');
        await updateGameState();
    } catch (error) {
        showError('Failed to set ready: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Hide coin
async function hideCoin(boxNum) {
    try {
        showLoading('Hiding coin...');
        const tx = await contract.hideCoin(currentGameId, boxNum);
        await tx.wait();
        showSuccess(`Coin hidden in box ${boxNum}!`);
        await updateGameState();
    } catch (error) {
        showError('Failed to hide coin: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Find coin
async function findCoin(boxNum) {
    try {
        showLoading('Searching for coin...');
        const tx = await contract.findCoin(currentGameId, boxNum);
        const receipt = await tx.wait();
        
        // Check if found from events
        const foundEvent = receipt.events.find(e => e.event === 'CoinFound');
        const found = foundEvent && foundEvent.args.found;
        
        if (found) {
            showSuccess(`🎉 Found it! Box ${boxNum} was correct!`);
        } else {
            showError(`❌ Wrong box! The coin was not in box ${boxNum}`);
        }
        
        await updateGameState();
    } catch (error) {
        showError('Failed to find coin: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Update game state
async function updateGameState() {
    try {
        const game = await getGame(currentGameId);
        
        // Update display
        document.getElementById('gameIdDisplay').textContent = currentGameId;
        document.getElementById('currentRound').textContent = game.currentRound || 1;
        document.getElementById('gameStake').textContent = formatEth(game.stake);
        
        // Update addresses
        document.getElementById('creatorAddress').textContent = formatAddress(game.creator);
        document.getElementById('joinerAddress').textContent = game.joiner !== ethers.constants.AddressZero ? formatAddress(game.joiner) : 'Waiting...';
        
        // Highlight current player
        const isCreator = game.creator.toLowerCase() === userAddress.toLowerCase();
        const isJoiner = game.joiner !== ethers.constants.AddressZero && game.joiner.toLowerCase() === userAddress.toLowerCase();
        
        document.getElementById('creatorScore').classList.toggle('you', isCreator);
        document.getElementById('joinerScore').classList.toggle('you', isJoiner);
        
        // Update scores
        if (game.currentRound > 0) {
            const round = await getRound(currentGameId, game.currentRound);
            document.getElementById('creatorScoreValue').textContent = round.creatorScore.toString();
            document.getElementById('joinerScoreValue').textContent = round.joinerScore.toString();
        }
        
        // Handle different game states
        if (game.status === 0) { // Waiting
            document.getElementById('gamePhase').textContent = '⏳ Waiting for player to join...';
            document.getElementById('readySection').style.display = 'none';
            document.getElementById('timerSection').style.display = 'none';
        } else if (game.status === 1) { // Ready
            document.getElementById('gamePhase').textContent = '✅ Both players ready! Game starting...';
            document.getElementById('readySection').style.display = 'block';
            document.getElementById('timerSection').style.display = 'none';
            
            // Update ready status
            document.getElementById('creatorReadyText').textContent = game.creatorReady ? '✅ Ready' : '⏳ Waiting';
            document.getElementById('joinerReadyText').textContent = game.joinerReady ? '✅ Ready' : '⏳ Waiting';
            document.getElementById('creatorReadyStatus').className = 'ready-status ' + (game.creatorReady ? 'ready' : 'waiting');
            document.getElementById('joinerReadyStatus').className = 'ready-status ' + (game.joinerReady ? 'ready' : 'waiting');
            
            // Show ready button if not ready
            const readyBtn = document.getElementById('readyBtn');
            if ((isCreator && !game.creatorReady) || (isJoiner && !game.joinerReady)) {
                readyBtn.style.display = 'block';
                readyBtn.onclick = setReady;
            } else {
                readyBtn.style.display = 'none';
            }
        } else if (game.status === 2) { // Hiding
            const isYourTurn = game.currentHider.toLowerCase() === userAddress.toLowerCase();
            document.getElementById('gamePhase').textContent = isYourTurn ? 
                '🎯 Your turn to HIDE the coin! Click any box (15 seconds)' : 
                '⏳ Waiting for opponent to hide coin...';
            
            document.getElementById('readySection').style.display = 'none';
            document.getElementById('timerSection').style.display = 'block';
            document.getElementById('timerLabel').textContent = isYourTurn ? 'Hide the coin!' : 'Opponent is hiding...';
            
            // Enable/disable boxes
            enableBoxes(isYourTurn);
            startTimer(15, 'hide');
        } else if (game.status === 3) { // Finding
            const isYourTurn = game.currentSeeker.toLowerCase() === userAddress.toLowerCase();
            document.getElementById('gamePhase').textContent = isYourTurn ? 
                '🔍 Your turn to FIND the coin! Click a box (10 seconds)' : 
                '⏳ Waiting for opponent to find coin...';
            
            document.getElementById('readySection').style.display = 'none';
            document.getElementById('timerSection').style.display = 'block';
            document.getElementById('timerLabel').textContent = isYourTurn ? 'Find the coin!' : 'Opponent is searching...';
            
            // Enable/disable boxes
            enableBoxes(isYourTurn);
            startTimer(10, 'find');
        } else if (game.status === 4) { // Round Complete
            document.getElementById('gamePhase').textContent = '🎉 Round Complete!';
            document.getElementById('readySection').style.display = 'none';
            document.getElementById('timerSection').style.display = 'none';
            disableAllBoxes();
        } else if (game.status === 5) { // Finished
            document.getElementById('gamePhase').textContent = '🏆 Game Finished!';
            document.getElementById('readySection').style.display = 'none';
            document.getElementById('timerSection').style.display = 'none';
            disableAllBoxes();
        }
        
    } catch (error) {
        console.error('Error updating game state:', error);
    }
}

// Get round data (using individual getters)
async function getRound(gameId, roundNum) {
    try {
        const [
            creatorScore, joinerScore, completed,
            creatorHideBox, joinerHideBox,
            creatorFindBox, joinerFindBox,
            creatorFound, joinerFound
        ] = await Promise.all([
            contract.getRoundCreatorScore(gameId, roundNum),
            contract.getRoundJoinerScore(gameId, roundNum),
            contract.getRoundCompleted(gameId, roundNum),
            contract.getRoundCreatorHideBox(gameId, roundNum),
            contract.getRoundJoinerHideBox(gameId, roundNum),
            contract.getRoundCreatorFindBox(gameId, roundNum),
            contract.getRoundJoinerFindBox(gameId, roundNum),
            contract.getRoundCreatorFound(gameId, roundNum),
            contract.getRoundJoinerFound(gameId, roundNum)
        ]);
        
        return {
            creatorHideBox,
            joinerHideBox,
            creatorFindBox,
            joinerFindBox,
            creatorFound,
            joinerFound,
            creatorScore: creatorScore.toNumber(),
            joinerScore: joinerScore.toNumber(),
            completed
        };
    } catch (error) {
        return {
            creatorHideBox: 0,
            joinerHideBox: 0,
            creatorFindBox: 0,
            joinerFindBox: 0,
            creatorFound: false,
            joinerFound: false,
            creatorScore: 0,
            joinerScore: 0,
            completed: false
        };
    }
}

// Enable/disable boxes
function enableBoxes(enabled) {
    for (let i = 1; i <= 9; i++) {
        const box = document.getElementById(`box-${i}`);
        if (enabled) {
            box.classList.remove('disabled');
        } else {
            box.classList.add('disabled');
        }
    }
}

function disableAllBoxes() {
    enableBoxes(false);
}

// Start timer
function startTimer(seconds, type) {
    if (timerInterval) clearInterval(timerInterval);
    
    let timeLeft = seconds;
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.textContent = timeLeft;
    timerDisplay.className = 'timer';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerDisplay.className = 'timer danger';
        } else if (timeLeft <= 10) {
            timerDisplay.className = 'timer warning';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = '00';
            timerDisplay.className = 'timer danger';
        }
    }, 1000);
}

// Start game loop
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    updateGameState();
    gameInterval = setInterval(updateGameState, 3000); // Update every 3 seconds
}

// Utility functions
function formatEth(amount) {
    const num = parseFloat(amount);
    if (num === 0) return '0 ETH';
    if (num < 0.0001) {
        return num.toFixed(8).replace(/\.?0+$/, '') + ' ETH';
    }
    return num.toFixed(6).replace(/\.?0+$/, '') + ' ETH';
}

function formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showError(message) {
    console.error(message);
    alert(message);
}

function showSuccess(message) {
    console.log(message);
    // Could add toast notification here
}

function showLoading(message) {
    console.log(message);
}

function hideLoading() {
    // Hide loading indicator
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

