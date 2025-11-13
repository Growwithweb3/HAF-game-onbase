// Web3 and Contract Configuration
const CONTRACT_ADDRESS = '0x07Ce2990f2EBc8D315C5e2119C2d32c30DC99072';
const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seeker",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "box",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "found",
				"type": "bool"
			}
		],
		"name": "CoinFound",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "hider",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "box",
				"type": "uint8"
			}
		],
		"name": "CoinHidden",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "createGame",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "box",
				"type": "uint8"
			}
		],
		"name": "findCoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stake",
				"type": "uint256"
			}
		],
		"name": "GameCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "GameFinished",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "box",
				"type": "uint8"
			}
		],
		"name": "hideCoin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "joinGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "joiner",
				"type": "address"
			}
		],
		"name": "PlayerJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "PlayerReady",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "round",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "creatorScore",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "joinerScore",
				"type": "uint256"
			}
		],
		"name": "RoundComplete",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "setReady",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FIND_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "gameCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "games",
		"outputs": [
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "joiner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "stake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRounds",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentRound",
				"type": "uint256"
			},
			{
				"internalType": "enum CoinHideGame.GameStatus",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "creatorReady",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "joinerReady",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "hideStartTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "findStartTime",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "currentHider",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "currentSeeker",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "currentHideBox",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "creatorHiding",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCreator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCreatorHiding",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCreatorReady",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCurrentHideBox",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCurrentHider",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCurrentRound",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameCurrentSeeker",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameJoiner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameJoinerReady",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			}
		],
		"name": "getGameStatus",
		"outputs": [
			{
				"internalType": "enum CoinHideGame.GameStatus",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerGames",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerHistory",
		"outputs": [
			{
				"internalType": "uint8[]",
				"name": "",
				"type": "uint8[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundCompleted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundCreatorFindBox",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundCreatorFound",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundCreatorHideBox",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundCreatorScore",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundJoinerFindBox",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundJoinerFound",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundJoinerHideBox",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "gameId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "roundNum",
				"type": "uint256"
			}
		],
		"name": "getRoundJoinerScore",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "HIDE_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_STAKE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "playerGames",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rounds",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "creatorHideBox",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "joinerHideBox",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "creatorFindBox",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "joinerFindBox",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "creatorFound",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "joinerFound",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "creatorScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "joinerScore",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WIN_SCORE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
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

async function getContractBalance() {
    try {
        const balance = await provider.getBalance(CONTRACT_ADDRESS);
        return ethers.utils.formatEther(balance);
    } catch (error) {
        throw new Error('Failed to get contract balance: ' + error.message);
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

window.ALLOWED_STAKES = ['0.00001', '0.0001', '0.001'];

