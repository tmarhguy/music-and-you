# Contributing to Music & You

We welcome contributions to Music & You! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Python 3.9+ installed
- Node.js 18+ installed
- Git configured with your GitHub account
- A Spotify Developer account for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/music-and-you.git
   cd music-and-you
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/tmarhguy/music-and-you.git
   ```

### Development Setup

1. **Backend Setup**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -e .
   ```

2. **Frontend Setup**:

   ```bash
   cd frontend
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   cd frontend
   cp .env.example .env.local
   # Configure your environment variables
   ```

## Development Process

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Example: `feature/chat-interface-improvements`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(api): add chat endpoint for personality explanations
fix(frontend): resolve authentication redirect issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Before Creating a PR**:

   - Ensure your code follows the coding standards
   - Run tests and ensure they pass
   - Update documentation if needed
   - Sync with upstream main branch

2. **Creating the PR**:

   - Use a descriptive title
   - Fill out the PR template completely
   - Link any related issues
   - Request review from maintainers

3. **PR Requirements**:
   - All CI checks must pass
   - Code coverage should not decrease
   - At least one maintainer approval required
   - All conversations must be resolved

## Coding Standards

### Python (Backend)

- Follow [PEP 8](https://pep8.org/) style guide
- Use [black](https://black.readthedocs.io/) for code formatting
- Use [isort](https://pycqa.github.io/isort/) for import sorting
- Use type hints where appropriate
- Maximum line length: 88 characters

**Format code before committing**:

```bash
black src/ tests/
isort src/ tests/
flake8 src/ tests/
```

### TypeScript/React (Frontend)

- Follow project ESLint configuration
- Use TypeScript for type safety
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling

**Lint and format**:

```bash
cd frontend
npm run lint
npm run type-check
```

### General Guidelines

- Write clear, self-documenting code
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused
- Avoid code duplication

## Testing

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/music_and_you

# Run specific test file
pytest tests/test_personality_predictor.py
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Guidelines

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

## Documentation

### Code Documentation

- Document all public functions and classes
- Use docstrings for Python functions
- Use JSDoc comments for TypeScript functions
- Include examples in documentation

### API Documentation

- Update OpenAPI specifications for new endpoints
- Include request/response examples
- Document error codes and responses

### User Documentation

- Update README for new features
- Add usage examples
- Update installation instructions if needed

## Issue Guidelines

### Reporting Bugs

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node versions)
- Error messages and stack traces

### Feature Requests

Include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Potential alternatives considered

## Questions and Support

- Check existing documentation first
- Search existing issues before creating new ones
- Use GitHub Discussions for questions
- Join our community channels for real-time help

## Recognition

Contributors will be recognized in:

- README contributors section
- Release notes for significant contributions
- Annual contributor acknowledgments

Thank you for contributing to Music & You!
