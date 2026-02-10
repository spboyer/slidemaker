import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  fixtureSlides,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-console-errors-test";

test.describe.serial("Browser Console Errors", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Console Error Test",
      slides: fixtureSlides(3),
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("no uncaught JavaScript errors on presentation load", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));

    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Give time for any async errors (rAF loops, etc.)
    await page.waitForTimeout(2000);

    // Filter out known benign errors if any exist
    const realErrors = errors.filter(
      (e) => !e.message.includes("Tracking Prevention")
    );

    expect(realErrors).toHaveLength(0);
  });

  test("no uncaught errors during slide navigation", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));

    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Navigate through slides
    await page.locator('button[aria-label="Next slide"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button[aria-label="Next slide"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button[aria-label="Previous slide"]').click();
    await page.waitForTimeout(1000);

    const realErrors = errors.filter(
      (e) => !e.message.includes("Tracking Prevention")
    );

    expect(realErrors).toHaveLength(0);
  });

  test("no errors with content that previously used r-fit-text", async ({ page }) => {
    // Create a presentation with content that mimics what AI used to generate
    const SLUG_FIT = "e2e-fit-text-test";
    createFixturePresentation(SLUG_FIT, {
      title: "Fit Text Test",
      slides: [
        {
          title: "",
          content: '<h2 class="r-fit-text">Big Title</h2>',
        },
        {
          title: "Normal Slide",
          content: "<p>Regular content</p>",
        },
      ],
    });

    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));

    await page.goto(`/presentation/${SLUG_FIT}`);
    await waitForReveal(page);
    await page.waitForTimeout(2000);

    deleteFixturePresentation(SLUG_FIT);

    const realErrors = errors.filter(
      (e) => !e.message.includes("Tracking Prevention")
    );

    expect(realErrors).toHaveLength(0);
  });
});
