// Web3 and Contract Configuration
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Deploy and update this
const CONTRACT_ABI = [
    "function createGame() external payable returns (uint256)",
    "function joinGame(uint256 gameId) external payable",
    "function setHideLocation(uint256 gameId, bytes32 locationHash) external",
    "function revealLocation(uint256 gameId, uint256 location, string memory secret) external",
    "function claimFound(uint256 gameId, uint256 location) external",
    "function claimTimeout(uint256 gameId) external",
    "function getGame(uint256 gameId) external view returns (address hider, address seeker, uint256 stake, uint256 hideTime, uint256 seekTime, uint8 status, bool hiderRevealed)",
    "function getPlayerGames(address player) external view returns (uint256[] memory)",
    "function gameCounter() external view returns (uint256)",
    "event GameCreated(uint256 indexed gameId, address indexed hider, uint256 stake)",
    "event SeekerJoined(uint256 indexed gameId, address indexed seeker)",
    "event HideLocationSet(uint256 indexed gameId, bytes32 locationHash)",
    "event LocationRevealed(uint256 indexed gameId, uint256 location)",
    "event GameWon(uint256 indexed gameId, address winner, uint256 amount)",
    "event GameTimeout(uint256 indexed gameId, address winner, uint256 amount)"
];

let provider, signer, contract, userAddress;

// Base Network Configuration
const BASE_MAINNET = {
    chainId: '0x2105', // 8453
    chainName: 'Base',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
};

const BASE_TESTNET = {
    chainId: '0x14a34', // 84532
    chainName: 'Base Sepolia',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org']
};

// Initialize Web3
async function initWeb3() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    
    // Check if on Base network
    const network = await provider.getNetwork();
    if (network.chainId !== 8453n && network.chainId !== 84532n) {
        await switchToBase();
    }
    
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return { provider, signer, contract, userAddress };
}

// Connect Wallet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return await initWeb3();
    } catch (error) {
        throw new Error('Failed to connect wallet: ' + error.message);
    }
}

// Switch to Base Network
async function switchToBase() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_MAINNET.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [BASE_MAINNET],
                });
            } catch (addError) {
                throw new Error('Failed to add Base network');
            }
        } else {
            throw switchError;
        }
    }
}

// Contract Functions
async function createGame(stakeAmount) {
    try {
        const tx = await contract.createGame({
            value: ethers.utils.parseEther(stakeAmount.toString())
        });
        const receipt = await tx.wait();
        
        // Get game ID from event
        const event = receipt.events.find(e => e.event === 'GameCreated');
        return event.args.gameId.toNumber();
    } catch (error) {
        throw new Error('Failed to create game: ' + error.message);
    }
}

async function joinGame(gameId, stakeAmount) {
    try {
        const tx = await contract.joinGame(gameId, {
            value: ethers.utils.parseEther(stakeAmount.toString())
        });
        await tx.wait();
        return true;
    } catch (error) {
        throw new Error('Failed to join game: ' + error.message);
    }
}

async function setHideLocation(gameId, location, secret) {
    try {
        const locationHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'string'],
                [location, secret]
            )
        );
        const tx = await contract.setHideLocation(gameId, locationHash);
        await tx.wait();
        return true;
    } catch (error) {
        throw new Error('Failed to set hide location: ' + error.message);
    }
}

async function revealLocation(gameId, location, secret) {
    try {
        // Use same encoding as setHideLocation
        const tx = await contract.revealLocation(gameId, location, secret);
        await tx.wait();
        return true;
    } catch (error) {
        throw new Error('Failed to reveal location: ' + error.message);
    }
}

async function claimFound(gameId, location) {
    try {
        const tx = await contract.claimFound(gameId, location);
        await tx.wait();
        return true;
    } catch (error) {
        throw new Error('Failed to claim found: ' + error.message);
    }
}

async function claimTimeout(gameId) {
    try {
        const tx = await contract.claimTimeout(gameId);
        await tx.wait();
        return true;
    } catch (error) {
        throw new Error('Failed to claim timeout: ' + error.message);
    }
}

async function getGame(gameId) {
    try {
        const game = await contract.getGame(gameId);
        return {
            hider: game.hider,
            seeker: game.seeker,
            stake: ethers.utils.formatEther(game.stake),
            hideTime: game.hideTime.toNumber(),
            seekTime: game.seekTime.toNumber(),
            status: game.status,
            hiderRevealed: game.hiderRevealed
        };
    } catch (error) {
        throw new Error('Failed to get game: ' + error.message);
    }
}

async function getPlayerGames(playerAddress) {
    try {
        const games = await contract.getPlayerGames(playerAddress);
        return games.map(g => g.toNumber());
    } catch (error) {
        throw new Error('Failed to get player games: ' + error.message);
    }
}

async function getGameCounter() {
    try {
        const counter = await contract.gameCounter();
        return counter.toNumber();
    } catch (error) {
        return 0;
    }
}

async function getBalance(address) {
    try {
        const balance = await provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    } catch (error) {
        return '0';
    }
}

// Utility Functions
function formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusText(status) {
    const statuses = ['Waiting', 'Hiding', 'Seeking', 'Found', 'Timeout'];
    return statuses[status] || 'Unknown';
}

function formatTime(timestamp) {
    if (!timestamp || timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initWeb3,
        connectWallet,
        createGame,
        joinGame,
        setHideLocation,
        revealLocation,
        claimFound,
        claimTimeout,
        getGame,
        getPlayerGames,
        getGameCounter,
        getBalance,
        formatAddress,
        getStatusText,
        formatTime
    };
}

