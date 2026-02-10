import { execSync } from "child_process";
import OpenAI from "openai";

let _openai: OpenAI | null = null;

/**
 * Resolves a GitHub token for authenticating with GitHub Models API.
 * Priority: GITHUB_TOKEN env var → `gh auth token` CLI fallback.
 */
export function resolveGitHubToken(): string {
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }

  try {
    const token = execSync("gh auth token", {
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (token) {
      return token;
    }
  } catch {
    // gh CLI not available or not authenticated — fall through
  }

  throw new Error(
    "No GitHub token found. Either set GITHUB_TOKEN environment variable " +
      "or run 'gh auth login' to authenticate with the GitHub CLI."
  );
}

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const token = resolveGitHubToken();
    _openai = new OpenAI({
      apiKey: token,
      baseURL: "https://models.github.ai/inference",
    });
  }
  return _openai;
}

/** @deprecated Use getOpenAIClient() for lazy initialization */
export const openai = undefined as unknown as OpenAI;
