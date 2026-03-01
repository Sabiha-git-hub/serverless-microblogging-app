# Product Overview

A serverless micro-blogging social media application built on AWS. Users can create accounts, post short messages (280 characters max), follow other users, like posts, and view a personalized feed.

## Core Features

- User authentication and profiles (Cognito)
- Post creation with 280 character limit
- Social interactions (likes, follows)
- Real-time feed with sorting options
- User profiles with follower counts

## Architecture

Serverless full-stack application:
- React frontend hosted on S3/CloudFront
- Node.js Lambda functions for API
- DynamoDB for data persistence
- API Gateway for REST endpoints
- Cognito for authentication

## Design Philosophy

Modern social media aesthetic with purple accent colors, rounded UI elements, and mobile-first responsive design. Prioritizes user engagement and content discovery.
