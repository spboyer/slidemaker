import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";
import type { Slide } from "../src/lib/types";

const SLUG = "e2e-slide-layouts-test";

/**
 * Tests for the new slide layout types added to support richer visual patterns:
 * - stat-cards: metric/KPI grids
 * - timeline: step-by-step process flows
 * - grid-cards: feature/benefit card grids
 */
test.describe.serial("New Slide Layout Types", () => {
  const slides: Slide[] = [
    {
      title: "",
      content: "<h1>Layout Test Deck</h1><p>Testing new layouts</p>",
      layout: "center",
      backgroundGradient: "linear-gradient(135deg, #0c0c1d 0%, #2d1b69 100%)",
    },
    {
      title: "Key Metrics",
      content: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px">
        <div style="border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px;background:rgba(255,255,255,0.05)">
          <div style="font-size:2.5em;font-weight:bold;color:#3b82f6">$2.4B</div>
          <div style="font-size:0.85em;opacity:0.7;margin-top:4px">Market Size</div>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px;background:rgba(255,255,255,0.05)">
          <div style="font-size:2.5em;font-weight:bold;color:#3b82f6">150K</div>
          <div style="font-size:0.85em;opacity:0.7;margin-top:4px">Users</div>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:24px;background:rgba(255,255,255,0.05)">
          <div style="font-size:2.5em;font-weight:bold;color:#3b82f6">99.9%</div>
          <div style="font-size:0.85em;opacity:0.7;margin-top:4px">Uptime</div>
        </div>
      </div>`,
      layout: "stat-cards",
    },
    {
      title: "How It Works",
      content: `<div style="display:flex;flex-direction:column;gap:0;margin-top:24px">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:36px;height:36px;border-radius:50%;border:2px solid rgba(59,130,246,0.5);background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#3b82f6">1</div>
            <div style="width:2px;height:40px;background:rgba(255,255,255,0.1)"></div>
          </div>
          <div><strong>Upload</strong><p style="font-size:0.85em;opacity:0.7">Upload your content</p></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:16px">
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:36px;height:36px;border-radius:50%;border:2px solid rgba(59,130,246,0.5);background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;font-weight:bold;color:#3b82f6">2</div>
          </div>
          <div><strong>Process</strong><p style="font-size:0.85em;opacity:0.7">AI generates slides</p></div>
        </div>
      </div>`,
      layout: "timeline",
    },
    {
      title: "Features",
      content: `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:24px">
        <div style="border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:20px;background:rgba(255,255,255,0.03)">
          <strong>AI Generation</strong>
          <p style="font-size:0.85em;opacity:0.7;margin-top:6px">Create slides from a simple prompt</p>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:20px;background:rgba(255,255,255,0.03)">
          <strong>Live Preview</strong>
          <p style="font-size:0.85em;opacity:0.7;margin-top:6px">See changes in real-time</p>
        </div>
      </div>`,
      layout: "grid-cards",
    },
    {
      title: "Standard Content",
      content: "<ul><li>Point 1</li><li>Point 2</li><li>Point 3</li></ul>",
      layout: "default",
    },
  ];

  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Layout Types Test",
      slides,
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("presentation loads with all layout slides", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const sections = page.locator(".reveal .slides section");
    await expect(sections).toHaveCount(5);
  });

  test("stat-cards slide renders grid content", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate to the stat-cards slide (slide 2)
    await page.locator('button[aria-label="Next slide"]').click();
    await expect(page.locator("text=2 / 5")).toBeVisible({ timeout: 5_000 });

    // Verify the stat card content rendered
    const section = page.locator(".reveal .slides section").nth(1);
    await expect(section.locator("text=$2.4B")).toBeVisible();
    await expect(section.locator("text=150K")).toBeVisible();
    await expect(section.locator("text=99.9%")).toBeVisible();
  });

  test("timeline slide renders process steps", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate to timeline slide (slide 3)
    for (let i = 0; i < 2; i++) {
      await page.locator('button[aria-label="Next slide"]').click();
    }
    await expect(page.locator("text=3 / 5")).toBeVisible({ timeout: 5_000 });

    const section = page.locator(".reveal .slides section").nth(2);
    await expect(section.locator("strong", { hasText: "Upload" })).toBeVisible();
    await expect(section.locator("strong", { hasText: "Process" })).toBeVisible();
  });

  test("grid-cards slide renders feature cards", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate to grid-cards slide (slide 4)
    for (let i = 0; i < 3; i++) {
      await page.locator('button[aria-label="Next slide"]').click();
    }
    await expect(page.locator("text=4 / 5")).toBeVisible({ timeout: 5_000 });

    const section = page.locator(".reveal .slides section").nth(3);
    await expect(section.locator("text=AI Generation")).toBeVisible();
    await expect(section.locator("text=Live Preview")).toBeVisible();
  });

  test("standard layout slide still works correctly", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate to default slide (slide 5)
    for (let i = 0; i < 4; i++) {
      await page.locator('button[aria-label="Next slide"]').click();
    }
    await expect(page.locator("text=5 / 5")).toBeVisible({ timeout: 5_000 });

    const section = page.locator(".reveal .slides section").nth(4);
    await expect(section.locator("text=Point 1")).toBeVisible();
  });

  test("layout data is persisted via API", async ({ page, request }) => {
    const res = await request.get(`/api/presentations/${SLUG}`);
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data.slides[1].layout).toBe("stat-cards");
    expect(data.slides[2].layout).toBe("timeline");
    expect(data.slides[3].layout).toBe("grid-cards");
    expect(data.slides[4].layout).toBe("default");
  });

  test("no console errors with new layout types", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      if (!err.message.includes("Tracking Prevention")) {
        errors.push(err.message);
      }
    });

    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate through all slides
    for (let i = 0; i < 4; i++) {
      await page.locator('button[aria-label="Next slide"]').click();
      await page.waitForTimeout(500);
    }

    expect(errors).toEqual([]);
  });
});
