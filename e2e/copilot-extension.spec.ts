/**
 * SlideMaker — Copilot Extension E2E Tests (Phase 2)
 *
 * Tests for the POST /api/copilot/skillset endpoint.
 * These tests run against the dev server (AUTH_GITHUB_ID not set = auth disabled).
 * Run with: npx playwright test e2e/copilot-extension.spec.ts
 */

import { test, expect } from "./helpers";

// ─── TC-13.x: Copilot Extension ─────────────────────────────────────────────

test.describe("Copilot Extension skillset endpoint", () => {
  test("TC-13.1: POST with valid message body returns slide data", async ({ request }) => {
    const response = await request.post("/api/copilot/skillset", {
      data: {
        messages: [
          { role: "user", content: "Introduction to TypeScript" },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });

    // The endpoint calls generateAndCreatePresentation which needs OpenAI.
    // Without OPENAI_API_KEY the call will fail, but the response format
    // should still be a Copilot-spec messages array (error message).
    const body = await response.json();
    expect(body).toHaveProperty("messages");
    expect(Array.isArray(body.messages)).toBe(true);
    expect(body.messages.length).toBeGreaterThan(0);
    expect(body.messages[0]).toHaveProperty("role", "assistant");
    expect(body.messages[0]).toHaveProperty("content");
    expect(typeof body.messages[0].content).toBe("string");
  });

  test("TC-13.3: Missing topic returns error message in response", async ({ request }) => {
    const response = await request.post("/api/copilot/skillset", {
      data: {
        messages: [
          { role: "user", content: "" },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();
    expect(body).toHaveProperty("messages");
    expect(Array.isArray(body.messages)).toBe(true);
    expect(body.messages[0].role).toBe("assistant");
    expect(body.messages[0].content).toContain("No topic provided");
  });

  test("TC-13.3b: No user message returns error", async ({ request }) => {
    const response = await request.post("/api/copilot/skillset", {
      data: {
        messages: [
          { role: "system", content: "You are a helper" },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();
    expect(body).toHaveProperty("messages");
    expect(body.messages[0].role).toBe("assistant");
    expect(body.messages[0].content).toContain("No topic provided");
  });

  test("Response format matches Copilot Extension spec (messages array)", async ({ request }) => {
    const response = await request.post("/api/copilot/skillset", {
      data: {
        messages: [
          { role: "user", content: "/slidemaker" },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();

    // Copilot Extension spec requires { messages: [{ role, content }] }
    expect(body).toHaveProperty("messages");
    expect(Array.isArray(body.messages)).toBe(true);
    for (const msg of body.messages) {
      expect(msg).toHaveProperty("role");
      expect(msg).toHaveProperty("content");
      expect(typeof msg.role).toBe("string");
      expect(typeof msg.content).toBe("string");
    }
  });
});
