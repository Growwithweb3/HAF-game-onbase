# 🎮 New Coin Hide & Find Game - Setup Guide

## ✅ What I Created

### 1. **New Smart Contract** (`contracts/CoinHideGame.sol`)
- 3x3 grid game (9 boxes)
- Round-based gameplay
- Scoring system
- Ready button system
- 15s hide timer, 10s find timer
- Prevents hiding in same box after draw
- Automatic winner determination

### 2. **New Game UI** (`play.html`)
- Beautiful 3x3 grid display
- Real-time timer
- Score board
- Ready button
- Game phase indicators

### 3. **Game Logic** (`play.js`)
- Handles all game interactions
- Timer management
- Blockchain integration
- Real-time updates

### 4. **Updated Game List** (`game.js`)
- Added "🎮 Play Game" button on game cards
- Links to new play.html page

---

## 🚀 Next Steps

### Step 1: Deploy New Contract

**In Remix:**
1. Copy `contracts/CoinHideGame.sol` to Remix
2. Compile with Solidity 0.8.19
3. Deploy to Base network
4. **Copy the new contract address**

### Step 2: Update Contract Address & ABI

**Update `script.js`:**
1. Replace `CONTRACT_ADDRESS` with new deployed address
2. Replace `CONTRACT_ABI` with ABI from Remix (full JSON)

**The new contract has these functions:**
- `createGame()` - Create new game
- `joinGame(uint256 gameId)` - Join with access code
- `setReady(uint256 gameId)` - Mark ready to play
- `hideCoin(uint256 gameId, uint8 box)` - Hide coin (1-9)
- `findCoin(uint256 gameId, uint8 box)` - Find coin (1-9)
- `getGame(uint256 gameId)` - Get game data
- `getRound(uint256 gameId, uint256 round)` - Get round data
- `getPlayerHistory(uint256 gameId, address player)` - Get used boxes

### Step 3: Test the Game

1. Create a game
2. Share access code
3. Join game
4. Both click "Ready"
5. Play!

---

## 🎯 Game Flow

1. **Creator** creates game → Gets access code
2. **Joiner** joins with access code
3. Both click **"Ready"** button
4. **Round starts:**
   - Creator hides coin (15s timer)
   - Joiner finds coin (10s timer)
   - Joiner hides coin (15s timer)
   - Creator finds coin (10s timer)
5. **Scoring:**
   - If creator wins both → Creator wins round
   - If joiner wins both → Joiner wins round
   - If both win 1 → Draw, new round
6. **Winner** gets all ETH automatically

---

## 📝 Important Notes

- **Old contract** (`EscroGame.sol`) is still deployed but won't be used
- **New contract** (`CoinHideGame.sol`) needs to be deployed
- Game list page (`game.html`) still works
- New play page (`play.html`) is the actual game
- Access code system still works the same way

---

## 🔧 Files Changed

- ✅ `contracts/CoinHideGame.sol` - NEW contract
- ✅ `play.html` - NEW game UI
- ✅ `play.js` - NEW game logic
- ✅ `game.js` - Updated to link to play.html
- ⚠️ `script.js` - NEEDS UPDATE (contract address & ABI)

---

## 🎮 How to Play

1. Go to game list
2. Create or join a game
3. Click "🎮 Play Game" button
4. Both players click "Ready"
5. Follow the game phases:
   - Hide coin when it's your turn
   - Find coin when it's your turn
6. Winner takes all ETH!

---

**Ready to deploy? Follow Step 1-3 above!**

