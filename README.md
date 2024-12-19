# Aindreyway MCP Codex Keeper

![MCP Server](https://img.shields.io/badge/MCP-Server-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

An intelligent MCP server that serves as a guardian of development knowledge, providing Cline assistants with curated access to latest documentation and best practices across the software development landscape.

## 🌟 Features

- **Smart Documentation Management**: Automatically fetches and indexes documentation from various sources
- **Best Practices Integration**: Keeps track of latest development best practices
- **Category-based Organization**: Well-organized documentation by technology and domain
- **Intelligent Search**: Fast and accurate documentation search
- **Auto-updating Sources**: Keeps documentation up-to-date automatically
- **Easy Integration**: Simple setup with Cline assistant

## 🚀 Quick Start

### Installation

Add to your Cline MCP settings (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "codex-keeper": {
      "command": "npx",
      "args": ["-y", "aindreyway-mcp-codex-keeper@latest"],
      "disabled": false
    }
  }
}
```

That's it! Your Cline assistant will now have access to the latest documentation and best practices.

### Usage Examples

Ask your Cline assistant to:

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
- And more...

## 🔧 Configuration

The server automatically stores documentation in a local cache for fast access. No additional configuration required!

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## 📝 License

MIT License - feel free to use this in your projects!

## 🔗 Links

- [GitHub Repository](https://github.com/aindreyway/aindreyway-mcp-codex-keeper)
- [Issue Tracker](https://github.com/aindreyway/aindreyway-mcp-codex-keeper/issues)
- [MCP Documentation](https://modelcontextprotocol.io)

## 👤 Author

**aindreyway**

- GitHub: [@aindreyway](https://github.com/aindreyway)

## ⭐️ Show your support

Give a ⭐️ if this project helped you!
