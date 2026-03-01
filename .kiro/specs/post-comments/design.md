# Design Document: Post Comments

## Overview

The post comments feature enables users to engage in conversations around posts by adding text-based comments. This design follows the existing serverless architecture pattern with Lambda functions for the backend API, DynamoDB for data persistence, and React components for the frontend UI.

Comments will be stored in the existing Comments DynamoDB table (already defined in infrastructure) with a Global Secondary Index on postId for efficient retrieval. The implementation follows established patterns from the likes feature, using similar API structure, authentication middleware, and UI components.

Key design decisions:
- Comments are limited to 280 characters (same as posts) for consistency
- Comments are displayed in chronological order (oldest first) to maintain conversation flow
- Comment count is displayed on posts but not automatically updated (requires refresh)
- Authentication required for creating comments, but viewing is public
- No nested replies in initial implementation (flat comment structure)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Feed Component │  │ Post Card    │  │ Comment Section │ │
│  │                │─▶│ Component    │─▶│ Component       │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  API Service     │                     │
│                    │  (api.ts)        │                     │
│                    └──────────────────┘                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│  /posts/{postId}/comments [GET, POST]                       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ getComments Lambda       │  │ createComment Lambda     │
│ (withAuth optional)      │  │ (withAuth required)      │
└──────────┬───────────────┘  └──────────┬───────────────┘
           │                              │
           └──────────────┬───────────────┘
                          ▼
           ┌──────────────────────────────┐
           │   DynamoDB Comments Table    │
           │   PK: id                     │
           │   GSI: postId-index          │
           │   (postId, createdAt)        │
           └──────────────────────────────┘
```

### Data Flow

**Creating a Comment:**
1. User types comment in input field (with character counter)
2. User submits comment (Enter key or button click)
3. Frontend validates input (non-empty, ≤280 chars)
4. Frontend calls `postsApi.createComment(postId, text, token)`
5. API Gateway routes to createComment Lambda
6. withAuth middleware validates token and extracts user info
7. Lambda validates input and creates comment record
8. Lambda writes to Comments table with unique ID
9. Lambda returns created comment with author info
10. Frontend updates UI to show new comment and clears input

**Retrieving Comments:**
1. Frontend loads post in feed
2. Frontend calls `postsApi.getComments(postId, token)`
3. API Gateway routes to getComments Lambda
4. Lambda queries Comments table using postId-index GSI
5. Lambda retrieves comments sorted by createdAt (ascending)
6. Lambda enriches comments with author usernames from Users table
7. Lambda returns comment list
8. Frontend displays comments below post

## Components and Interfaces

### Backend Components

#### Lambda Functions

**createComment.js**
- Location: `backend/src/functions/comments/createComment.js`
- Handler: `exports.handler = withAuth(handler)`
- Environment Variables:
  - `COMMENTS_TABLE`: DynamoDB Comments table name
  - `POSTS_TABLE`: DynamoDB Posts table name
  - `USERS_TABLE`: DynamoDB Users table name
- Input: API Gateway event with body `{ text: string }`
- Output: `{ statusCode: 201, body: { message, comment } }`
- Responsibilities:
  - Validate authentication (via withAuth)
  - Validate comment text (non-empty, ≤280 chars)
  - Generate unique comment ID (uuid)
  - Create comment record with postId, userId, text, timestamp
  - Persist to Comments table
  - Increment post's commentsCount (optional, not in MVP)
  - Return created comment

**getComments.js**
- Location: `backend/src/functions/comments/getComments.js`
- Handler: `exports.handler` (no auth required for reading)
- Environment Variables:
  - `COMMENTS_TABLE`: DynamoDB Comments table name
  - `USERS_TABLE`: DynamoDB Users table name
- Input: API Gateway event with path parameter `{postId}`
- Output: `{ statusCode: 200, body: { comments: Comment[] } }`
- Responsibilities:
  - Extract postId from path parameters
  - Query Comments table using postId-index GSI
  - Sort results by createdAt ascending
  - Enrich comments with author usernames from Users table
  - Return comment list

#### Middleware

Uses existing `withAuth` middleware from `backend/src/common/middleware.js`:
- Validates JWT token from Authorization header
- Extracts user ID and username from token
- Adds `event.user` object with `{ id, username }`
- Returns 401 if authentication fails

### Frontend Components

#### API Service Extensions

**api.ts additions**
```typescript
export const postsApi = {
  // ... existing methods ...
  
  getComments: async (postId: string, token: string): Promise<{ comments: Comment[] }> => {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(response);
  },
  
  createComment: async (postId: string, text: string, token: string): Promise<{ comment: Comment }> => {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    return handleResponse(response);
  }
};
```

#### React Components

**CommentSection Component**
- Location: `frontend/src/components/CommentSection.tsx`
- Props: `{ postId: string }`
- State:
  - `comments: Comment[]` - list of comments
  - `commentText: string` - input field value
  - `loading: boolean` - loading state
  - `error: string | null` - error message
  - `submitting: boolean` - submission state
- Responsibilities:
  - Fetch comments on mount using `postsApi.getComments()`
  - Display comment list with author names and timestamps
  - Provide comment input field with character counter
  - Handle comment submission
  - Validate input (non-empty, ≤280 chars)
  - Display error messages
  - Clear input on successful submission
  - Show loading states

**Feed Component Updates**
- Add `<CommentSection postId={post.id} />` to each post card
- Display comment count from `post.commentsCount`
- No other changes required

### Infrastructure Components

**API Gateway Routes**
- `GET /posts/{postId}/comments` → getComments Lambda
- `POST /posts/{postId}/comments` → createComment Lambda

**Lambda Permissions**
- createComment: Read/Write access to Comments table, Read access to Users table, Read access to Posts table
- getComments: Read access to Comments table, Read access to Users table

**DynamoDB Table** (already exists)
- Table: Comments
- Partition Key: `id` (String)
- GSI: `postId-index`
  - Partition Key: `postId` (String)
  - Sort Key: `createdAt` (String)
  - Projection: ALL

## Data Models

### Comment Record (DynamoDB)

```typescript
interface Comment {
  id: string;              // UUID, partition key
  postId: string;          // Foreign key to Posts table, GSI partition key
  userId: string;          // Foreign key to Users table
  text: string;            // Comment content (max 280 chars)
  createdAt: string;       // ISO 8601 timestamp, GSI sort key
}
```

### Comment with Author (API Response)

```typescript
interface CommentWithAuthor {
  id: string;
  postId: string;
  userId: string;
  username: string;        // Enriched from Users table
  displayName: string;     // Enriched from Users table
  text: string;
  createdAt: string;
}
```

### Frontend Type Definition

```typescript
// frontend/src/types/comment.ts
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  text: string;
  createdAt: string;
}
```

### API Request/Response Formats

**POST /posts/{postId}/comments**
Request:
```json
{
  "text": "This is a comment"
}
```

Response (201 Created):
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "comment-uuid",
    "postId": "post-uuid",
    "userId": "user-uuid",
    "username": "johndoe",
    "displayName": "John Doe",
    "text": "This is a comment",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**GET /posts/{postId}/comments**
Response (200 OK):
```json
{
  "comments": [
    {
      "id": "comment-uuid-1",
      "postId": "post-uuid",
      "userId": "user-uuid-1",
      "username": "johndoe",
      "displayName": "John Doe",
      "text": "First comment",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "comment-uuid-2",
      "postId": "post-uuid",
      "userId": "user-uuid-2",
      "username": "janedoe",
      "displayName": "Jane Doe",
      "text": "Second comment",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Comment Creation Round-Trip

*For any* valid comment (non-empty, ≤280 characters), creating the comment then immediately retrieving it from the Comment_Store should return a comment with the same text, postId, and userId.

**Validates: Requirements 1.1, 1.4, 5.1**

### Property 2: Comment Input Validation

*For any* string that is either composed entirely of whitespace or exceeds 280 characters, attempting to create a comment with that string should be rejected with an appropriate error response.

**Validates: Requirements 1.2, 1.3**

### Property 3: UI State After Comment Submission

*For any* successful comment submission, the comment input field should be cleared and the new comment should appear in the displayed comment list.

**Validates: Requirements 1.5**

### Property 4: Comment Count Accuracy

*For any* post, the displayed comment count should equal the actual number of comments associated with that post in the Comment_Store.

**Validates: Requirements 2.1**

### Property 5: Chronological Comment Ordering

*For any* post with multiple comments, the comments should be displayed in chronological order based on their createdAt timestamps (oldest first).

**Validates: Requirements 2.2**

### Property 6: Comment Display Completeness

*For any* comment displayed in the UI, the rendered output should include the comment author's username, the comment text, and a timestamp.

**Validates: Requirements 2.3**

### Property 7: Complete Comment Retrieval

*For any* post with N comments, querying the Comment_API for that post's comments should return all N comments in a single response.

**Validates: Requirements 3.1, 3.3**

### Property 8: Unauthenticated Creation Rejection

*For any* comment creation request without valid authentication credentials, the Comment_API should reject the request with a 401 Unauthorized response.

**Validates: Requirements 4.1**

### Property 9: Comment Ownership

*For any* authenticated user creating a comment, the created comment's userId field should match the authenticated user's ID from the token.

**Validates: Requirements 4.2**

### Property 10: Unauthenticated Read Access

*For any* post, retrieving comments for that post should succeed without requiring authentication credentials.

**Validates: Requirements 4.4**

### Property 11: Authenticated User Input Visibility

*For any* post viewed by an authenticated user, the comment input field should be visible and functional.

**Validates: Requirements 6.1**

### Property 12: Character Counter Accuracy

*For any* text entered in the comment input field, the character counter should display the remaining characters as (280 - text.length).

**Validates: Requirements 6.3**

### Property 13: Error Response Format

*For any* invalid comment creation request (validation failure or bad input), the API should return an error response (400 or 401) with a descriptive error message.

**Validates: Requirements 7.2, 7.4**

## Error Handling

### Backend Error Handling

**Input Validation Errors (400 Bad Request)**
- Empty or whitespace-only comment text
- Comment text exceeding 280 characters
- Missing required fields (text)
- Invalid postId format

Error response format:
```json
{
  "message": "Descriptive error message",
  "error": "Specific validation failure"
}
```

**Authentication Errors (401 Unauthorized)**
- Missing Authorization header
- Invalid or expired JWT token
- Token validation failure

Error response format:
```json
{
  "message": "Authentication failed",
  "error": "Specific auth failure reason"
}
```

**Server Errors (500 Internal Server Error)**
- DynamoDB operation failures
- Unexpected exceptions
- Missing environment variables

Error response format:
```json
{
  "message": "Error creating/retrieving comment",
  "error": "Generic error message (no sensitive details)"
}
```

### Frontend Error Handling

**Network Errors**
- Display user-friendly error message
- Preserve comment text in input field
- Provide retry mechanism
- Log error details to console

**Validation Errors**
- Display inline error message below input field
- Highlight input field with error styling
- Prevent submission until validation passes
- Clear error on input change

**Loading States**
- Show spinner while fetching comments
- Disable submit button while creating comment
- Prevent duplicate submissions
- Show "Loading comments..." placeholder

**Empty States**
- Display "No comments yet. Be the first to comment!" when no comments exist
- Show empty state with appropriate styling
- Maintain consistent UI layout

### Error Recovery

**Comment Creation Failure**
1. Display error message to user
2. Keep comment text in input field
3. Allow user to edit and retry
4. Log error for debugging

**Comment Retrieval Failure**
1. Display "Failed to load comments" message
2. Provide "Retry" button
3. Fall back to showing comment count only
4. Log error for debugging

**Partial Data Failures**
- If author username lookup fails, display "Unknown User"
- Continue displaying other comments successfully
- Log missing data for investigation

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of valid and invalid inputs
- Edge cases (empty comments, exactly 280 characters, 281 characters)
- Error conditions (network failures, database errors)
- Integration points between components
- UI interactions (button clicks, input changes)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Validating correctness properties across many generated test cases

Both approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs with specific examples, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection:**
- Backend (Node.js): Use `fast-check` library for property-based testing
- Frontend (TypeScript/React): Use `fast-check` with React Testing Library

**Test Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: post-comments, Property N: [property description]`

**Property Test Implementation:**
Each correctness property listed above must be implemented as a single property-based test:

1. Property 1 → Test comment creation round-trip with random valid inputs
2. Property 2 → Test validation rejection with random invalid inputs
3. Property 3 → Test UI state changes with random valid comments
4. Property 4 → Test comment count accuracy with random post/comment data
5. Property 5 → Test chronological ordering with random comment timestamps
6. Property 6 → Test display completeness with random comment data
7. Property 7 → Test complete retrieval with random comment sets
8. Property 8 → Test auth rejection with random invalid tokens
9. Property 9 → Test ownership with random authenticated users
10. Property 10 → Test unauthenticated read with random posts
11. Property 11 → Test input visibility with random authenticated users
12. Property 12 → Test character counter with random text inputs
13. Property 13 → Test error format with random invalid inputs

### Unit Test Coverage

**Backend Unit Tests:**
- `createComment.handler`: Valid comment creation, validation failures, auth failures
- `getComments.handler`: Successful retrieval, empty results, invalid postId
- Middleware integration: Token validation, user extraction
- DynamoDB operations: Write success, query success, error handling

**Frontend Unit Tests:**
- `CommentSection` component: Rendering, user interactions, state management
- API service: Request formatting, response handling, error handling
- Input validation: Character counter, submit button state
- Error display: Validation errors, network errors, empty states

**Integration Tests:**
- End-to-end comment creation flow
- Comment retrieval and display flow
- Authentication integration
- Error recovery flows

### Test Data Generation

**Property Test Generators:**
- Valid comment text: Random strings 1-280 characters
- Invalid comment text: Empty strings, whitespace-only, >280 characters
- User IDs: Random UUIDs
- Post IDs: Random UUIDs
- Timestamps: Random ISO 8601 timestamps
- Auth tokens: Valid JWTs with random user data, invalid tokens

**Edge Cases to Cover:**
- Empty comment text
- Whitespace-only comment text (spaces, tabs, newlines)
- Exactly 280 character comment
- 281 character comment
- Unicode characters and emojis
- Special characters in comment text
- Post with zero comments
- Post with one comment
- Post with many comments (100+)
- Concurrent comment creation
- Missing or malformed auth tokens
