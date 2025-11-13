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
app.use(express.static('.'));

// Base RPC Provider
const BASE_RPC = 'https://mainnet.base.org';
const provider = new ethers.providers.JsonRpcProvider(BASE_RPC);

// Contract Configuration (Update with deployed contract address)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = [
    "function gameCounter() external view returns (uint256)",
    "function getGame(uint256 gameId) external view returns (address hider, address seeker, uint256 stake, uint256 hideTime, uint256 seekTime, uint8 status, bool hiderRevealed)",
    "function getPlayerGames(address player) external view returns (uint256[] memory)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// API Routes

// Get all available games
app.get('/api/games/available', async (req, res) => {
    try {
        const counter = await contract.gameCounter();
        const games = [];
        
        for (let i = 1; i <= counter; i++) {
            try {
                const game = await contract.getGame(i);
                if (game.status === 0 && game.seeker === ethers.constants.AddressZero) {
                    games.push({
                        id: i,
                        hider: game.hider,
                        seeker: game.seeker,
                        stake: ethers.utils.formatEther(game.stake),
                        hideTime: game.hideTime.toNumber(),
                        seekTime: game.seekTime.toNumber(),
                        status: game.status,
                        hiderRevealed: game.hiderRevealed
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
                const game = await contract.getGame(i);
                if (game.status > 0 && game.status < 3) {
                    games.push({
                        id: i,
                        hider: game.hider,
                        seeker: game.seeker,
                        stake: ethers.utils.formatEther(game.stake),
                        hideTime: game.hideTime.toNumber(),
                        seekTime: game.seekTime.toNumber(),
                        status: game.status,
                        hiderRevealed: game.hiderRevealed
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
                const game = await contract.getGame(gameId);
                games.push({
                    id: gameId.toNumber(),
                    hider: game.hider,
                    seeker: game.seeker,
                    stake: ethers.utils.formatEther(game.stake),
                    hideTime: game.hideTime.toNumber(),
                    seekTime: game.seekTime.toNumber(),
                    status: game.status,
                    hiderRevealed: game.hiderRevealed
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
        const game = await contract.getGame(gameId);
        
        res.json({
            success: true,
            game: {
                id: gameId,
                hider: game.hider,
                seeker: game.seeker,
                stake: ethers.utils.formatEther(game.stake),
                hideTime: game.hideTime.toNumber(),
                seekTime: game.seekTime.toNumber(),
                status: game.status,
                hiderRevealed: game.hiderRevealed
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
                const game = await contract.getGame(i);
                if (game.status > 0 && game.status < 3) {
                    activeCount++;
                    totalStaked = totalStaked.add(game.stake);
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Serve frontend
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

