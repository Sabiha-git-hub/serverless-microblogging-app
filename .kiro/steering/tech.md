# Technology Stack

## Build System

Yarn workspaces monorepo with three packages: frontend, backend, infrastructure

## Frontend

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Playwright for E2E testing
- ESLint for code quality

## Backend

- Node.js 22.x runtime
- AWS SDK v3 (DynamoDB, Cognito)
- Lambda functions (individual handlers)
- CommonJS modules (.js files)

## Infrastructure

- AWS CDK with TypeScript
- CloudFormation for deployment
- Resources: Cognito, DynamoDB, API Gateway, Lambda, S3, CloudFront

## Key Libraries

- `@aws-sdk/client-dynamodb` - DynamoDB operations
- `@aws-sdk/lib-dynamodb` - Document client
- `uuid` - ID generation
- `react-router-dom` - Client-side routing

## Common Commands

```bash
# Frontend
yarn start:frontend          # Start dev server
yarn build:frontend          # Build for production
yarn workspace frontend lint # Run ESLint
yarn workspace frontend test:e2e # Run Playwright tests

# Backend
yarn build:backend           # Copy source to dist/

# Infrastructure
yarn workspace infrastructure deploy # Deploy CDK stack
yarn workspace infrastructure diff   # Preview changes

# Full deployment
yarn deploy                  # Build backend, deploy infra, deploy frontend, invalidate CDN
```

## Environment Configuration

Frontend requires `.env` file with:
- `VITE_API_URL` - API Gateway endpoint
- `VITE_USER_POOL_ID` - Cognito User Pool ID
- `VITE_USER_POOL_CLIENT_ID` - Cognito Client ID
- `VITE_IDENTITY_POOL_ID` - Cognito Identity Pool ID

Values are output by CDK deployment.
