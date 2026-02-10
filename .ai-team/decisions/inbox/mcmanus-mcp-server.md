# Decision: MCP Server Package for SlideМaker

**Author:** McManus (Backend Dev)
**Date:** 2025-07-15
**Status:** Implemented
**Issue:** #47

## Context

MCP (Model Context Protocol) is a standard for exposing tools to AI assistants like Claude, Copilot CLI, and other MCP-compatible clients. Adding an MCP server lets any MCP client create, list, get, and delete SlideМaker presentations through natural language.

## Decision

Created a standalone npm package at `packages/mcp-server/` that wraps the SlideМaker API as MCP tools using `@modelcontextprotocol/sdk` with stdio transport.

## How It Works

The MCP server is a thin HTTP client — all business logic stays in the Next.js API. Each tool validates input, calls the SlideМaker REST API with Bearer token auth, and returns formatted results.

### Token Resolution Order

1. `SLIDEMAKER_TOKEN` env var
2. `GITHUB_TOKEN` env var
3. `gh auth token` CLI output (subprocess, 5s timeout)

If none are found, the server throws a clear error at tool invocation time.

### Configuration

| Env Var | Description | Default |
|---|---|---|
| `SLIDEMAKER_API_URL` | Base URL of the SlideМaker app | `http://localhost:3000` |
| `SLIDEMAKER_TOKEN` | Auth token (highest priority) | — |
| `GITHUB_TOKEN` | Fallback auth token | — |

## MCP Tools

### `create_presentation`
- **Input:** `{ topic: string, style?: string, numSlides?: number }`
- **Calls:** `POST /api/generate` → `POST /api/presentations`
- **Output:** `{ url, title, slideCount, theme, slides[] }`
- **Style options:** professional, creative, minimal, technical

### `list_presentations`
- **Input:** `{}`
- **Calls:** `GET /api/presentations`
- **Output:** `{ presentations: [{ title, url, slideCount, updatedAt }] }`

### `get_presentation`
- **Input:** `{ slug: string }`
- **Calls:** `GET /api/presentations/{slug}`
- **Output:** `{ title, theme, slideCount, slides: [{ title, content }], url }`

### `delete_presentation`
- **Input:** `{ slug: string }`
- **Calls:** `DELETE /api/presentations/{slug}`
- **Output:** `{ success: boolean }`

## Running Locally

```bash
# Build
cd packages/mcp-server
npm install
npm run build

# Run directly
SLIDEMAKER_API_URL=http://localhost:3000 node dist/index.js

# Or via npm
npm start
```

### Claude Desktop config (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "slidemaker": {
      "command": "node",
      "args": ["path/to/slidemaker/packages/mcp-server/dist/index.js"],
      "env": {
        "SLIDEMAKER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Package Structure

```
packages/mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # MCP server entry, stdio transport, tool routing
│   ├── api.ts          # Shared HTTP client for SlideМaker API
│   └── tools/
│       ├── create.ts   # create_presentation tool
│       ├── list.ts     # list_presentations tool
│       ├── get.ts      # get_presentation tool
│       └── delete.ts   # delete_presentation tool
└── dist/               # Compiled output (ES2022, ESNext modules)
```

## Constraints

- This is a **separate package** — does not modify the main Next.js app
- The MCP server is a thin client; all business logic lives in the API
- Uses stdio transport (standard for MCP servers)
- TypeScript with ES modules targeting ES2022
