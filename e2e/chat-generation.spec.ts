import { test, expect } from "./helpers";

/**
 * Chat generation tests require the GitHub Models API.
 * These tests are skipped when the API is unavailable.
 */

test.describe("Chat-based Slide Generation", () => {
  test.beforeEach(async ({ page }) => {
    // Probe the generate endpoint to check API availability
    const res = await page.request.post("/api/generate", {
      data: { topic: "ping", numSlides: 1 },
    });
    if (!res.ok()) {
      const body = await res.json().catch(() => ({}));
      const errorMsg = String(body.error ?? "");
      if (
        res.status() === 401 ||
        res.status() === 403 ||
        errorMsg.includes("auth") ||
        errorMsg.includes("token") ||
        errorMsg.includes("API key")
      ) {
        test.skip(true, "GitHub Models API not available");
      }
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup any presentations created during tests
    const res = await page.request.get("/api/presentations");
    if (res.ok()) {
      const presentations = await res.json();
      for (const p of presentations) {
        if (p.title?.includes("TypeScript")) {
          await page.request.delete(`/api/presentations/${p.id}`);
        }
      }
    }
  });

  test("new presentation page shows chat sidebar", async ({ page }) => {
    await page.goto("/presentation/new");

    await expect(page.locator("text=AI Chat")).toBeVisible();
    await expect(
      page.locator('input[placeholder*="TypeScript"]').or(
        page.locator('input[placeholder*="presentation"]')
      )
    ).toBeVisible();
  });

  test("submitting a topic generates slides", async ({ page }) => {
    await page.goto("/presentation/new");

    const chatInput = page.locator(
      'input[placeholder*="TypeScript"], input[placeholder*="presentation"], input[placeholder*="topic"]'
    );
    await chatInput.fill("Create a presentation about TypeScript basics");
    await page.locator("button", { hasText: "Send" }).click();

    // Wait for generation indicator
    await expect(page.locator("text=Generating slides")).toBeVisible({
      timeout: 5000,
    });

    // Wait for slides to render (AI response can take up to 30s)
    await expect(page.locator(".reveal")).toBeVisible({ timeout: 30_000 });

    // URL should change from /presentation/new to /presentation/{slug}
    await expect(page).not.toHaveURL(/\/presentation\/new/);
    expect(page.url()).toMatch(/\/presentation\/[\w-]+/);
  });

  test("generated slides appear in the viewer with chat summary", async ({
    page,
  }) => {
    await page.goto("/presentation/new");

    const chatInput = page.locator(
      'input[placeholder*="TypeScript"], input[placeholder*="presentation"], input[placeholder*="topic"]'
    );
    await chatInput.fill("TypeScript best practices");
    await page.locator("button", { hasText: "Send" }).click();

    // Wait for reveal.js to initialize
    await expect(page.locator(".reveal .slides section").first()).toBeVisible({
      timeout: 30_000,
    });

    const slideCount = await page.locator(".reveal .slides section").count();
    expect(slideCount).toBeGreaterThanOrEqual(1);

    // Chat should show the generated slides summary
    await expect(page.locator("text=Generated")).toBeVisible();
  });
});
