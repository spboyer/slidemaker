/**
 * SlideMaker — Authentication Tests (Phase 2)
 *
 * Tests for GitHub OAuth middleware and auth bypass logic.
 * Stubs only — implementations will be added after McManus completes #41.
 * Run with: npm test
 */

import { describe, test } from "vitest";

// Imports will resolve once McManus merges #41:
// import { authMiddleware } from "@/lib/auth";

// ─── TC-11.x: Authentication ────────────────────────────────────────────────

describe("Auth middleware (OAuth configured)", () => {
  test.todo("TC-11.1: unauthenticated API request returns 401");
  test.todo("TC-11.2: valid session allows API access");
  test.todo("TC-11.4: Bearer token with valid GitHub token succeeds");
  test.todo("TC-11.5: Bearer token with invalid token returns 401");
});

describe("Auth middleware (local dev bypass)", () => {
  test.todo("TC-11.3: no auth required when AUTH_GITHUB_ID not set");
});

describe("Rate limiting", () => {
  test.todo("TC-11.6: returns 429 after threshold");
});
