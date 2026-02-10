/**
 * SlideMaker — CORS E2E Tests (Phase 2)
 *
 * Tests for CORS middleware behavior on API endpoints.
 * Stubs only — implementations will be added after McManus completes #44.
 * Run with: npx playwright test e2e/cors.spec.ts
 */

import { test } from "./helpers";

// ─── TC-12.x: CORS Middleware ───────────────────────────────────────────────

test.describe("CORS", () => {
  test.fixme("TC-12.1: OPTIONS preflight returns correct headers", async ({ page }) => {
    // Will send OPTIONS to /api/presentations and verify
    // Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers
  });

  test.fixme("TC-12.2: API responses include CORS headers", async ({ page }) => {
    // Will send GET to /api/presentations and verify CORS headers present
  });

  test.fixme("TC-12.3: Dev mode allows all origins", async ({ page }) => {
    // Will verify Access-Control-Allow-Origin: * in development mode
  });
});
