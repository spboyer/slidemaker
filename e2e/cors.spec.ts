/**
 * SlideMaker — CORS E2E Tests (Phase 2)
 *
 * Tests for CORS middleware behavior on API endpoints.
 * Run with: npx playwright test e2e/cors.spec.ts
 */

import { test, expect } from "./helpers";

// ─── TC-12.x: CORS Middleware ───────────────────────────────────────────────

test.describe("CORS", () => {
  test("TC-12.1: OPTIONS preflight returns correct headers", async ({ request }) => {
    const response = await request.fetch("/api/presentations", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    expect(response.status()).toBe(204);
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBeTruthy();
    expect(headers["access-control-allow-methods"]).toContain("GET");
    expect(headers["access-control-allow-methods"]).toContain("POST");
    expect(headers["access-control-allow-methods"]).toContain("PUT");
    expect(headers["access-control-allow-methods"]).toContain("DELETE");
    expect(headers["access-control-allow-headers"]).toContain("Content-Type");
    expect(headers["access-control-allow-headers"]).toContain("Authorization");
  });

  test("TC-12.2: API responses include CORS headers", async ({ request }) => {
    const response = await request.get("/api/presentations", {
      headers: {
        Origin: "http://localhost:3000",
      },
    });

    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBeTruthy();
  });

  test("TC-12.3: Dev mode allows all origins", async ({ request }) => {
    const response = await request.fetch("/api/presentations", {
      method: "OPTIONS",
      headers: {
        Origin: "http://some-random-origin.example.com",
        "Access-Control-Request-Method": "GET",
      },
    });

    expect(response.status()).toBe(204);
    const headers = response.headers();
    expect(headers["access-control-allow-origin"]).toBe("*");
  });
});
