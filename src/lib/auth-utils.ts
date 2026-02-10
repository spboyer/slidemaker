/**
 * Bearer token validation and rate limiting utilities.
 * Used by middleware to authenticate API clients via GitHub PATs.
 */

import { createHash } from "crypto";

// --- Types ---

export interface GitHubUser {
  userId: string;
  username: string;
  avatarUrl: string;
}

interface CachedToken extends GitHubUser {
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// --- Token validation cache (5-minute TTL) ---

const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;
const tokenCache = new Map<string, CachedToken>();

// Periodic cleanup every 60s
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanupInterval(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokenCache) {
      if (entry.expiresAt <= now) {
        tokenCache.delete(key);
      }
    }
    // Also clean up expired rate limit entries
    for (const [key, entry] of rateLimitMap) {
      if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }, 60_000);
  // Don't prevent Node from exiting
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/** Hash a token with SHA-256 so we never store raw tokens in memory. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Validate a GitHub bearer token by calling the GitHub API.
 * Returns cached result if available and not expired.
 */
export async function validateBearerToken(
  token: string,
): Promise<GitHubUser | null> {
  ensureCleanupInterval();

  const hash = hashToken(token);
  const now = Date.now();

  // Check cache
  const cached = tokenCache.get(hash);
  if (cached && cached.expiresAt > now) {
    return {
      userId: cached.userId,
      username: cached.username,
      avatarUrl: cached.avatarUrl,
    };
  }

  // Validate against GitHub API
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "SlideMaker/1.0",
      },
    });

    if (!res.ok) {
      tokenCache.delete(hash);
      return null;
    }

    const data = (await res.json()) as {
      id: number;
      login: string;
      avatar_url: string;
    };

    const user: GitHubUser = {
      userId: String(data.id),
      username: data.login,
      avatarUrl: data.avatar_url,
    };

    // Cache the result
    tokenCache.set(hash, {
      ...user,
      expiresAt: now + TOKEN_CACHE_TTL_MS,
    });

    return user;
  } catch {
    return null;
  }
}

// --- Rate limiting (fixed window, 60 req/min per user) ---

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given user ID.
 * Uses a fixed-window approach: 60 requests per 60-second window.
 */
export function checkRateLimit(userId: string): RateLimitResult {
  ensureCleanupInterval();

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil(
      (entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000,
    );
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

// --- Test helpers (exported for testing only) ---

export function _resetForTesting(): void {
  tokenCache.clear();
  rateLimitMap.clear();
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}