### MCP Configuration Files and Client Setup Documentation
**Author:** Keyser (Lead) · **Date:** 2025-07-23 · **Issue:** #48 · **Status:** Proposed

Added MCP client configuration files and setup documentation for the `@slidemaker/mcp-server` package.

**What was created:**

- `docs/mcp-configs/claude_desktop_config.json` — Claude Desktop MCP server config
- `docs/mcp-configs/copilot-mcp.json` — GitHub Copilot CLI MCP server config
- `docs/mcp-configs/vscode-mcp.json` — VS Code MCP server config
- `docs/mcp-setup.md` — Complete setup guide covering installation, authentication, per-client configuration, all four tool schemas with examples, environment variables reference, and troubleshooting

**Key decisions:**

- Auth token resolution order follows the existing server logic: `SLIDEMAKER_TOKEN` → `GITHUB_TOKEN` → `gh auth token`. Documented all three paths.
- Claude Desktop config uses the Azure Container Apps URL as default (`https://your-app.azurecontainerapps.io`) since it targets production. Copilot CLI and VS Code configs default to `http://localhost:3000` for local development.
- Copilot CLI config omits explicit token config because Copilot CLI injects `GITHUB_TOKEN` automatically.
- No secrets in any committed file — all configs use env var references or placeholders.
- Tool documentation includes parameter schemas, types, required flags, and natural-language usage examples derived from the actual tool definitions in `packages/mcp-server/src/tools/`.
