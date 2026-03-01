# Deployment Guide

This guide walks you through deploying the Serverless Micro-Blogging Application to AWS and GitHub.

## Prerequisites

- AWS Account with CLI configured
- Node.js 22.x or later
- Yarn package manager
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Git installed

## Step 1: Push to GitHub

### Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Serverless micro-blogging application"

# Add remote repository
git remote add origin https://github.com/Sabiha-git-hub/serverless-microblogging.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
yarn install
```

## Step 3: Build Backend

```bash
# Build backend Lambda functions
yarn build:backend

# Prepare Lambda packages
cd backend/scripts
chmod +x prepare-lambda-packages.sh
./prepare-lambda-packages.sh
cd ../..
```

## Step 4: Bootstrap CDK (First Time Only)

If this is your first time using CDK in your AWS account/region:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace `ACCOUNT-ID` with your AWS account ID and `REGION` with your target region (e.g., us-east-1).

## Step 5: Deploy Infrastructure

```bash
# Preview changes
yarn workspace infrastructure diff

# Deploy the stack
yarn workspace infrastructure deploy
```

The deployment will output several values. **Save these values** - you'll need them for the frontend configuration.

Example output:
```
Outputs:
AppStack.ViteApiUrl = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/
AppStack.ViteUserPoolId = us-east-1_xxxxxxxxx
AppStack.ViteUserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
AppStack.ViteIdentityPoolId = us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Step 6: Configure Frontend

Create `frontend/.env` file with the CDK outputs:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=<ViteApiUrl from CDK output>
VITE_USER_POOL_ID=<ViteUserPoolId from CDK output>
VITE_USER_POOL_CLIENT_ID=<ViteUserPoolClientId from CDK output>
VITE_IDENTITY_POOL_ID=<ViteIdentityPoolId from CDK output>
```

## Step 7: Build and Deploy Frontend

```bash
# Build the frontend
yarn build:frontend

# Get the S3 bucket name from CloudFormation
aws cloudformation describe-stacks \
  --stack-name AppStack \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteBucketName'].OutputValue" \
  --output text

# Deploy to S3 (replace BUCKET_NAME with the output from above)
aws s3 sync frontend/dist s3://BUCKET_NAME --delete

# Get CloudFront distribution ID
aws cloudformation describe-stacks \
  --stack-name AppStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text

# Invalidate CloudFront cache (replace DISTRIBUTION_ID with the output from above)
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

Or use the convenience script:

```bash
# From project root
yarn deploy
```

## Step 8: Access Your Application

Get your CloudFront URL:

```bash
aws cloudformation describe-stacks \
  --stack-name AppStack \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text
```

Open this URL in your browser to access your micro-blogging application!

## Development Workflow

### Local Development

```bash
# Start frontend dev server
yarn start:frontend
```

The app will run at `http://localhost:5173` and connect to your deployed AWS backend.

### Making Changes

1. **Frontend Changes:**
   ```bash
   yarn build:frontend
   yarn deploy:frontend
   yarn invalidate:cdn
   ```

2. **Backend Changes:**
   ```bash
   yarn build:backend
   cd backend/scripts && ./prepare-lambda-packages.sh && cd ../..
   yarn workspace infrastructure deploy
   ```

3. **Infrastructure Changes:**
   ```bash
   yarn workspace infrastructure deploy
   ```

## Monitoring

### CloudWatch Logs

View Lambda function logs:

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/AppStack

# Tail logs for a specific function
aws logs tail /aws/lambda/AppStack-RegisterFunction --follow
```

### CloudWatch Metrics

Access metrics in AWS Console:
- Navigate to CloudWatch → Metrics
- Select Lambda namespace
- View invocations, errors, duration, etc.

## Troubleshooting

### Lambda Function Errors

1. Check CloudWatch Logs for the specific function
2. Verify environment variables are set correctly
3. Ensure IAM permissions are granted

### Frontend Not Loading

1. Verify CloudFront distribution is deployed
2. Check S3 bucket has the built files
3. Ensure `.env` file has correct values
4. Clear browser cache or use incognito mode

### API Errors

1. Check API Gateway logs in CloudWatch
2. Verify Cognito user pool configuration
3. Test endpoints using curl or Postman
4. Check CORS configuration

### DynamoDB Issues

1. Verify tables exist in AWS Console
2. Check GSI configurations
3. Review IAM permissions for Lambda functions

## Cleanup

To remove all AWS resources:

```bash
# Delete the CloudFormation stack
yarn workspace infrastructure destroy

# Or using AWS CLI
aws cloudformation delete-stack --stack-name AppStack
```

**Note:** This will delete all data including user accounts, posts, and comments.

## Cost Optimization

This application uses serverless architecture with pay-per-use pricing:

- **Lambda:** Free tier includes 1M requests/month
- **DynamoDB:** Free tier includes 25GB storage
- **API Gateway:** Free tier includes 1M requests/month
- **S3:** Minimal storage costs
- **CloudFront:** Free tier includes 1TB data transfer/month
- **Cognito:** Free tier includes 50,000 MAUs

Expected monthly cost for low-traffic usage: **$0-5**

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong passwords** - Cognito enforces password policies
3. **Enable MFA** - For AWS Console access
4. **Review IAM permissions** - Follow principle of least privilege
5. **Monitor CloudWatch** - Set up alarms for unusual activity
6. **Keep dependencies updated** - Run `yarn upgrade` regularly

## Support

For issues or questions:
- Open an issue on GitHub
- Check AWS documentation
- Review CloudWatch logs

## Next Steps

- Add more features (notifications, direct messages, etc.)
- Implement caching with ElastiCache
- Add image upload with S3
- Set up CI/CD pipeline
- Add monitoring dashboards
- Implement rate limiting
- Add analytics tracking

Happy coding! 🚀
