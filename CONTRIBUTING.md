# Contributing to Serverless Micro-Blogging App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed functionality
- Explanation of why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit your changes** with clear commit messages
6. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation for API changes
- Keep pull requests focused on a single concern
- Reference related issues in the PR description

## Development Setup

### Prerequisites

- Node.js 22.x or later
- Yarn package manager
- AWS CLI configured
- AWS CDK CLI

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/serverless-microblogging.git
cd serverless-microblogging

# Install dependencies
yarn install

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Running Tests

```bash
# Frontend linting
yarn workspace frontend lint

# E2E tests
yarn workspace frontend test:e2e
```

### Code Style

#### Frontend (TypeScript/React)
- Use TypeScript for type safety
- Follow React best practices and hooks guidelines
- Use functional components
- Keep components small and focused
- Use meaningful variable and function names

#### Backend (JavaScript/Node.js)
- Use CommonJS modules
- Follow async/await patterns
- Handle errors appropriately
- Use environment variables for configuration
- Keep Lambda functions focused and small

#### Infrastructure (TypeScript/CDK)
- Use CDK best practices
- Document resource purposes
- Use meaningful construct IDs
- Follow AWS Well-Architected Framework

## Project Structure

```
/
├── frontend/           # React application
├── backend/            # Lambda functions
├── infrastructure/     # AWS CDK stack
└── package.json        # Workspace configuration
```

## Commit Message Guidelines

Use clear and meaningful commit messages:

```
feat: add user profile editing
fix: resolve authentication token expiry issue
docs: update deployment instructions
style: format code according to ESLint rules
refactor: simplify post creation logic
test: add E2E tests for comment feature
chore: update dependencies
```

## Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

## Review Process

1. All pull requests require review before merging
2. Address review comments promptly
3. Keep discussions focused and professional
4. Be open to feedback and suggestions

## Questions?

Feel free to open an issue for any questions or clarifications needed.

Thank you for contributing! 🎉
