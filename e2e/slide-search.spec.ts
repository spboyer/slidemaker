import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-search-test";

test.describe.serial("Slide Search (Cmd+K)", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Search Test Deck",
      slides: [
        { title: "Introduction", content: "<p>Welcome to the presentation</p>" },
        { title: "Architecture Overview", content: "<p>System design and components</p>" },
        { title: "Performance Metrics", content: "<p>Latency and throughput numbers</p>" },
        { title: "Roadmap", content: "<p>Future plans and milestones</p>" },
        { title: "Closing", content: "<p>Thank you and Q&A</p>" },
      ],
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("search button is visible in nav bar", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const searchBtn = page.locator('button[aria-label="Search slides"]');
    await expect(searchBtn).toBeVisible();
  });

  test("clicking search button opens search overlay", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator('button[aria-label="Search slides"]').click();
    await expect(page.locator('input[placeholder="Search slides…"]')).toBeVisible();
  });

  test("Ctrl+K opens search overlay", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    await expect(page.locator('input[placeholder="Search slides…"]')).toBeVisible();
  });

  test("search filters slides by title", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    const input = page.locator('input[placeholder="Search slides…"]');
    await input.fill("Architecture");

    // Should show only the Architecture slide
    const results = page.locator('button:has-text("Architecture Overview")');
    await expect(results).toBeVisible();

    // Other slides should not be visible
    await expect(page.locator('button:has-text("Roadmap")')).not.toBeVisible();
  });

  test("search filters slides by content", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    const input = page.locator('input[placeholder="Search slides…"]');
    await input.fill("throughput");

    const results = page.locator('button:has-text("Performance Metrics")');
    await expect(results).toBeVisible();
  });

  test("selecting a search result navigates to that slide", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await expect(page.locator("text=1 / 5")).toBeVisible();

    await page.keyboard.press("Control+k");
    const input = page.locator('input[placeholder="Search slides…"]');
    await input.fill("Roadmap");

    await page.locator('button:has-text("Roadmap")').click();

    // Search overlay should close
    await expect(input).not.toBeVisible();

    // Should be on slide 4
    await expect(page.locator("text=4 / 5")).toBeVisible({ timeout: 5_000 });
  });

  test("Escape closes search overlay", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    const input = page.locator('input[placeholder="Search slides…"]');
    await expect(input).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(input).not.toBeVisible();
  });

  test("no results shown for non-matching query", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    const input = page.locator('input[placeholder="Search slides…"]');
    await input.fill("xyznonexistent");

    await expect(page.locator("text=No matching slides")).toBeVisible();
  });

  test("keyboard navigation in search results", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.keyboard.press("Control+k");
    // All slides visible when query is empty — press down then enter
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Should navigate to slide 3
    await expect(page.locator("text=3 / 5")).toBeVisible({ timeout: 5_000 });
  });
});
