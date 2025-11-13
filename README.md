# Hide & Seek - On-Chain Game

A fully transparent, on-chain hide and seek game built on Base blockchain with escrow smart contract.

## Features

- 🎮 **Fully On-Chain**: All game logic is transparent on the blockchain
- 🔒 **Escrow System**: Secure smart contract handles all stakes
- 🎨 **Gaming UI**: Modern, animated gaming-style interface
- 🦊 **MetaMask Integration**: Easy wallet connection
- ⚡ **Base Network**: Low gas fees on Base
- 📱 **Responsive Design**: Works on all devices

## Game Rules

1. **Create Game**: Hider creates a game and stakes ETH
2. **Join Game**: Seeker joins by matching the stake
3. **Hide Phase**: Hider has 5 minutes to set a location (1-100)
4. **Seek Phase**: Seeker has 10 minutes to find the location
5. **Reveal**: Hider reveals the location with secret key
6. **Claim**: Seeker claims if they found the correct location
7. **Winner**: Takes all staked ETH

## 🚀 Quick Start (Free Deployment)

**Want to deploy for FREE?** See our deployment guides:
- **[DEPLOY_QUICK.md](DEPLOY_QUICK.md)** - 3-step deployment (5 minutes)
- **[DEPLOY_FREE.md](DEPLOY_FREE.md)** - Complete free deployment guide
- **[GET_FREE_ETH.md](GET_FREE_ETH.md)** - How to get free testnet ETH

### Quick Deploy (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/hide-seek-game.git
   git push -u origin main
   ```

2. **Deploy to Vercel (FREE):**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import repository → Deploy
   - Done! You get a free URL

3. **Deploy Contract (FREE for testnet):**
   - Get free testnet ETH: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Deploy: `npx hardhat run scripts/deploy.js --network baseSepolia`
   - Update `CONTRACT_ADDRESS` in `script.js`

**Total cost: $0 for testnet, ~$0.50 for mainnet!**

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy Smart Contract

```bash
# Set your private key in .env file
export PRIVATE_KEY=your_private_key_here

# Deploy to Base (mainnet)
npx hardhat run scripts/deploy.js --network base

# OR deploy to Base Sepolia (testnet - FREE)
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 3. Update Contract Address

After deployment, update `CONTRACT_ADDRESS` in:
- `script.js` (required)
- `server.js` (optional, only if using backend)

### 4. Start Server (Optional - Game works without it!)

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:3000`

**Note:** The game works entirely client-side! The backend server is optional.

## Project Structure

```
├── contracts/
│   └── EscroGame.sol          # Smart contract
├── scripts/
│   └── deploy.js               # Deployment script
├── index.html                  # Login page
├── game.html                   # Game interface
├── script.js                   # Web3 integration
├── game.js                     # Game logic
├── style.css                   # Styling
├── server.js                   # Backend API
├── package.json                # Dependencies
└── hardhat.config.js          # Hardhat config
```

## Smart Contract Functions

- `createGame()` - Create a new game with stake
- `joinGame(gameId)` - Join an existing game
- `setHideLocation(gameId, locationHash)` - Set hide location
- `revealLocation(gameId, location, secret)` - Reveal location
- `claimFound(gameId, location)` - Claim victory
- `claimTimeout(gameId)` - Claim timeout reward

## API Endpoints

- `GET /api/games/available` - Get available games
- `GET /api/games/active` - Get active games
- `GET /api/games/player/:address` - Get player's games
- `GET /api/games/:gameId` - Get game details
- `GET /api/stats` - Get game statistics

## Environment Variables

Create a `.env` file:

```
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address
PORT=3000
```

## Security Notes

- Never commit your private key
- Test on testnet first
- Verify contract on BaseScan after deployment
- Use environment variables for sensitive data

## License

MIT

