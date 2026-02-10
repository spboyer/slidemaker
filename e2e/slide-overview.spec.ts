import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  fixtureSlides,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-overview-test";

test.describe("Slide Overview Mode", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Overview Test",
      slides: fixtureSlides(6),
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("overview button toggles overview mode", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Click the overview button (▦) in the top bar
    await page.locator('button[title="Slide overview (O)"]').first().click();

    // reveal.js adds the .overview class to .reveal when in overview mode
    await expect(page.locator(".reveal.overview")).toBeVisible({
      timeout: 5000,
    });
  });

  test("clicking overview button again exits overview mode", async ({
    page,
  }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const overviewBtn = page
      .locator('button[title="Slide overview (O)"]')
      .first();

    await overviewBtn.click();
    await expect(page.locator(".reveal.overview")).toBeVisible({
      timeout: 5000,
    });

    await overviewBtn.click();
    await expect(page.locator(".reveal.overview")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("all slides are visible in overview mode", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator('button[title="Slide overview (O)"]').first().click();
    await expect(page.locator(".reveal.overview")).toBeVisible({
      timeout: 5000,
    });

    const sections = page.locator(".reveal .slides section");
    await expect(sections).toHaveCount(6);
  });
});
