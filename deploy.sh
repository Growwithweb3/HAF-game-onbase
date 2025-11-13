#!/bin/bash

# Quick Deploy Script for Hide & Seek Game
# This script helps you deploy to Vercel quickly

echo "🚀 Hide & Seek Game - Quick Deploy"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Hide & Seek Game"
    echo "✅ Git initialized!"
    echo ""
    echo "⚠️  Next steps:"
    echo "1. Create a repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/hide-seek-game.git"
    echo "3. Run: git push -u origin main"
    echo "4. Go to https://vercel.com and import your repository"
    echo ""
else
    echo "✅ Git repository already initialized"
    echo ""
    echo "📤 To deploy:"
    echo "1. Push to GitHub: git push"
    echo "2. Go to https://vercel.com"
    echo "3. Import your repository"
    echo "4. Click Deploy!"
    echo ""
fi

echo "📚 For detailed instructions, see:"
echo "   - DEPLOY_QUICK.md (fastest way)"
echo "   - DEPLOY_FREE.md (complete guide)"
echo "   - GET_FREE_ETH.md (how to get testnet ETH)"
echo ""

