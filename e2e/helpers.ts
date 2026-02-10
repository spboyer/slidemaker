import { test as base, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import type { Presentation, Slide } from "../src/lib/types";

/**
 * Shared fixture helpers for e2e tests.
 * Creates/removes presentation JSON files directly in the presentations/ directory
 * to avoid dependency on the AI generation API.
 */

const PRESENTATIONS_DIR = path.join(process.cwd(), "presentations");

export function fixtureSlides(count = 3): Slide[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `Test Slide ${i + 1}`,
    content: `<p>Content for slide ${i + 1}</p>`,
    notes: `Speaker notes for slide ${i + 1}`,
  }));
}

export function createFixturePresentation(
  slug: string,
  overrides: Partial<Presentation> = {}
): Presentation {
  const now = new Date().toISOString();
  const presentation: Presentation = {
    id: slug,
    title: overrides.title ?? "E2E Test Presentation",
    createdAt: now,
    updatedAt: now,
    slides: overrides.slides ?? fixtureSlides(),
    theme: overrides.theme ?? "night",
    transition: overrides.transition ?? "slide",
  };

  fs.mkdirSync(PRESENTATIONS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(PRESENTATIONS_DIR, `${slug}.json`),
    JSON.stringify(presentation, null, 2)
  );

  return presentation;
}

export function deleteFixturePresentation(slug: string): void {
  const filePath = path.join(PRESENTATIONS_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/** Wait for reveal.js to initialize (the .reveal container to appear) */
export async function waitForReveal(page: Page): Promise<void> {
  await page.locator(".reveal .slides section").first().waitFor({ timeout: 15_000 });
}

export { base as test, expect };
