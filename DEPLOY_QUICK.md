# ⚡ Quick Deploy - 3 Steps

## Step 1: Push to GitHub (2 minutes)

```bash
git init
git add .
git commit -m "Hide & Seek Game"
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/hide-seek-game.git
git push -u origin main
```

## Step 2: Deploy Frontend (1 minute)

**Vercel:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" → Import repo
4. Click "Deploy"
5. Done! You get a free URL

**OR Netlify:**
1. Go to https://netlify.com
2. Sign up with GitHub
3. "Add new site" → Import repo
4. Click "Deploy site"
5. Done!

## Step 3: Deploy Contract (5 minutes)

### For Testing (FREE):
1. Get free testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Deploy: `npx hardhat run scripts/deploy.js --network baseSepolia`
3. Copy address, update `script.js`
4. Push to GitHub (auto-redeploys)

### For Production (~$0.50):
1. Buy ~0.001 ETH on Base (Coinbase supports it)
2. Deploy: `npx hardhat run scripts/deploy.js --network base`
3. Update `script.js` with address
4. Push to GitHub

## ✅ That's It!

Your game is now live at: `your-game.vercel.app` or `your-game.netlify.app`

**Total time: ~10 minutes**
**Total cost: $0 (testnet) or ~$0.50 (mainnet)**

