import {
  test,
  expect,
  createFixturePresentation,
  deleteFixturePresentation,
  waitForReveal,
} from "./helpers";
import type { Slide } from "../src/lib/types";

const SLUG = "e2e-code-highlight-test";

const codeSlides: Slide[] = [
  {
    title: "Code Example",
    content: `<pre><code class="language-typescript" data-line-numbers>
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");
console.log(message);
</code></pre>`,
  },
  {
    title: "Python Example",
    content: `<pre><code class="language-python">
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result
</code></pre>`,
  },
  {
    title: "Plain Slide",
    content: "<p>This slide has no code.</p>",
  },
];

test.describe.serial("Code Highlighting", () => {
  test.beforeAll(() => {
    createFixturePresentation(SLUG, {
      title: "Code Highlight Test",
      slides: codeSlides,
    });
  });

  test.afterAll(() => {
    deleteFixturePresentation(SLUG);
  });

  test("code blocks render pre and code elements", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const codeBlock = page
      .locator(".reveal .slides section")
      .first()
      .locator("pre code");
    await expect(codeBlock).toBeVisible();
  });

  test("code elements have language class applied", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const codeBlock = page
      .locator(".reveal .slides section")
      .first()
      .locator("pre code");
    await expect(codeBlock).toHaveClass(/language-typescript/);
  });

  test("code block with data-line-numbers attribute is present", async ({
    page,
  }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const codeBlock = page
      .locator(".reveal .slides section")
      .first()
      .locator("pre code");
    await expect(codeBlock).toHaveAttribute("data-line-numbers", /.*/);
  });

  test("non-code slide does not contain pre elements", async ({ page }) => {
    await page.goto(`/presentation/${SLUG}`);
    await waitForReveal(page);

    const thirdSlide = page.locator(".reveal .slides section").nth(2);
    await expect(thirdSlide.locator("pre")).toHaveCount(0);
    // The slide content exists even when not active (reveal.js hides non-active slides)
    await expect(thirdSlide.locator("p")).toHaveCount(1);
  });
});
