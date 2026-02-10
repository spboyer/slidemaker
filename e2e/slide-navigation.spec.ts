import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  fixtureSlides,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-nav-test";

test.describe.serial("Slide Navigation", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Navigation Test",
      slides: fixtureSlides(5),
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("displays slide counter with correct total", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await expect(page.locator("text=1 / 5")).toBeVisible();
  });

  test("clicking Next button advances slide and updates counter", async ({
    page,
  }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await expect(page.locator("text=1 / 5")).toBeVisible();
    await page.locator('button[aria-label="Next slide"]').click();
    await expect(page.locator("text=2 / 5")).toBeVisible({ timeout: 10_000 });
  });

  test("clicking Previous button goes back", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator('button[aria-label="Next slide"]').click();
    await expect(page.locator("text=2 / 5")).toBeVisible({ timeout: 10_000 });

    await page.locator('button[aria-label="Previous slide"]').click();
    await expect(page.locator("text=1 / 5")).toBeVisible({ timeout: 10_000 });
  });

  test("Previous is disabled on first slide", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const prevBtn = page.locator('button[aria-label="Previous slide"]');
    await expect(prevBtn).toBeDisabled();
  });

  test("Next is disabled on last slide", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    for (let i = 0; i < 4; i++) {
      await page.locator('button[aria-label="Next slide"]').click();
    }
    await expect(page.locator("text=5 / 5")).toBeVisible({ timeout: 10_000 });

    const nextBtn = page.locator('button[aria-label="Next slide"]');
    await expect(nextBtn).toBeDisabled();
  });

  test("reveal.js progress bar is present", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await expect(page.locator(".reveal .progress")).toBeVisible();
  });
});
