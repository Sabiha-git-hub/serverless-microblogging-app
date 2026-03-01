#!/bin/bash

# Script to push the micro-blogging app to GitHub

echo "🚀 Pushing Serverless Micro-Blogging App to GitHub..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Serverless micro-blogging application

- React 18 frontend with TypeScript
- AWS Lambda backend with Node.js 22.x
- DynamoDB for data persistence
- Cognito for authentication
- API Gateway REST API
- S3 + CloudFront hosting
- Complete documentation and deployment guides"

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/Sabiha-git-hub/serverless-microblogging.git
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🌐 View your repository at: https://github.com/Sabiha-git-hub/serverless-microblogging"
echo ""
echo "📚 Next steps:"
echo "   1. Review the README.md on GitHub"
echo "   2. Follow DEPLOYMENT_GUIDE.md to deploy to AWS"
echo "   3. Configure frontend/.env with AWS outputs"
echo ""
