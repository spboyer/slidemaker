import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";
import type { Slide } from "../src/lib/types";

const SLUG = "e2e-editor-test";

const editorSlides: Slide[] = [
  {
    title: "Editable Slide",
    content: "<p>Original content</p>",
    transition: "slide",
    backgroundColor: "#1a1a1a",
  },
  {
    title: "Second Slide",
    content: "<p>More content</p>",
  },
];

test.describe("Slide Editor", () => {
  test.beforeEach(() => {
    createFixturePresentation(SLUG, {
      title: "Editor Test",
      slides: editorSlides,
    });
  });

  test.afterEach(() => {
    deleteFixturePresentation(SLUG);
  });

  test("Edit button opens the editor view", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();
  });

  test("editor shows title and content fields", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();

    const titleInput = page.locator('input[placeholder="Slide title"]');
    await expect(titleInput).toHaveValue("Editable Slide");

    const contentArea = page.locator("textarea");
    await expect(contentArea).toBeVisible();
  });

  test("transition dropdown reflects current value", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();

    const transitionSelect = page.locator("select").first();
    await expect(transitionSelect).toHaveValue("slide");
  });

  test("changing transition dropdown updates value", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();

    const transitionSelect = page.locator("select").first();
    await transitionSelect.selectOption("fade");
    await expect(transitionSelect).toHaveValue("fade");
  });

  test("save persists changes and returns to viewer", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();

    const titleInput = page.locator('input[placeholder="Slide title"]');
    await titleInput.clear();
    await titleInput.fill("Updated Title");

    await page.locator("select").first().selectOption("fade");

    await page.locator("button", { hasText: "Save" }).click();

    await expect(page.locator(".reveal")).toBeVisible();

    // Verify via API that changes persisted
    const res = await page.request.get(`/api/presentations/${SLUG}`);
    const data = await res.json();
    expect(data.slides[0].title).toBe("Updated Title");
    expect(data.slides[0].transition).toBe("fade");
  });

  test("cancel returns to viewer without saving", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    await page.locator("button", { hasText: "Edit" }).click();
    await expect(page.locator("text=Edit Slide")).toBeVisible();

    const titleInput = page.locator('input[placeholder="Slide title"]');
    await titleInput.clear();
    await titleInput.fill("Should Not Save");

    await page.locator("button", { hasText: "Cancel" }).click();

    await expect(page.locator(".reveal")).toBeVisible();

    // Verify title was NOT saved
    const res = await page.request.get(`/api/presentations/${SLUG}`);
    const data = await res.json();
    expect(data.slides[0].title).toBe("Editable Slide");
  });
});
