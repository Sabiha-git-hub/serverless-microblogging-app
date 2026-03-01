# Implementation Plan: Post Comments

## Overview

This implementation plan breaks down the post comments feature into incremental coding tasks. Each task builds on previous work, starting with backend infrastructure, then API endpoints, followed by frontend components, and finally integration. The plan follows the existing architecture patterns for Lambda functions, DynamoDB access, and React components.

## Tasks

- [x] 1. Create backend Lambda functions for comment operations
  - [x] 1.1 Implement createComment Lambda function
    - Create `backend/src/functions/comments/createComment.js`
    - Implement handler with input validation (non-empty, ≤280 chars)
    - Generate unique comment ID using uuid
    - Write comment to DynamoDB Comments table
    - Return created comment with author info
    - Wrap handler with withAuth middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 5.1_
  
  - [ ]* 1.2 Write property test for comment creation
    - **Property 1: Comment Creation Round-Trip**
    - **Validates: Requirements 1.1, 1.4, 5.1**
  
  - [ ]* 1.3 Write property test for input validation
    - **Property 2: Comment Input Validation**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 1.4 Write unit tests for createComment edge cases
    - Test empty comment rejection
    - Test 280 character limit
    - Test authentication failures
    - _Requirements: 1.2, 1.3, 4.1, 7.3, 7.4_
  
  - [x] 1.5 Implement getComments Lambda function
    - Create `backend/src/functions/comments/getComments.js`
    - Extract postId from path parameters
    - Query Comments table using postId-index GSI
    - Sort results by createdAt ascending
    - Enrich comments with author usernames from Users table
    - Return comment list (no auth required)
    - _Requirements: 2.2, 3.1, 3.2, 3.3, 4.4_
  
  - [ ]* 1.6 Write property test for comment retrieval
    - **Property 7: Complete Comment Retrieval**
    - **Validates: Requirements 3.1, 3.3**
  
  - [ ]* 1.7 Write property test for unauthenticated read access
    - **Property 10: Unauthenticated Read Access**
    - **Validates: Requirements 4.4**
  
  - [ ]* 1.8 Write unit tests for getComments edge cases
    - Test post with no comments
    - Test post with multiple comments
    - Test chronological ordering
    - _Requirements: 2.2, 2.4, 3.3_

- [x] 2. Update infrastructure to wire Lambda functions to API Gateway
  - [x] 2.1 Add Lambda function definitions to CDK stack
    - Create createComment Lambda in `infrastructure/lib/app-stack.ts`
    - Create getComments Lambda in `infrastructure/lib/app-stack.ts`
    - Configure environment variables (COMMENTS_TABLE, POSTS_TABLE, USERS_TABLE)
    - Set Node.js 22.x runtime
    - _Requirements: 1.1, 3.1_
  
  - [x] 2.2 Add API Gateway routes for comment endpoints
    - Add `GET /posts/{postId}/comments` route
    - Add `POST /posts/{postId}/comments` route
    - Wire routes to Lambda integrations
    - Configure CORS settings
    - _Requirements: 1.1, 3.1_
  
  - [x] 2.3 Grant DynamoDB permissions to Lambda functions
    - Grant createComment read/write access to Comments table
    - Grant createComment read access to Users and Posts tables
    - Grant getComments read access to Comments and Users tables
    - _Requirements: 1.4, 3.1, 5.1_

- [x] 3. Checkpoint - Deploy backend and test API endpoints
  - Deploy infrastructure changes using `yarn workspace infrastructure deploy`
  - Test createComment endpoint with curl or Postman
  - Test getComments endpoint with curl or Postman
  - Verify authentication works correctly
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Create frontend TypeScript types for comments
  - [x] 4.1 Define Comment interface
    - Create `frontend/src/types/comment.ts`
    - Define Comment interface with all required fields
    - Export interface for use in components
    - _Requirements: 2.3, 3.2_

- [x] 5. Extend frontend API service with comment methods
  - [x] 5.1 Add getComments method to postsApi
    - Add method to `frontend/src/services/api.ts`
    - Implement GET request to `/posts/{postId}/comments`
    - Include Authorization header
    - Handle response and errors
    - _Requirements: 3.1, 3.2_
  
  - [x] 5.2 Add createComment method to postsApi
    - Add method to `frontend/src/services/api.ts`
    - Implement POST request to `/posts/{postId}/comments`
    - Include Authorization header and request body
    - Handle response and errors
    - _Requirements: 1.1, 4.1_
  
  - [ ]* 5.3 Write unit tests for API service methods
    - Test request formatting
    - Test response handling
    - Test error handling
    - _Requirements: 7.1, 7.2_

- [x] 6. Create CommentSection React component
  - [x] 6.1 Implement CommentSection component structure
    - Create `frontend/src/components/CommentSection.tsx`
    - Define component props (postId)
    - Set up state management (comments, commentText, loading, error, submitting)
    - Implement useEffect to fetch comments on mount
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 6.2 Implement comment display UI
    - Render comment list with author names and timestamps
    - Display "No comments yet" message when empty
    - Format timestamps as relative time
    - Apply design language styling (purple accents, rounded elements)
    - _Requirements: 2.2, 2.3, 2.4, 6.2_
  
  - [ ]* 6.3 Write property test for comment display
    - **Property 6: Comment Display Completeness**
    - **Validates: Requirements 2.3**
  
  - [x] 6.4 Implement comment input field with character counter
    - Add textarea for comment input
    - Add character counter showing remaining characters (280 - length)
    - Disable submit button when text is empty or >280 chars
    - Style input field with focus states
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [ ]* 6.5 Write property test for character counter
    - **Property 12: Character Counter Accuracy**
    - **Validates: Requirements 6.3**
  
  - [x] 6.6 Implement comment submission handler
    - Handle form submission (Enter key or button click)
    - Validate input before submission
    - Call createComment API method
    - Update comments list with new comment
    - Clear input field on success
    - Display error messages on failure
    - Preserve input text on network errors
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 7.1, 7.2_
  
  - [ ]* 6.7 Write property test for UI state after submission
    - **Property 3: UI State After Comment Submission**
    - **Validates: Requirements 1.5**
  
  - [ ]* 6.8 Write unit tests for CommentSection component
    - Test rendering with comments
    - Test rendering empty state
    - Test input validation
    - Test submission flow
    - Test error handling
    - _Requirements: 1.5, 2.4, 7.1, 7.2_

- [x] 7. Integrate CommentSection into Feed component
  - [x] 7.1 Add CommentSection to post cards in Feed
    - Import CommentSection component
    - Add `<CommentSection postId={post.id} />` to each post card
    - Position below post footer (likes/comments count)
    - Ensure proper spacing and layout
    - _Requirements: 2.1, 6.1_
  
  - [ ]* 7.2 Write property test for comment count accuracy
    - **Property 4: Comment Count Accuracy**
    - **Validates: Requirements 2.1**

- [x] 8. Add responsive design and styling
  - [x] 8.1 Style CommentSection for mobile and desktop
    - Add CSS for comment list and input field
    - Ensure responsive layout on mobile devices
    - Apply purple accent colors and rounded UI elements
    - Add loading and error state styles
    - Match existing design language from DESIGN_LANGUAGE.md
    - _Requirements: 6.2, 6.5_

- [x] 9. Implement error handling and loading states
  - [x] 9.1 Add loading spinners and disabled states
    - Show spinner while fetching comments
    - Disable submit button while creating comment
    - Prevent duplicate submissions
    - _Requirements: 7.1_
  
  - [x] 9.2 Add error message display
    - Display validation errors inline
    - Display network errors with retry option
    - Style error messages consistently
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ]* 9.3 Write property test for error response format
    - **Property 13: Error Response Format**
    - **Validates: Requirements 7.2, 7.4**

- [x] 10. Final checkpoint - End-to-end testing
  - Build frontend with `yarn build:frontend`
  - Deploy full stack with `yarn deploy`
  - Test comment creation in browser
  - Test comment display and ordering
  - Test character counter and validation
  - Test error handling (empty comments, >280 chars)
  - Test authentication (logged in vs logged out)
  - Test responsive design on mobile
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The Comments table already exists in infrastructure, no need to create it
- Follow existing patterns from likes feature for consistency
