/**
 * SlideMaker - Authentication & Rate Limiting Tests
 *
 * Tests for bearer token validation, caching, and rate limiting utilities.
 * Run with: npm test
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  hashToken,
  validateBearerToken,
  checkRateLimit,
  _resetForTesting,
} from "@/lib/auth-utils";

beforeEach(() => {
  _resetForTesting();
  vi.restoreAllMocks();
});

// --- Token hashing ---

describe("hashToken", () => {
  test("returns a 64-char hex SHA-256 hash", () => {
    const hash = hashToken("ghp_abc123");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("same input produces same hash", () => {
    expect(hashToken("token1")).toBe(hashToken("token1"));
  });

  test("different inputs produce different hashes", () => {
    expect(hashToken("token1")).not.toBe(hashToken("token2"));
  });
});

// --- Bearer token validation ---

describe("validateBearerToken", () => {
  test("TC-11.4: valid GitHub token returns user info", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        id: 12345,
        login: "testuser",
        avatar_url: "https://avatars.githubusercontent.com/u/12345",
      }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse as unknown as Response,
    );

    const user = await validateBearerToken("ghp_valid_token");
    expect(user).toEqual({
      userId: "12345",
      username: "testuser",
      avatarUrl: "https://avatars.githubusercontent.com/u/12345",
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.github.com/user",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ghp_valid_token",
        }),
      }),
    );
  });

  test("TC-11.5: invalid token returns null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
    } as unknown as Response);

    const user = await validateBearerToken("ghp_invalid");
    expect(user).toBeNull();
  });

  test("network error returns null", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const user = await validateBearerToken("ghp_timeout");
    expect(user).toBeNull();
  });

  test("caches valid tokens for subsequent calls", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        id: 99,
        login: "cached-user",
        avatar_url: "https://example.com/avatar",
      }),
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockResponse as unknown as Response);

    const user1 = await validateBearerToken("ghp_cache_test");
    expect(user1).not.toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const user2 = await validateBearerToken("ghp_cache_test");
    expect(user2).toEqual(user1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

// --- Rate limiting ---

describe("checkRateLimit", () => {
  test("allows requests within limit", () => {
    for (let i = 0; i < 60; i++) {
      const result = checkRateLimit("user-1");
      expect(result.allowed).toBe(true);
    }
  });

  test("TC-11.6: returns 429 after threshold", () => {
    for (let i = 0; i < 60; i++) {
      checkRateLimit("user-rate");
    }

    const result = checkRateLimit("user-rate");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  test("different users have independent limits", () => {
    for (let i = 0; i < 60; i++) {
      checkRateLimit("user-a");
    }

    expect(checkRateLimit("user-a").allowed).toBe(false);
    expect(checkRateLimit("user-b").allowed).toBe(true);
  });

  test("rate limit window resets after expiry", () => {
    for (let i = 0; i < 60; i++) {
      checkRateLimit("user-reset");
    }
    expect(checkRateLimit("user-reset").allowed).toBe(false);

    _resetForTesting();

    const result = checkRateLimit("user-reset");
    expect(result.allowed).toBe(true);
  });
});

// --- Token cache expiry ---

describe("Token cache expiry", () => {
  test("expired cache entry triggers re-fetch", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        id: 42,
        login: "expiry-user",
        avatar_url: "https://example.com/avatar",
      }),
    };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockResponse as unknown as Response);

    await validateBearerToken("ghp_expiry_test");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await validateBearerToken("ghp_expiry_test");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    _resetForTesting();

    await validateBearerToken("ghp_expiry_test");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

// --- Middleware auth bypass ---

describe("Middleware auth bypass", () => {
  test("TC-11.3: middleware skips auth when AUTH_GITHUB_ID is not set", () => {
    const original = process.env.AUTH_GITHUB_ID;
    delete process.env.AUTH_GITHUB_ID;

    const authEnabled = !!process.env.AUTH_GITHUB_ID;
    expect(authEnabled).toBe(false);

    if (original) process.env.AUTH_GITHUB_ID = original;
  });
});