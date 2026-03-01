# Project Structure

## Root Level

```
/
├── frontend/           # React application
├── backend/            # Lambda functions
├── infrastructure/     # AWS CDK stack
├── package.json        # Workspace configuration
└── DESIGN_LANGUAGE.md  # UI/UX guidelines
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (AuthContext)
│   ├── pages/          # Route components (Login, Feed, Profile, etc.)
│   ├── services/       # API client (api.ts)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app with routing
│   └── main.tsx        # Entry point
├── .env                # Environment variables (not committed)
└── vite.config.ts      # Vite configuration
```

### Frontend Conventions

- Protected routes use `ProtectedRoute` wrapper component
- Layout component provides header/nav for authenticated pages
- API calls centralized in `services/api.ts`
- Auth state managed via `AuthContext`

## Backend Structure

```
backend/
├── src/
│   ├── common/
│   │   └── middleware.js    # Auth middleware (withAuth)
│   └── functions/
│       ├── auth/            # register.js, login.js
│       ├── users/           # Profile, follow/unfollow
│       ├── posts/           # CRUD operations
│       └── monitoring/      # Custom metrics
└── scripts/                 # Deployment scripts
```

### Backend Conventions

- Each Lambda is a separate file with exported `handler`
- Protected endpoints wrap handler with `withAuth(handler)`
- AWS SDK v3 clients initialized at module level
- Environment variables for table names and pool IDs
- Standard response format with CORS headers

## Infrastructure Structure

```
infrastructure/
├── lib/
│   └── app-stack.ts    # Main CDK stack definition
├── bin/                # CDK app entry point
└── cdk.json            # CDK configuration
```

### Infrastructure Conventions

- Single stack (`AppStack`) defines all resources
- Lambda packages expected in `backend/dist/lambda-packages/*.zip`
- DynamoDB tables use PAY_PER_REQUEST billing
- GSIs added for common query patterns
- CDK outputs provide frontend environment values

## Key Patterns

### Authentication Flow

1. User registers/logs in via Cognito
2. Frontend stores tokens in AuthContext
3. API requests include Authorization header
4. Backend middleware validates token and adds user to event

### Data Access

- DynamoDB tables: Users, Posts, Likes, Comments, Follows
- GSIs enable efficient queries (userId-index, postId-index, etc.)
- Lambda functions granted specific table permissions

### Deployment

1. Build backend → creates dist/ with Lambda code
2. Deploy infrastructure → creates/updates AWS resources
3. Build frontend → creates dist/ with static assets
4. Sync to S3 → uploads to website bucket
5. Invalidate CloudFront → clears CDN cache
