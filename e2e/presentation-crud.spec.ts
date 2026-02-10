import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
} from "./helpers";

const SLUG = "e2e-crud-test";

test.describe.serial("Presentation CRUD", () => {
  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
    deleteFixturePresentation("e2e-crud-delete");
  });

  test("home page loads and shows presentation list or empty state", async ({
    page,
  }) => {
    await page.goto("/");
    const heading = page.locator("h1");
    await expect(heading).toHaveText("SlideMaker");
  });

  test("create a presentation via API and verify it appears on home", async ({
    page,
  }) => {
    const res = await page.request.post("/api/presentations", {
      data: {
        title: "CRUD Test Presentation",
        slides: [
          { title: "Slide 1", content: "<p>Hello world</p>" },
          { title: "Slide 2", content: "<p>Second slide</p>" },
        ],
      },
    });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    expect(created.id).toBeTruthy();

    await page.goto("/");
    await expect(page.locator("text=CRUD Test Presentation")).toBeVisible();

    // Cleanup
    await page.request.delete(`/api/presentations/${created.id}`);
  });

  test("navigate to a presentation page and see slides", async ({ page }) => {
    createFixturePresentation(SLUG, {
      title: "CRUD Navigation Test",
    });

    // Verify fixture exists via API before navigating
    const check = await page.request.get(`/api/presentations/${SLUG}`);
    expect(check.ok()).toBeTruthy();

    await page.goto(`/presentation/${SLUG}`);
    await expect(page.locator(".reveal.ready")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".reveal .slides section").first()).toBeVisible();
  });

  test("delete a presentation and verify removal", async ({ page }) => {
    createFixturePresentation("e2e-crud-delete", {
      title: "To Be Deleted",
    });

    // Verify fixture exists via API
    const check = await page.request.get("/api/presentations/e2e-crud-delete");
    expect(check.ok()).toBeTruthy();

    await page.goto("/");
    await expect(page.locator("text=To Be Deleted")).toBeVisible({ timeout: 10_000 });

    // Accept the confirm dialog before clicking delete
    page.on("dialog", (dialog) => dialog.accept());
    // Find the card container that holds both the title and delete button
    const card = page.locator("h2", { hasText: "To Be Deleted" }).locator("..");
    await card.locator("button", { hasText: "Delete" }).click();

    await expect(page.locator("text=To Be Deleted")).not.toBeVisible({ timeout: 10_000 });
  });
});
