# Contributing to MCP Codex Keeper

👍 Thank you for considering contributing to MCP Codex Keeper! This document explains how to contribute effectively.

## Project Documentation Structure

We maintain three main documentation files:

1. **README.md** - User-focused documentation

   - Installation and setup
   - Basic usage examples
   - Available tools and features
   - Configuration options

2. **CONTRIBUTING.md** (this file) - Developer guide

   - How to contribute
   - Development setup
   - Coding standards
   - Pull request process

3. **PROJECT_SUMMARY.md** - Technical documentation
   - Detailed architecture
   - Implementation details
   - Design decisions
   - Internal workflows

## Development Setup

1. Clone and prepare:

   ```bash
   git clone https://github.com/aindreyway/mcp-codex-keeper.git
   cd mcp-codex-keeper
   npm install
   ```

2. Set up environment:

   ```bash
   cp .env.example .env
   ```

   Configure:

   - `MCP_ENV=local` for local development
   - `STORAGE_PATH=data` for local storage

3. Development Scripts:

   ```bash
   # Run in local mode
   npm run local

   # Watch mode for development
   npm run dev
   ```

## Development Guidelines

### Code Style

1. TypeScript:

   - Use strict mode
   - Properly type everything
   - Use interfaces for complex types
   - Document public APIs with JSDoc

2. File Organization:

   - Keep files focused and small
   - Group related functionality
   - Use clear, descriptive names
   - Follow existing patterns

3. Error Handling:
   - Use custom error classes
   - Provide meaningful messages
   - Log appropriately
   - Handle edge cases

### Testing

1. Local Testing:

   ```bash
   # Run in local mode
   npm run local

   # Test your changes
   ```

2. Production Testing:

   ```bash
   # Install globally
   npm i -g @aindreyway/mcp-codex-keeper

   # Test as end user
   ```

## Making Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes:

   - Follow code style guidelines
   - Add/update tests if needed
   - Update documentation

3. Commit your changes:

   ```bash
   git add .
   git commit -m "type: description of changes"
   ```

   Use conventional commit messages:

   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Formatting
   - refactor: Code restructuring
   - test: Tests
   - chore: Maintenance

4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. Update Documentation:

   - Update README.md if adding features
   - Update PROJECT_SUMMARY.md for technical changes
   - Add comments for complex code

2. Submit PR:

   - Clear title and description
   - Reference any related issues
   - Explain your changes
   - List any breaking changes

3. Review Process:

   - Address review comments
   - Keep discussions focused
   - Be patient and respectful

4. After Merge:
   - Delete your branch
   - Verify changes in production
   - Update related issues

## Version Management

We use semantic versioning:

1. Version Numbers:

   - MAJOR (x.0.0): Breaking changes
   - MINOR (0.x.0): New features
   - PATCH (0.0.x): Bug fixes

2. Version Update:
   ```bash
   npm run deploy
   ```
   This handles:
   - Version bumping
   - Building
   - Publishing
   - Git tags

## Best Practices

1. Documentation:

   - Keep it current
   - Be clear and concise
   - Include examples
   - Explain why, not just what

2. Code:

   - Write self-documenting code
   - Keep functions small
   - Use meaningful names
   - Follow SOLID principles

3. Git:
   - Small, focused commits
   - Clear commit messages
   - Keep main branch stable
   - Rebase before merging

## Getting Help

- Check existing issues
- Ask in discussions
- Read PROJECT_SUMMARY.md
- Contact maintainers

Remember: Quality over speed. Take time to do things right!
