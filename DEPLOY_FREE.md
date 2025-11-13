# 🚀 Free Deployment Guide - $0 Budget

This guide shows you how to deploy your Hide & Seek game completely FREE!

## 📋 What You Need (All Free!)

1. **GitHub Account** (Free) - For code hosting
2. **Vercel/Netlify Account** (Free) - For frontend hosting
3. **Railway/Render Account** (Free tier) - For backend (optional)
4. **Base Sepolia Testnet ETH** (Free from faucet) - For testing
5. **Base Mainnet ETH** (Minimal ~$0.10-0.50) - For production

## 🎯 Step-by-Step Deployment

### Option 1: Fully Client-Side (Recommended - 100% Free)

This removes the need for a backend server entirely!

#### Step 1: Modify for Client-Side Only

The game can work entirely from the browser using MetaMask. We just need to remove backend dependencies.

#### Step 2: Deploy Frontend to Vercel (FREE)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/hide-seek-game.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel auto-detects settings
   - Click "Deploy"
   - **Done!** You get a free URL like: `your-game.vercel.app`

#### Alternative: Netlify (Also FREE)

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Build command: (leave empty for static)
6. Publish directory: `.` (root)
7. Click "Deploy site"

### Option 2: With Backend (Still Mostly Free)

#### Step 1: Deploy Backend to Railway (FREE Tier)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Add environment variable:
   - `CONTRACT_ADDRESS` = your deployed contract address
7. Railway gives you a free URL like: `your-app.railway.app`

**Note:** Railway free tier includes $5/month credit (enough for this app)

#### Alternative Backend Hosts:
- **Render.com** - Free tier available
- **Fly.io** - Free tier available
- **Heroku** - Limited free tier

### Step 3: Deploy Smart Contract (Minimal Cost)

#### For Testing (100% FREE):

1. **Get Free Testnet ETH:**
   - Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Or use [Alchemy Faucet](https://sepoliafaucet.com/)
   - Request testnet ETH (completely free)

2. **Deploy to Base Sepolia:**
   ```bash
   # Update hardhat.config.js to use Base Sepolia
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

3. **Update Contract Address:**
   - Copy the deployed address
   - Update in `script.js` and `server.js` (if using backend)

#### For Production (Minimal Cost ~$0.10-0.50):

1. **Get Base Mainnet ETH:**
   - Buy minimum $0.50 worth from Coinbase (they support Base)
   - Or bridge from Ethereum (more expensive)
   - You only need enough for gas fees

2. **Deploy to Base Mainnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```

3. **Verify Contract (FREE):**
   ```bash
   npx hardhat verify --network base CONTRACT_ADDRESS
   ```

## ✅ Your Game Already Works Client-Side!

Good news! Your game **already works without a backend**! The frontend connects directly to the blockchain via MetaMask. The `server.js` is optional and only provides API endpoints for convenience.

## 🚀 Fastest Deployment (5 Minutes)

### Method 1: Vercel (Recommended - Easiest)

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/hide-seek-game.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Visit: https://vercel.com
   - Click "Sign Up" → Use GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - **Settings:**
     - Framework Preset: Other
     - Build Command: (leave empty)
     - Output Directory: `.` (or leave empty)
   - Click "Deploy"
   - **Done!** You'll get: `your-game.vercel.app`

3. **Update Contract Address:**
   - After deploying contract, update `CONTRACT_ADDRESS` in `script.js`
   - Push to GitHub (Vercel auto-redeploys)

### Method 2: Netlify (Also Easy)

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Visit: https://netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - **Build settings:**
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"
   - **Done!** You'll get: `your-game.netlify.app`

### Method 3: GitHub Pages (100% Free, No Account Needed)

1. **Push to GitHub** (same as above)

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Source: "Deploy from a branch"
   - Branch: `main` → `/ (root)`
   - Click "Save"
   - **Done!** You'll get: `YOUR_USERNAME.github.io/hide-seek-game`

## 💰 Smart Contract Deployment Costs

### Option A: Testnet (100% FREE)

1. **Get Free Testnet ETH:**
   - Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Or: https://sepoliafaucet.com/
   - Request 0.1 ETH (free, for testing only)

2. **Deploy to Testnet:**
   ```bash
   # Make sure you have testnet ETH in MetaMask
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

3. **Update script.js:**
   ```javascript
   const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
   ```

### Option B: Mainnet (Minimal Cost ~$0.10-0.50)

1. **Get Base ETH:**
   - Minimum needed: ~0.001 ETH (~$0.10-0.50)
   - Buy from Coinbase (supports Base directly)
   - Or bridge from Ethereum (more expensive)

2. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network base
   ```

3. **Verify Contract (FREE):**
   ```bash
   npx hardhat verify --network base CONTRACT_ADDRESS
   ```

## 📝 Complete Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy frontend to Vercel/Netlify/GitHub Pages
- [ ] Get testnet ETH from faucet (for testing)
- [ ] Deploy contract to Base Sepolia testnet
- [ ] Update `CONTRACT_ADDRESS` in `script.js`
- [ ] Test the game on testnet
- [ ] (Optional) Get mainnet ETH for production
- [ ] (Optional) Deploy to Base mainnet
- [ ] Share your game URL!

## 🎯 Zero-Cost Summary

**Frontend Hosting:** FREE (Vercel/Netlify/GitHub Pages)
**Backend:** NOT NEEDED (game works client-side)
**Contract Deployment (Testnet):** FREE (faucet ETH)
**Contract Deployment (Mainnet):** ~$0.10-0.50 (one-time)

**Total Cost: $0 for testnet, ~$0.50 for mainnet!**

## 🔗 Quick Links

- **Vercel:** https://vercel.com
- **Netlify:** https://netlify.com
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Base Explorer:** https://basescan.org
- **Base Docs:** https://docs.base.org

