import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
} from "./helpers";

const SLUG = "e2e-crud-test";

test.describe("Presentation CRUD", () => {
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

    await page.goto(`/presentation/${SLUG}`);
    await expect(page.locator(".reveal")).toBeVisible();
    await expect(page.locator(".reveal .slides section").first()).toBeVisible();
  });

  test("delete a presentation and verify removal", async ({ page }) => {
    createFixturePresentation("e2e-crud-delete", {
      title: "To Be Deleted",
    });

    await page.goto("/");
    await expect(page.locator("text=To Be Deleted")).toBeVisible();

    // Accept the confirm dialog before clicking delete
    page.on("dialog", (dialog) => dialog.accept());
    const deleteBtn = page
      .locator("text=To Be Deleted")
      .locator("..")
      .locator("..")
      .locator("button", { hasText: "Delete" });
    await deleteBtn.click();

    await expect(page.locator("text=To Be Deleted")).not.toBeVisible();
  });
});
