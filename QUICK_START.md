# Quick Start Guide

Get your Serverless Micro-Blogging Application up and running in minutes!

## 📦 What's Included

Your project now has:

✅ Complete React frontend with TypeScript  
✅ AWS Lambda backend functions  
✅ DynamoDB database schema  
✅ AWS CDK infrastructure code  
✅ Comprehensive documentation  
✅ Architecture diagrams  
✅ API documentation  
✅ Deployment scripts  
✅ Contributing guidelines  
✅ MIT License  

## 🚀 Push to GitHub (2 minutes)

Run the automated script:

```bash
./push-to-github.sh
```

Or manually:

```bash
git init
git add .
git commit -m "Initial commit: Serverless micro-blogging application"
git remote add origin https://github.com/Sabiha-git-hub/serverless-microblogging.git
git branch -M main
git push -u origin main
```

## ☁️ Deploy to AWS (10 minutes)

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build Backend

```bash
yarn build:backend
cd backend/scripts && ./prepare-lambda-packages.sh && cd ../..
```

### 3. Deploy Infrastructure

```bash
yarn workspace infrastructure deploy
```

**Save the output values!** You'll need them for the frontend.

### 4. Configure Frontend

Create `frontend/.env`:

```env
VITE_API_URL=<from CDK output>
VITE_USER_POOL_ID=<from CDK output>
VITE_USER_POOL_CLIENT_ID=<from CDK output>
VITE_IDENTITY_POOL_ID=<from CDK output>
```

### 5. Deploy Frontend

```bash
yarn deploy:frontend
```

## 🎉 You're Done!

Your application is now live on AWS!

Get your CloudFront URL:

```bash
aws cloudformation describe-stacks \
  --stack-name AppStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text
```

## 📚 Documentation

- **README.md** - Project overview and features
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **API_DOCUMENTATION.md** - Complete API reference
- **CONTRIBUTING.md** - How to contribute
- **Architecture Diagrams** - Visual system design

## 💻 Local Development

```bash
# Start frontend dev server
yarn start:frontend

# Runs at http://localhost:5173
```

## 🛠️ Common Commands

```bash
# Build everything
yarn build:backend
yarn build:frontend

# Deploy everything
yarn deploy

# Run tests
yarn workspace frontend test:e2e

# Lint code
yarn workspace frontend lint
```

## 🆘 Need Help?

1. Check **DEPLOYMENT_GUIDE.md** for detailed instructions
2. Review **API_DOCUMENTATION.md** for API details
3. Check CloudWatch logs for errors
4. Open an issue on GitHub

## 🎯 Next Steps

- [ ] Push code to GitHub
- [ ] Deploy to AWS
- [ ] Test the application
- [ ] Customize the design
- [ ] Add new features
- [ ] Set up CI/CD
- [ ] Monitor with CloudWatch

## 💰 Cost Estimate

With AWS Free Tier: **$0-5/month** for low traffic

Includes:
- Lambda (1M requests/month free)
- DynamoDB (25GB storage free)
- API Gateway (1M requests/month free)
- S3 (minimal storage)
- CloudFront (1TB transfer/month free)
- Cognito (50K MAUs free)

## 🔒 Security Notes

- Never commit `.env` files
- Use strong passwords
- Enable MFA on AWS account
- Review IAM permissions
- Monitor CloudWatch logs

## 📞 Support

Questions? Open an issue on GitHub or check the documentation!

---

**Happy Building! 🚀**
