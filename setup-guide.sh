#!/bin/bash

# Interactive CI/CD Setup Guide
# Run this to get personalized recommendations

echo "🚀 MedNote AI - CI/CD Pipeline Setup Guide"
echo "==========================================="
echo ""

# Question 1: Time availability
echo "⏱️  How much time do you have?"
echo "1) 5 minutes (I'm in a hurry!)"
echo "2) 30 minutes (I want it done right)"
echo "3) 1+ hour (I need maximum control)"
read -p "Choose (1-3): " TIME_CHOICE

# Question 2: Backend plans
echo ""
echo "🔧 Do you plan to add a backend API?"
echo "1) No, just frontend"
echo "2) Maybe later"
echo "3) Yes, with FastAPI"
read -p "Choose (1-3): " BACKEND_CHOICE

# Question 3: Cost sensitivity
echo ""
echo "💰 Budget?"
echo "1) Free tier only"
echo "2) Can pay after 1 year"
echo "3) Enterprise budget"
read -p "Choose (1-3): " COST_CHOICE

# Recommendations
echo ""
echo "=========================================="
echo "📊 YOUR PERSONALIZED RECOMMENDATION"
echo "=========================================="
echo ""

if [ "$TIME_CHOICE" = "1" ]; then
    echo "⚡ YOU CHOSE: FASTEST SETUP"
    echo ""
    echo "✅ RECOMMENDED: VERCEL"
    echo ""
    echo "Why:"
    echo "• 5-minute setup"
    echo "• Automatic deployments"
    echo "• Built for React/Vite"
    echo "• Zero configuration"
    echo ""
    echo "Steps:"
    echo "1. Go to https://vercel.com/signup"
    echo "2. Sign up with GitHub"
    echo "3. Import your mednote-ai repo"
    echo "4. Add VITE_GEMINI_API_KEY secret"
    echo "5. Click Deploy"
    echo ""
    echo "Access: https://mednote-ai-XXXXX.vercel.app"
    
elif [ "$TIME_CHOICE" = "2" ]; then
    if [ "$BACKEND_CHOICE" = "3" ]; then
        echo "🏢 YOU CHOSE: ENTERPRISE WITH BACKEND"
        echo ""
        echo "✅ RECOMMENDED: AWS (This repo is ready!)"
        echo ""
        echo "Why:"
        echo "• Scalable to millions"
        echo "• Can add Lambda backend"
        echo "• GitHub Actions included"
        echo "• Free tier for life"
        echo ""
        echo "Steps:"
        echo "1. chmod +x setup-aws.sh"
        echo "2. ./setup-aws.sh"
        echo "3. Copy output to GitHub Secrets"
        echo "4. git push origin main"
        echo ""
        echo "See: CICD_SETUP.md for details"
    else
        echo "⚖️  YOU CHOSE: BALANCED APPROACH"
        echo ""
        echo "✅ RECOMMENDED: NETLIFY OR AWS"
        echo ""
        echo "Option A - Netlify (Easier):"
        echo "• Go to https://netlify.com"
        echo "• Import your repo"
        echo "• Done in 10 minutes"
        echo ""
        echo "Option B - AWS (More control):"
        echo "• Run ./setup-aws.sh"
        echo "• Takes 30 minutes"
        echo "• Scales infinitely"
    fi
    
else
    echo "🔬 YOU CHOSE: MAXIMUM CONTROL"
    echo ""
    echo "✅ RECOMMENDED: AWS WITH FULL SETUP"
    echo ""
    echo "Your setup includes:"
    echo "✓ GitHub Actions CI/CD"
    echo "✓ AWS S3 hosting"
    echo "✓ CloudFront CDN"
    echo "✓ Docker support"
    echo "✓ IAM security"
    echo "✓ Automated deployments"
    echo ""
    echo "Getting started:"
    echo "1. ./setup-aws.sh (automated setup)"
    echo "2. Add GitHub Secrets"
    echo "3. git push"
    echo ""
    echo "See: CICD_SETUP.md for full documentation"
fi

echo ""
echo "=========================================="
echo "📚 DOCUMENTATION"
echo "=========================================="
echo ""
echo "Quick guides (pick one):"
echo "• QUICK_START.md - Overview"
echo "• DEPLOYMENT_CHECKLIST.md - Step by step"
echo "• CICD_SETUP.md - Full technical guide"
echo "• ALTERNATIVE_DEPLOYMENTS.md - All options"
echo ""
echo "=========================================="
echo "🎯 NEXT STEP"
echo "=========================================="
echo ""
echo "Choose your platform above and follow the steps!"
echo ""
echo "Need help? Open the relevant .md file for details."
echo ""
