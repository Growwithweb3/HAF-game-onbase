// Game Logic and UI Management
let currentGameId = null;
let allGames = [];
let myGameIds = [];

const ALLOWED_STAKES = (window.ALLOWED_STAKES || ['0.00001', '0.0001', '0.001']);
const ACCESS_CODE_LENGTH = 6;
const BACKEND_URL = 'https://haf-game-onbase-production.up.railway.app';

function generateAccessCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < ACCESS_CODE_LENGTH; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function saveGameAccessCode(gameId, code) {
    const response = await fetch(`${BACKEND_URL}/api/games/${gameId}/code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to save access code');
    }
}

async function verifyGameAccessCode(gameId, code) {
    const response = await fetch(`${BACKEND_URL}/api/games/${gameId}/verify-code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to verify access code');
    }

    const payload = await response.json();
    if (!payload.success || !payload.valid) {
        throw new Error(payload.message || 'Invalid access code');
    }
}

async function initializeGamePage() {
    try {
        await initWeb3();
        await loadGameData();
        setupEventListeners();
        setupTabs();
        startAutoRefresh();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize. Please refresh the page.');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGamePage);
} else {
    initializeGamePage();
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Action buttons
    document.getElementById('createGameBtn').addEventListener('click', () => openCreateModal());
    document.getElementById('joinGameBtn').addEventListener('click', () => openJoinModal());
    document.getElementById('myGamesBtn').addEventListener('click', () => switchTab('my-games'));
    document.getElementById('refreshBtn').addEventListener('click', () => loadGameData());
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', () => closeModal('gameModal'));
    document.getElementById('cancelCreateBtn').addEventListener('click', () => closeModal('createModal'));
    document.getElementById('cancelJoinBtn').addEventListener('click', () => closeModal('joinModal'));
    document.getElementById('cancelHideBtn').addEventListener('click', () => closeModal('hideModal'));
    document.getElementById('cancelRevealBtn').addEventListener('click', () => closeModal('revealModal'));
    document.getElementById('cancelSeekBtn').addEventListener('click', () => closeModal('seekModal'));
    
    // Confirm buttons
    document.getElementById('confirmCreateBtn').addEventListener('click', () => handleCreateGame());
    document.getElementById('confirmJoinBtn').addEventListener('click', () => handleJoinGame());
    document.getElementById('confirmHideBtn').addEventListener('click', () => handleSetHideLocation());
    document.getElementById('confirmRevealBtn').addEventListener('click', () => handleRevealLocation());
    document.getElementById('confirmSeekBtn').addEventListener('click', () => handleClaimFound());
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Setup Tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const target = document.getElementById(targetTab + 'Tab');
            if (target) {
                target.classList.add('active');
            }
        });
    });
}

// Switch Tab
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const target = document.getElementById(tabName + 'Tab');
    if (target) {
        target.classList.add('active');
    }
}

// Load Game Data
async function loadGameData() {
    try {
        updateBalance();
        await loadAvailableGames();
        await loadActiveGames();
        await loadMyGames();
        updateStats();
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Load Available Games
async function loadAvailableGames() {
    const container = document.getElementById('availableGames');
    container.innerHTML = '<div class="loading">Loading games...</div>';
    
    try {
        const counter = await getGameCounter();
        const games = [];
        
        for (let i = 1; i <= counter; i++) {
            try {
                const game = await getGame(i);
                if (game.status === 0 && game.seeker === ethers.constants.AddressZero) {
                    games.push({ id: i, ...game });
                }
            } catch (e) {
                // Game doesn't exist or error
            }
        }
        
        allGames = games;
        renderGames(games, container);
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading games: ${error.message}</div>`;
    }
}

// Load Active Games
async function loadActiveGames() {
    const container = document.getElementById('activeGames');
    container.innerHTML = '<div class="loading">Loading active games...</div>';
    
    try {
        const counter = await getGameCounter();
        const games = [];
        
        for (let i = 1; i <= counter; i++) {
            try {
                const game = await getGame(i);
                if (game.status > 0 && game.status < 3) {
                    games.push({ id: i, ...game });
                }
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        renderGames(games, container);
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading games: ${error.message}</div>`;
    }
}

// Load My Games
async function loadMyGames() {
    const container = document.getElementById('myGames');
    container.innerHTML = '<div class="loading">Loading your games...</div>';
    
    try {
        myGameIds = await getPlayerGames(userAddress);
        const games = [];
        
        for (const gameId of myGameIds) {
            try {
                const game = await getGame(gameId);
                games.push({ id: gameId, ...game });
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        renderGames(games, container);
    } catch (error) {
        container.innerHTML = `<div class="error">Error loading games: ${error.message}</div>`;
    }
}

// Render Games
function renderGames(games, container) {
    if (games.length === 0) {
        container.innerHTML = '<div class="loading">No games found</div>';
        return;
    }
    
    container.innerHTML = games.map(game => createGameCard(game)).join('');
    
    // Add click listeners to game cards
    container.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-small')) {
                const gameId = parseInt(card.dataset.gameId);
                openGameModal(gameId);
            }
        });
    });
}

// Create Game Card
function createGameCard(game) {
    const statusText = getStatusText(game.status);
    const statusClass = `status-${statusText.toLowerCase()}`;
    const isMyGame = game.hider.toLowerCase() === userAddress.toLowerCase() || 
                     game.seeker.toLowerCase() === userAddress.toLowerCase();
    
    return `
        <div class="game-card" data-game-id="${game.id}">
            <div class="game-card-header">
                <span class="game-id">Game #${game.id}</span>
                <span class="game-status ${statusClass}">${statusText}</span>
            </div>
            <div class="game-info-item">
                <span>Hider:</span>
                <span>${formatAddress(game.hider)}</span>
            </div>
            ${game.seeker !== ethers.constants.AddressZero ? `
            <div class="game-info-item">
                <span>Seeker:</span>
                <span>${formatAddress(game.seeker)}</span>
            </div>
            ` : ''}
            <div class="game-info-item">
                <span>Stake:</span>
                <span class="game-stake">${parseFloat(game.stake).toFixed(4)} ETH</span>
            </div>
            ${isMyGame ? `
            <div class="game-actions">
                ${getGameActions(game)}
            </div>
            ` : ''}
        </div>
    `;
}

// Get Game Actions
function getGameActions(game) {
    const isHider = game.hider.toLowerCase() === userAddress.toLowerCase();
    const isSeeker = game.seeker.toLowerCase() === userAddress.toLowerCase();
    const actions = [];
    
    // Always show access code button for hider (if game is still active)
    if (isHider && (game.status === 0 || game.status === 1 || game.status === 2)) {
        actions.push('<button class="btn-small" onclick="event.stopPropagation(); generateAccessCodeForGame(' + game.id + ')">🔑 Get Access Code</button>');
    }
    
    if (game.status === 0 && isHider) {
        // Waiting for seeker - just show access code button (already added above)
        return actions.join('');
    }
    
    if (game.status === 1 && isHider) {
        // Hiding phase
        actions.push('<button class="btn-small" onclick="event.stopPropagation(); openHideModal(' + game.id + ')">Set Location</button>');
    }
    
    if (game.status === 2 && isHider && !game.hiderRevealed) {
        // Seeking phase, hider needs to reveal
        actions.push('<button class="btn-small" onclick="event.stopPropagation(); openRevealModal(' + game.id + ')">Reveal</button>');
    }
    
    if (game.status === 2 && isSeeker && game.hiderRevealed) {
        // Seeking phase, seeker can claim
        actions.push('<button class="btn-small" onclick="event.stopPropagation(); openSeekModal(' + game.id + ')">Claim Found</button>');
    }
    
    if (game.status === 1 || game.status === 2) {
        actions.push('<button class="btn-small" onclick="event.stopPropagation(); handleTimeout(' + game.id + ')">Claim Timeout</button>');
    }
    
    return actions.join('');
}

// Update Balance
async function updateBalance() {
    try {
        const balance = await getBalance(userAddress);
        document.getElementById('balanceValue').textContent = parseFloat(balance).toFixed(4) + ' ETH';
        document.getElementById('walletAddress').textContent = formatAddress(userAddress);
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

// Update Stats
function updateStats() {
    const activeCount = allGames.filter(g => g.status > 0 && g.status < 3).length;
    const totalStaked = allGames.reduce((sum, g) => sum + parseFloat(g.stake || 0), 0);
    
    document.getElementById('activeGamesCount').textContent = activeCount;
    document.getElementById('totalStaked').textContent = totalStaked.toFixed(4) + ' ETH';
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openCreateModal() {
    document.getElementById('stakeAmount').value = ALLOWED_STAKES[0];
    openModal('createModal');
}

function openJoinModal(gameId = null) {
    if (gameId) {
        document.getElementById('joinGameId').value = gameId;
    }
    document.getElementById('joinStakeAmount').value = ALLOWED_STAKES[0];
    openModal('joinModal');
}

function openHideModal(gameId) {
    currentGameId = gameId;
    openModal('hideModal');
}

function openRevealModal(gameId) {
    currentGameId = gameId;
    openModal('revealModal');
}

function openSeekModal(gameId) {
    currentGameId = gameId;
    openModal('seekModal');
}

function openGameModal(gameId) {
    currentGameId = gameId;
    // Load and display game details
    loadGameDetails(gameId);
    openModal('gameModal');
}

// Generate access code for existing game (exposed globally for onclick handlers)
window.generateAccessCodeForGame = async function(gameId) {
    try {
        const accessCode = generateAccessCode();
        
        // Try to save access code to backend
        try {
            await saveGameAccessCode(gameId, accessCode);
        } catch (saveError) {
            console.warn('Failed to save access code to backend:', saveError);
            // Continue anyway - we'll still show the code
        }
        
        // Show access code prominently
        const message = `🔑 Access Code for Game #${gameId}\n\n${accessCode}\n\nShare this code with your friend to join!`;
        showSuccess(message);
        
        // Also log to console for easy copying
        console.log(`\n🔑 ACCESS CODE FOR GAME #${gameId}\nAccess Code: ${accessCode}\n`);
    } catch (error) {
        showError('Failed to generate access code: ' + error.message);
    }
}

// Handle Actions
async function handleCreateGame() {
    try {
        const stakeValue = document.getElementById('stakeAmount').value;
        if (!ALLOWED_STAKES.includes(stakeValue)) {
            showError('Invalid stake amount');
            return;
        }
        const stakeAmount = parseFloat(stakeValue);

        showLoading('Creating game...');
        const gameId = await createGame(stakeAmount);
        const accessCode = generateAccessCode();
        
        // Try to save access code, but don't fail if it doesn't work
        try {
            await saveGameAccessCode(gameId, accessCode);
        } catch (saveError) {
            console.warn('Failed to save access code to backend:', saveError);
            // Continue anyway - we'll still show the code
        }
        
        closeModal('createModal');
        
        // Show access code prominently
        const message = `🎮 Game Created Successfully!\n\nGame ID: ${gameId}\n\n🔑 Access Code: ${accessCode}\n\nShare this code with your friend to join!`;
        showSuccess(message);
        
        // Also log to console for easy copying
        console.log(`\n🎮 GAME CREATED!\nGame ID: ${gameId}\nAccess Code: ${accessCode}\n`);
        
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleJoinGame() {
    try {
        const gameId = parseInt(document.getElementById('joinGameId').value);
        const stakeValue = document.getElementById('joinStakeAmount').value;
        const accessCodeInput = document.getElementById('joinGameCode').value.trim().toUpperCase();

        if (!gameId || !ALLOWED_STAKES.includes(stakeValue)) {
            showError('Invalid game ID or stake amount');
            return;
        }

        if (!accessCodeInput) {
            showError('Access code is required');
            return;
        }

        const stakeAmount = parseFloat(stakeValue);

        showLoading('Verifying access code...');
        await verifyGameAccessCode(gameId, accessCodeInput);

        showLoading('Joining game...');
        await joinGame(gameId, stakeAmount);
        closeModal('joinModal');
        showSuccess('Successfully joined game!');
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleSetHideLocation() {
    try {
        const location = parseInt(document.getElementById('hideLocation').value);
        const secret = document.getElementById('hideSecret').value;
        
        if (!location || location < 1 || location > 100 || !secret) {
            showError('Invalid location or secret');
            return;
        }
        
        showLoading('Setting hide location...');
        await setHideLocation(currentGameId, location, secret);
        closeModal('hideModal');
        showSuccess('Hide location set!');
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleRevealLocation() {
    try {
        const location = parseInt(document.getElementById('revealLocation').value);
        const secret = document.getElementById('revealSecret').value;
        
        if (!location || location < 1 || location > 100 || !secret) {
            showError('Invalid location or secret');
            return;
        }
        
        showLoading('Revealing location...');
        await revealLocation(currentGameId, location, secret);
        closeModal('revealModal');
        showSuccess('Location revealed!');
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleClaimFound() {
    try {
        const location = parseInt(document.getElementById('seekLocation').value);
        
        if (!location || location < 1 || location > 100) {
            showError('Invalid location');
            return;
        }
        
        showLoading('Claiming found...');
        await claimFound(currentGameId, location);
        closeModal('seekModal');
        showSuccess('Congratulations! You found it!');
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleTimeout(gameId) {
    try {
        if (!confirm('Are you sure you want to claim timeout?')) return;
        
        showLoading('Claiming timeout...');
        await claimTimeout(gameId);
        showSuccess('Timeout claimed!');
        await loadGameData();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Load Game Details
async function loadGameDetails(gameId) {
    try {
        const game = await getGame(gameId);
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Game #${gameId}</h2>
            <div class="game-info-item">
                <span>Status:</span>
                <span class="game-status status-${getStatusText(game.status).toLowerCase()}">${getStatusText(game.status)}</span>
            </div>
            <div class="game-info-item">
                <span>Hider:</span>
                <span>${formatAddress(game.hider)}</span>
            </div>
            <div class="game-info-item">
                <span>Seeker:</span>
                <span>${game.seeker !== ethers.constants.AddressZero ? formatAddress(game.seeker) : 'Waiting...'}</span>
            </div>
            <div class="game-info-item">
                <span>Stake:</span>
                <span class="game-stake">${parseFloat(game.stake).toFixed(4)} ETH</span>
            </div>
            <div class="game-info-item">
                <span>Hide Time:</span>
                <span>${formatTime(game.hideTime)}</span>
            </div>
            <div class="game-info-item">
                <span>Seek Time:</span>
                <span>${formatTime(game.seekTime)}</span>
            </div>
            <div class="game-info-item">
                <span>Location Revealed:</span>
                <span>${game.hiderRevealed ? 'Yes' : 'No'}</span>
            </div>
            ${game.hider.toLowerCase() === userAddress.toLowerCase() && (game.status === 0 || game.status === 1 || game.status === 2) ? `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border);">
                <button class="btn-primary" onclick="generateAccessCodeForGame(${gameId})" style="width: 100%;">
                    🔑 Get Access Code
                </button>
                <small style="display: block; margin-top: 10px; color: var(--text-secondary); text-align: center;">
                    Share this code with your friend to join the game
                </small>
            </div>
            ` : ''}
        `;
    } catch (error) {
        document.getElementById('modalBody').innerHTML = `<div class="error">Error loading game: ${error.message}</div>`;
    }
}

// Utility Functions
function showError(message) {
    // Create or update error notification
    let errorDiv = document.getElementById('errorNotification');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorNotification';
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2000; padding: 15px 20px; background: rgba(255, 51, 102, 0.9); border-radius: 10px;';
        document.body.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    let successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2000; padding: 15px 20px; background: rgba(0, 255, 136, 0.9); border-radius: 10px; color: black; font-weight: 600; max-width: 400px; white-space: pre-line; text-align: center; box-shadow: 0 4px 20px rgba(0, 255, 136, 0.5);';
    successDiv.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: transparent; border: none; color: black; font-size: 18px; cursor: pointer; padding: 0 5px;';
    closeBtn.onclick = () => successDiv.remove();
    successDiv.appendChild(closeBtn);
    
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 30000); // Show for 30 seconds for access code
}

function showLoading(message) {
    // Show loading indicator
    console.log(message);
}

function hideLoading() {
    // Hide loading indicator
}

// Auto Refresh
function startAutoRefresh() {
    setInterval(() => {
        loadGameData();
    }, 30000); // Refresh every 30 seconds
}

