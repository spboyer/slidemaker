import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";

const SLUG = "e2e-pptx-export-test";

test.describe.serial("PPTX Export", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Export Test Deck",
      slides: [
        {
          title: "",
          content: "<h1>Export Test</h1><p>Testing PPTX export</p>",
          layout: "center",
          backgroundGradient: "linear-gradient(135deg, #0c0c1d 0%, #2d1b69 100%)",
        },
        {
          title: "Key Metrics",
          content: "<ul><li>Revenue: $1M</li><li>Users: 50K</li><li>Growth: 120%</li></ul>",
          notes: "Discuss growth trajectory",
        },
        {
          title: "Closing",
          content: "<p>Thank you!</p>",
          layout: "center",
        },
      ],
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("PPTX export button is visible in nav bar", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const pptxBtn = page.locator('button[aria-label="Export to PowerPoint"]');
    await expect(pptxBtn).toBeVisible();
  });

  test("PDF export button still present alongside PPTX", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const pdfBtn = page.locator('button[aria-label="Export to PDF"]');
    const pptxBtn = page.locator('button[aria-label="Export to PowerPoint"]');
    await expect(pdfBtn).toBeVisible();
    await expect(pptxBtn).toBeVisible();
  });

  test("clicking PPTX export triggers download", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    // Listen for download event
    const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
    await page.locator('button[aria-label="Export to PowerPoint"]').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pptx$/);
  });
});
