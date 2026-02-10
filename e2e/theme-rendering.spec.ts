import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-theme-test";

test.describe.serial("Theme Rendering", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Theme Test",
      theme: "night",
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("initial theme CSS is loaded via link tag", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const themeLink = page.locator("#reveal-theme-link");
    await expect(themeLink).toHaveAttribute("href", /night\.css/);
  });

  test("ThemePicker dropdown opens and lists themes", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("summary", { hasText: "Theme" }).click();

    await expect(page.locator("button", { hasText: "Night" })).toBeVisible();
    await expect(page.locator("button", { hasText: "White" })).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Solarized" })
    ).toBeVisible();
  });

  test("switching to white theme updates the CSS link", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("summary", { hasText: "Theme" }).click();
    await page.locator("button", { hasText: "White" }).click();

    await expect(page.locator("#reveal-theme-link")).toHaveAttribute(
      "href",
      /white\.css/,
      { timeout: 10_000 }
    );
  });

  test("switching to solarized theme updates the CSS link", async ({
    page,
  }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("summary", { hasText: "Theme" }).click();
    await page.locator("button", { hasText: "Solarized" }).click();

    await expect(page.locator("#reveal-theme-link")).toHaveAttribute(
      "href",
      /solarized\.css/,
      { timeout: 10_000 }
    );
  });

  test("theme is persisted via API after change", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("summary", { hasText: "Theme" }).click();
    await page.locator("button", { hasText: "Moon" }).click();

    // Wait for the theme CSS to update (confirms PUT completed)
    await expect(page.locator("#reveal-theme-link")).toHaveAttribute(
      "href",
      /moon\.css/,
      { timeout: 10_000 }
    );

    const res = await page.request.get(`/api/presentations/${SLUG}`);
    const data = await res.json();
    expect(data.theme).toBe("moon");
  });
});
