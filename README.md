# Aindreyway MCP Codex Keeper

![MCP Server](https://img.shields.io/badge/MCP-Server-blue)
![Version](https://img.shields.io/badge/version-1.0.3-green)
![License](https://img.shields.io/badge/license-MIT-blue)

An intelligent MCP server that serves as a guardian of development knowledge, providing AI assistants with curated access to latest documentation and best practices.

## 🚀 Installation Guide

### Prerequisites

1. Make sure you have Node.js 18 or later installed:

```bash
node --version
```

If not installed or wrong version:

- For macOS: `brew install node`
- For Linux: Use [nvm](https://github.com/nvm-sh/nvm) or your package manager
- For Windows: Download from [nodejs.org](https://nodejs.org/)

2. Update npm to the latest version:

```bash
npm install -g npm@latest
```

### Installation Steps

1. Install the MCP server package:

```bash
npm install -g aindreyway-mcp-codex-keeper
```

2. Tell your Cline assistant to add this configuration:

```
Add MCP server with this configuration:

{
  "mcpServers": {
    "aindreyway-codex-keeper": {
      "command": "npx",
      "args": ["-y", "aindreyway-mcp-codex-keeper@latest"],
      "disabled": false
    }
  }
}
```

### Troubleshooting

If you encounter errors:

1. Fix npm permissions (if you see EACCES errors):

   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. Clear npm cache and reinstall:

   ```bash
   npm cache clean --force
   npm install -g aindreyway-mcp-codex-keeper
   ```

3. Make sure your Node.js version is compatible:

   ```bash
   node --version  # Should be 18 or later
   ```

4. If you still see module errors, try:
   ```bash
   npm rebuild
   npm install -g aindreyway-mcp-codex-keeper
   ```

## 🎯 What Your Assistant Can Do

Ask your assistant to:

- "Show me the latest React documentation"
- "Find best practices for TypeScript development"
- "Update documentation for Node.js"
- "Search for information about async/await"

## 🛠 Available Tools

### list_documentation

Lists all available documentation sources with optional category filtering.

### add_documentation

Add new documentation sources to the knowledge base.

### update_documentation

Update existing documentation to get the latest content.

### search_documentation

Search through documentation with category filtering.

## 📚 Documentation Categories

- Frontend
- Backend
- Language
- MCP
- MCP-Guide
- Database
- DevOps
- Security
- Testing
- Architecture
- Mobile
- AI
- Cloud

## 🔧 Technical Details

The server automatically:

- Manages documentation from various sources
- Keeps track of latest development best practices
- Provides intelligent search capabilities
- Updates documentation automatically
- Supports tagging and categorization

## 📝 License

MIT License - feel free to use this in your projects!

## 👤 Author

**aindreyway**

- GitHub: [@aindreyway](https://github.com/aindreyway)

## ⭐️ Support

Give a ⭐️ if this project helped you!
