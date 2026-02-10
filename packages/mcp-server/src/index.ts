#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "node:child_process";

import {
  createPresentationTool,
  handleCreatePresentation,
} from "./tools/create.js";
import {
  listPresentationsTool,
  handleListPresentations,
} from "./tools/list.js";
import {
  getPresentationTool,
  handleGetPresentation,
} from "./tools/get.js";
import {
  deletePresentationTool,
  handleDeletePresentation,
} from "./tools/delete.js";

// Resolve auth token: env vars first, then gh CLI
function resolveToken(): string {
  if (process.env.SLIDEMAKER_TOKEN) return process.env.SLIDEMAKER_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;

  try {
    const token = execSync("gh auth token", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    if (token) return token;
  } catch {
    // gh CLI not available or not authenticated
  }

  throw new Error(
    "No auth token found. Set SLIDEMAKER_TOKEN, GITHUB_TOKEN, or run 'gh auth login'."
  );
}

const BASE_URL =
  process.env.SLIDEMAKER_API_URL ?? "http://localhost:3000";

const server = new Server(
  { name: "slidemaker", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    createPresentationTool,
    listPresentationsTool,
    getPresentationTool,
    deletePresentationTool,
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const token = resolveToken();

  switch (name) {
    case "create_presentation":
      return handleCreatePresentation(
        args as { topic: string; style?: string; numSlides?: number },
        BASE_URL,
        token
      );

    case "list_presentations":
      return handleListPresentations(
        args as Record<string, never>,
        BASE_URL,
        token
      );

    case "get_presentation":
      return handleGetPresentation(
        args as { slug: string },
        BASE_URL,
        token
      );

    case "delete_presentation":
      return handleDeletePresentation(
        args as { slug: string },
        BASE_URL,
        token
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SlideМaker MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
