# API Documentation

Base URL: `https://your-api-gateway-url.execute-api.region.amazonaws.com/prod`

All authenticated endpoints require an `Authorization` header with a valid Cognito JWT token.

## Authentication

### Register User

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "johndoe",
  "displayName": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "message": "User registered successfully",
  "userId": "uuid-string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or user already exists
- `500 Internal Server Error` - Server error

---

### Login

Authenticates a user and returns tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "jwt-token",
  "idToken": "jwt-token",
  "refreshToken": "jwt-token",
  "expiresIn": 3600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

## Users

### Get User Profile

Retrieves a user's profile information.

**Endpoint:** `GET /users/profile/:userId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "userId": "uuid-string",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "user@example.com",
  "bio": "Software developer",
  "followerCount": 42,
  "followingCount": 38,
  "postCount": 156,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

---

### Update Profile

Updates the authenticated user's profile.

**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "displayName": "John Smith",
  "bio": "Full-stack developer"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "userId": "uuid-string",
    "displayName": "John Smith",
    "bio": "Full-stack developer"
  }
}
```

---

### Follow User

Follow another user.

**Endpoint:** `POST /users/follow`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "followingId": "target-user-id"
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully followed user",
  "followId": "uuid-string"
}
```

---

### Unfollow User

Unfollow a user.

**Endpoint:** `DELETE /users/unfollow`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "followingId": "target-user-id"
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully unfollowed user"
}
```

---

### Check Following Status

Check if the authenticated user follows another user.

**Endpoint:** `GET /users/following/:userId/:targetUserId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "isFollowing": true
}
```

---

## Posts

### Create Post

Create a new post.

**Endpoint:** `POST /posts`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "content": "This is my first post! #serverless"
}
```

**Validation:**
- Content must be 1-280 characters

**Response:** `201 Created`
```json
{
  "message": "Post created successfully",
  "post": {
    "postId": "uuid-string",
    "userId": "uuid-string",
    "content": "This is my first post! #serverless",
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2026-03-01T14:30:00Z"
  }
}
```

---

### Get Posts (Feed)

Retrieve posts for the feed.

**Endpoint:** `GET /posts`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 20, max: 100)
- `lastKey` (optional): Pagination key from previous response
- `sortBy` (optional): `recent` or `popular` (default: recent)

**Response:** `200 OK`
```json
{
  "posts": [
    {
      "postId": "uuid-string",
      "userId": "uuid-string",
      "username": "johndoe",
      "displayName": "John Doe",
      "content": "This is a post",
      "likeCount": 15,
      "commentCount": 3,
      "isLiked": false,
      "createdAt": "2026-03-01T14:30:00Z"
    }
  ],
  "lastKey": "pagination-key"
}
```

---

### Like Post

Like or unlike a post.

**Endpoint:** `POST /posts/like`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "postId": "uuid-string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Post liked successfully",
  "likeId": "uuid-string"
}
```

Or if unliking:
```json
{
  "message": "Post unliked successfully"
}
```

---

## Comments

### Create Comment

Add a comment to a post.

**Endpoint:** `POST /comments`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "postId": "uuid-string",
  "content": "Great post!"
}
```

**Validation:**
- Content must be 1-280 characters

**Response:** `201 Created`
```json
{
  "message": "Comment created successfully",
  "comment": {
    "commentId": "uuid-string",
    "postId": "uuid-string",
    "userId": "uuid-string",
    "content": "Great post!",
    "createdAt": "2026-03-01T14:35:00Z"
  }
}
```

---

### Get Comments

Retrieve comments for a post.

**Endpoint:** `GET /comments/:postId`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `limit` (optional): Number of comments to return (default: 20)
- `lastKey` (optional): Pagination key

**Response:** `200 OK`
```json
{
  "comments": [
    {
      "commentId": "uuid-string",
      "postId": "uuid-string",
      "userId": "uuid-string",
      "username": "janedoe",
      "displayName": "Jane Doe",
      "content": "Great post!",
      "createdAt": "2026-03-01T14:35:00Z"
    }
  ],
  "lastKey": "pagination-key"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

API Gateway applies rate limiting:
- Burst: 5000 requests
- Rate: 10000 requests per second

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
