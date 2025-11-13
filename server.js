// Node.js Backend Server
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Don't serve static files here - API routes must come first

// Base RPC Provider
const BASE_RPC = 'https://mainnet.base.org';
const provider = new ethers.providers.JsonRpcProvider(BASE_RPC);

// Contract Configuration (Update with deployed contract address)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x07Ce2990f2EBc8D315C5e2119C2d32c30DC99072';
const CONTRACT_ABI = [
    "function gameCounter() external view returns (uint256)",
    "function getGameCreator(uint256 gameId) external view returns (address)",
    "function getGameJoiner(uint256 gameId) external view returns (address)",
    "function getGameStake(uint256 gameId) external view returns (uint256)",
    "function getGameStatus(uint256 gameId) external view returns (uint8)",
    "function getPlayerGames(address player) external view returns (uint256[] memory)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

const ALLOWED_STAKES = ['0.00001', '0.0001', '0.001'];
const gameAccessCodes = new Map();

// API Routes

// Get all available games
app.get('/api/games/available', async (req, res) => {
    try {
        const counter = await contract.gameCounter();
        const games = [];
        
        for (let i = 1; i <= counter; i++) {
            try {
                const [creator, joiner, stake, status] = await Promise.all([
                    contract.getGameCreator(i),
                    contract.getGameJoiner(i),
                    contract.getGameStake(i),
                    contract.getGameStatus(i)
                ]);
                if (status === 0 && joiner === ethers.constants.AddressZero) {
                    games.push({
                        id: i,
                        creator: creator,
                        joiner: joiner,
                        stake: ethers.utils.formatEther(stake),
                        status: status
                    });
                }
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        res.json({ success: true, games });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all active games
app.get('/api/games/active', async (req, res) => {
    try {
        const counter = await contract.gameCounter();
        const games = [];
        
        for (let i = 1; i <= counter; i++) {
            try {
                const [creator, joiner, stake, status] = await Promise.all([
                    contract.getGameCreator(i),
                    contract.getGameJoiner(i),
                    contract.getGameStake(i),
                    contract.getGameStatus(i)
                ]);
                if (status > 0 && status < 4) {
                    games.push({
                        id: i,
                        creator: creator,
                        joiner: joiner,
                        stake: ethers.utils.formatEther(stake),
                        status: status
                    });
                }
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        res.json({ success: true, games });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get player games
app.get('/api/games/player/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const gameIds = await contract.getPlayerGames(address);
        const games = [];
        
        for (const gameId of gameIds) {
            try {
                const [creator, joiner, stake, status] = await Promise.all([
                    contract.getGameCreator(gameId),
                    contract.getGameJoiner(gameId),
                    contract.getGameStake(gameId),
                    contract.getGameStatus(gameId)
                ]);
                games.push({
                    id: gameId.toNumber(),
                    creator: creator,
                    joiner: joiner,
                    stake: ethers.utils.formatEther(stake),
                    status: status
                });
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        res.json({ success: true, games });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get game details
app.get('/api/games/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const [creator, joiner, stake, status] = await Promise.all([
            contract.getGameCreator(gameId),
            contract.getGameJoiner(gameId),
            contract.getGameStake(gameId),
            contract.getGameStatus(gameId)
        ]);
        
        res.json({
            success: true,
            game: {
                id: gameId,
                creator: creator,
                joiner: joiner,
                stake: ethers.utils.formatEther(stake),
                status: status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get game statistics
app.get('/api/stats', async (req, res) => {
    try {
        const counter = await contract.gameCounter();
        let activeCount = 0;
        let totalStaked = ethers.BigNumber.from(0);
        
        for (let i = 1; i <= counter; i++) {
            try {
                const [status, stake] = await Promise.all([
                    contract.getGameStatus(i),
                    contract.getGameStake(i)
                ]);
                if (status > 0 && status < 4) {
                    activeCount++;
                    totalStaked = totalStaked.add(stake);
                }
            } catch (e) {
                // Game doesn't exist
            }
        }
        
        res.json({
            success: true,
            stats: {
                totalGames: counter.toNumber(),
                activeGames: activeCount,
                totalStaked: ethers.utils.formatEther(totalStaked)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get config (allowed stakes + on-chain min stake)
app.get('/api/config', async (req, res) => {
    try {
        let minStakeWei;
        try {
            // Try to read on-chain MIN_STAKE (public const)
            minStakeWei = await contract.MIN_STAKE();
        } catch (e) {
            // If the ABI doesn't include MIN_STAKE in this server, fall back to 0.01 ETH default
            minStakeWei = ethers.BigNumber.from('10000000000000000');
        }
        res.json({
            success: true,
            allowedStakes: ALLOWED_STAKES,
            minStake: ethers.utils.formatEther(minStakeWei)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Validate a stake amount against backend policy (optional helper)
app.post('/api/validate-stake', (req, res) => {
    try {
        const { amount } = req.body || {};
        const isAllowed = typeof amount === 'string' && ALLOWED_STAKES.includes(amount);
        res.json({ success: true, isAllowed });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save game access code
app.post('/api/games/:gameId/code', (req, res) => {
    try {
        const { gameId } = req.params;
        const { code } = req.body || {};

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ success: false, error: 'Access code is required' });
        }

        const normalizedCode = code.trim().toUpperCase();
        if (!normalizedCode) {
            return res.status(400).json({ success: false, error: 'Access code is required' });
        }

        gameAccessCodes.set(gameId, {
            code: normalizedCode,
            createdAt: Date.now()
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify access code
app.post('/api/games/:gameId/verify-code', (req, res) => {
    try {
        const { gameId } = req.params;
        const { code } = req.body || {};

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ success: false, error: 'Access code is required' });
        }

        const record = gameAccessCodes.get(String(gameId));
        if (!record) {
            return res.status(404).json({ success: false, valid: false, message: 'No access code found for this game' });
        }

        const isValid = record.code === code.trim().toUpperCase();
        if (!isValid) {
            return res.status(403).json({ success: false, valid: false, message: 'Invalid access code' });
        }

        res.json({ success: true, valid: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Serve static files AFTER all API routes
app.use(express.static('.'));

// Serve frontend (fallback routes)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/game.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Connected to Base network: ${BASE_RPC}`);
    console.log(`📝 Contract address: ${CONTRACT_ADDRESS}`);
});

