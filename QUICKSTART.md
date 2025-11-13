# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Deploy Smart Contract

1. Create a `.env` file in the root directory:
```
PRIVATE_KEY=your_private_key_here
```

2. Deploy to Base network:
```bash
npx hardhat run scripts/deploy.js --network base
```

3. Copy the deployed contract address from the output

### Step 3: Update Contract Address

Update `CONTRACT_ADDRESS` in these files:
- `script.js` (line 2)
- `server.js` (line 12)

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Open in Browser
Navigate to: `http://localhost:3000`

## 🎮 How to Play

1. **Connect MetaMask** - Click "Connect MetaMask" on the login page
2. **Switch to Base Network** - The app will prompt you if needed
3. **Create or Join a Game**:
   - Click "Create Game" to start a new game
   - Or click "Join Game" to join an existing one
4. **Play**:
   - **Hider**: Set a location (1-100) and secret key
   - **Seeker**: Wait for location reveal, then claim if you found it
5. **Win**: Winner takes all staked ETH!

## 📝 Important Notes

- Minimum stake: 0.01 ETH
- Hide phase: 5 minutes
- Seek phase: 10 minutes
- All transactions are on-chain and transparent
- Make sure you have ETH on Base network for gas fees

## 🔧 Troubleshooting

**MetaMask not connecting?**
- Make sure MetaMask is installed
- Check if popup is blocked
- Try refreshing the page

**Contract not found?**
- Verify contract address is correct
- Make sure contract is deployed on Base network
- Check browser console for errors

**Transaction failing?**
- Ensure you have enough ETH for gas
- Check if you're on the correct network (Base)
- Verify you have enough balance for the stake

## 🆘 Need Help?

Check the main README.md for detailed documentation.

