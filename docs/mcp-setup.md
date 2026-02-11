# SlideМaker MCP Server Setup

The SlideМaker MCP server exposes presentation management as tools for any MCP-compatible client — Claude Desktop, GitHub Copilot CLI, VS Code, and others.

## Installation

```bash
# Run directly (no install needed)
npx @slidemaker/mcp-server

# Or install globally
npm install -g @slidemaker/mcp-server
```

The server communicates over **stdio** using the Model Context Protocol.

## Authentication

The server resolves an auth token using this priority:

1. `SLIDEMAKER_TOKEN` environment variable
2. `GITHUB_TOKEN` environment variable
3. GitHub CLI (`gh auth token`) — if `gh` is installed and authenticated

Set a token in your shell before starting the server, or configure it in the client config (see below).

```bash
# Option A: Export directly
export SLIDEMAKER_TOKEN="$(gh auth token)"

# Option B: Use GitHub CLI (no env var needed)
gh auth login
```

> **⚠️ Never commit tokens to source control.** Use environment variables or the `gh` CLI fallback.

## Client Configuration

### Claude Desktop

Copy `docs/mcp-configs/claude_desktop_config.json` to your Claude Desktop config directory:

| OS      | Path                                                        |
| ------- | ----------------------------------------------------------- |
| macOS   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json`               |

```json
{
  "mcpServers": {
    "slidemaker": {
      "command": "npx",
      "args": ["@slidemaker/mcp-server"],
      "env": {
        "SLIDEMAKER_API_URL": "https://your-app.azurecontainerapps.io",
        "SLIDEMAKER_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Replace `SLIDEMAKER_API_URL` with your deployed instance URL. For local development, use `http://localhost:3000`.

### GitHub Copilot CLI

Add to your `~/.github/copilot-mcp.json` (or project-level `.github/copilot-mcp.json`):

```json
{
  "servers": {
    "slidemaker": {
      "command": "npx",
      "args": ["@slidemaker/mcp-server"],
      "env": {
        "SLIDEMAKER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Copilot CLI automatically provides `GITHUB_TOKEN`, so no explicit token configuration is needed.

### VS Code

Add to your `.vscode/mcp.json` (workspace) or user settings:

```json
{
  "mcp": {
    "servers": {
      "slidemaker": {
        "command": "npx",
        "args": ["@slidemaker/mcp-server"],
        "env": {
          "SLIDEMAKER_API_URL": "http://localhost:3000"
        }
      }
    }
  }
}
```

## Available Tools

### `create_presentation`

Generate a new presentation with AI.

| Parameter   | Type   | Required | Description                                                    |
| ----------- | ------ | -------- | -------------------------------------------------------------- |
| `topic`     | string | ✅       | The topic or subject for the presentation                      |
| `style`     | string | —        | `professional`, `creative`, `minimal`, or `technical` (default: `professional`) |
| `numSlides` | number | —        | Number of slides to generate, 1–20 (default: 5)               |

**Example:**

```
Create a presentation about "Kubernetes Best Practices" with 8 slides in a technical style.
```

### `list_presentations`

List all saved presentations. Returns titles, URLs, slide counts, and last-updated timestamps.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| *(none)*  |      |          |             |

**Example:**

```
List all my presentations.
```

### `get_presentation`

Get full details of a presentation by its slug, including all slide titles and content.

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `slug`    | string | ✅       | The URL slug of the presentation  |

**Example:**

```
Show me the presentation with slug "kubernetes-best-practices".
```

### `delete_presentation`

Delete a presentation by its slug.

| Parameter | Type   | Required | Description                              |
| --------- | ------ | -------- | ---------------------------------------- |
| `slug`    | string | ✅       | The URL slug of the presentation to delete |

**Example:**

```
Delete the presentation "old-draft".
```

## Environment Variables

| Variable              | Description                                      | Default                |
| --------------------- | ------------------------------------------------ | ---------------------- |
| `SLIDEMAKER_API_URL`  | Base URL of the SlideМaker API                   | `http://localhost:3000` |
| `SLIDEMAKER_TOKEN`    | Auth token (takes priority over `GITHUB_TOKEN`)  | —                      |
| `GITHUB_TOKEN`        | Fallback auth token                              | —                      |

## Troubleshooting

### "No auth token found"

The server could not resolve an authentication token. Fix by either:

- Setting `SLIDEMAKER_TOKEN` or `GITHUB_TOKEN` in your environment or client config
- Running `gh auth login` so the server can use `gh auth token`

### Connection refused / ECONNREFUSED

The `SLIDEMAKER_API_URL` is unreachable. Verify:

- The SlideМaker app is running at the configured URL
- For local development: run `npm run dev` in the project root first
- For production: check the Azure Container Apps URL is correct

### "Unknown tool" error

You are calling a tool name that doesn't exist. The available tools are: `create_presentation`, `list_presentations`, `get_presentation`, `delete_presentation`.

### npx hangs or fails

- Ensure Node.js 18+ is installed
- Try clearing the npx cache: `npx --yes @slidemaker/mcp-server`
- If behind a proxy, configure `npm` proxy settings

### Claude Desktop doesn't show SlideМaker tools

- Restart Claude Desktop after updating the config file
- Check the config file is valid JSON (no trailing commas)
- Verify the config file is in the correct path for your OS
