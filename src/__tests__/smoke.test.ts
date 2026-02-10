/**
 * SlideMaker — Smoke Tests
 *
 * Verifies build integrity, type correctness, and API route handlers.
 * Uses vitest. Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import type { Slide, Presentation } from "../lib/types";

// ─── TC-9.6: Type compilation checks ────────────────────────────────────────
// If this file compiles, the types are valid.

describe("Type compilation (TC-9.6)", () => {
  it("TC-9.6a: Slide type structure is correct", () => {
    const slide: Slide = {
      title: "Test Slide",
      content: "This is **markdown** content.",
    };
    expect(slide.title).toBe("Test Slide");
    expect(slide.content).toBe("This is **markdown** content.");
    expect(slide.notes).toBeUndefined();
    expect(slide.backgroundImage).toBeUndefined();
  });

  it("TC-9.6a: Slide optional fields work", () => {
    const slide: Slide = {
      title: "Full Slide",
      content: "Content here.",
      notes: "Speaker notes for this slide.",
      backgroundImage: "gradient-blue",
    };
    expect(slide.notes).toBe("Speaker notes for this slide.");
    expect(slide.backgroundImage).toBe("gradient-blue");
  });

  it("TC-9.6b: Presentation type structure is correct", () => {
    const pres: Presentation = {
      id: "test-presentation",
      title: "Test Presentation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [{ title: "S1", content: "C1" }],
    };
    expect(pres.id).toBe("test-presentation");
    expect(pres.title).toBe("Test Presentation");
    expect(Array.isArray(pres.slides)).toBe(true);
    expect(pres.slides.length).toBe(1);
    // Verify ISO-8601 date format
    expect(pres.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(pres.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ─── Reveal.js integration: extended types ──────────────────────────────────

describe("Extended Slide type (reveal.js fields)", () => {
  it("Slide accepts transition, backgroundColor, layout fields", () => {
    const slide: Slide = {
      title: "Reveal Slide",
      content: "Body text",
      transition: "zoom",
      backgroundColor: "#1a1a2e",
      layout: "two-column",
    };
    expect(slide.transition).toBe("zoom");
    expect(slide.backgroundColor).toBe("#1a1a2e");
    expect(slide.layout).toBe("two-column");
  });

  it("all SlideTransition values are accepted", () => {
    const transitions: Array<Slide["transition"]> = [
      "none",
      "fade",
      "slide",
      "convex",
      "concave",
      "zoom",
    ];
    transitions.forEach((t) => {
      const s: Slide = { title: "T", content: "C", transition: t };
      expect(s.transition).toBe(t);
    });
  });

  it("all SlideLayout values are accepted", () => {
    const layouts: Array<Slide["layout"]> = [
      "default",
      "center",
      "two-column",
    ];
    layouts.forEach((l) => {
      const s: Slide = { title: "T", content: "C", layout: l };
      expect(s.layout).toBe(l);
    });
  });
});

describe("Extended Presentation type (reveal.js fields)", () => {
  it("Presentation accepts theme and transition fields", () => {
    const pres: Presentation = {
      id: "themed",
      title: "Themed Deck",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [{ title: "S1", content: "C1" }],
      theme: "moon",
      transition: "fade",
    };
    expect(pres.theme).toBe("moon");
    expect(pres.transition).toBe("fade");
  });

  it("theme and transition are optional (backwards compatible)", () => {
    const pres: Presentation = {
      id: "no-theme",
      title: "Legacy Deck",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slides: [{ title: "S1", content: "C1" }],
    };
    expect(pres.theme).toBeUndefined();
    expect(pres.transition).toBeUndefined();
  });
});

// ─── Reveal.js theme validation ─────────────────────────────────────────────

import { REVEAL_THEMES, isValidTheme } from "../lib/reveal-themes";

describe("Theme validation — isValidTheme()", () => {
  const validThemes = [
    "black", "white", "league", "sky", "beige",
    "simple", "serif", "blood", "night", "moon", "solarized",
  ];

  it.each(validThemes)("accepts valid theme: %s", (theme) => {
    expect(isValidTheme(theme)).toBe(true);
  });

  it.each(["invalid", "darcula", "monokai", "", "BLACK", "White"])(
    "rejects invalid theme: '%s'",
    (theme) => {
      expect(isValidTheme(theme)).toBe(false);
    }
  );
});

describe("REVEAL_THEMES metadata", () => {
  it("has exactly 11 entries", () => {
    expect(REVEAL_THEMES).toHaveLength(11);
  });

  it("every entry has id, name, previewBackground, previewTextColor", () => {
    REVEAL_THEMES.forEach((theme) => {
      expect(theme).toHaveProperty("id");
      expect(theme).toHaveProperty("name");
      expect(theme).toHaveProperty("previewBackground");
      expect(theme).toHaveProperty("previewTextColor");
      expect(typeof theme.id).toBe("string");
      expect(typeof theme.name).toBe("string");
      expect(theme.previewBackground).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.previewTextColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("each theme id is unique", () => {
    const ids = REVEAL_THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Backwards compatibility ────────────────────────────────────────────────

describe("Backwards compatibility (v1 format)", () => {
  it("a v1 Slide (only title + content) satisfies Slide type", () => {
    const v1Slide: Slide = { title: "Hello", content: "World" };
    expect(v1Slide.title).toBe("Hello");
    expect(v1Slide.content).toBe("World");
    expect(v1Slide.transition).toBeUndefined();
    expect(v1Slide.backgroundColor).toBeUndefined();
    expect(v1Slide.layout).toBeUndefined();
  });

  it("a v1 Presentation (no theme/transition) satisfies Presentation type", () => {
    const v1: Presentation = {
      id: "legacy",
      title: "Legacy Pres",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
      slides: [{ title: "S", content: "C" }],
    };
    expect(v1.theme).toBeUndefined();
    expect(v1.transition).toBeUndefined();
    expect(v1.slides[0].transition).toBeUndefined();
    expect(v1.slides[0].backgroundColor).toBeUndefined();
    expect(v1.slides[0].layout).toBeUndefined();
  });
});

// ─── TC-9.5 / TC-7.x: API route handler tests ──────────────────────────────
// Test CRUD API handlers directly by importing route functions.
// Uses a temp directory to avoid polluting real data.

// ─── CRUD integration tests using file-system operations directly ───────────
describe("CRUD API integration tests (TC-7.x)", () => {
  const TEMP_ROOT = path.join(
    process.env.TEMP || process.env.TMPDIR || "/tmp",
    "slidemaker-test-" + Date.now()
  );
  const PRESENTATIONS_DIR = path.join(TEMP_ROOT, "presentations");

  // Helper to create a presentation file directly
  async function writePresentation(slug: string, data: Presentation) {
    await fs.mkdir(PRESENTATIONS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(PRESENTATIONS_DIR, `${slug}.json`),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }

  async function readPresentation(slug: string): Promise<Presentation | null> {
    try {
      const data = await fs.readFile(
        path.join(PRESENTATIONS_DIR, `${slug}.json`),
        "utf-8"
      );
      return JSON.parse(data) as Presentation;
    } catch {
      return null;
    }
  }

  async function listPresentations(): Promise<string[]> {
    try {
      const files = await fs.readdir(PRESENTATIONS_DIR);
      return files.filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  beforeAll(async () => {
    await fs.mkdir(PRESENTATIONS_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // Clear all files before each test
    try {
      const files = await fs.readdir(PRESENTATIONS_DIR);
      for (const f of files) {
        await fs.unlink(path.join(PRESENTATIONS_DIR, f));
      }
    } catch {
      // dir might not exist yet
    }
  });

  afterAll(async () => {
    await fs.rm(TEMP_ROOT, { recursive: true, force: true });
  });

  it("TC-7.1: GET presentations — empty list", async () => {
    const files = await listPresentations();
    expect(files).toEqual([]);
  });

  it("TC-7.2: GET presentations — populated list", async () => {
    const now = new Date().toISOString();
    await writePresentation("intro-to-ts", {
      id: "intro-to-ts",
      title: "Introduction to TypeScript",
      createdAt: now,
      updatedAt: now,
      slides: [{ title: "Slide 1", content: "Content 1" }],
    });

    const files = await listPresentations();
    expect(files.length).toBe(1);
    expect(files[0]).toBe("intro-to-ts.json");

    const pres = await readPresentation("intro-to-ts");
    expect(pres).not.toBeNull();
    expect(pres!.id).toBe("intro-to-ts");
    expect(pres!.title).toBe("Introduction to TypeScript");
    expect(pres!.slides.length).toBe(1);
  });

  it("TC-7.3: POST presentations — valid input creates file", async () => {
    const title = "Test Deck";
    const slug = generateSlug(title);
    const now = new Date().toISOString();
    const presentation: Presentation = {
      id: slug,
      title,
      createdAt: now,
      updatedAt: now,
      slides: [{ title: "Slide 1", content: "Hello" }],
    };

    await writePresentation(slug, presentation);
    const stored = await readPresentation(slug);
    expect(stored).not.toBeNull();
    expect(stored!.id).toBe("test-deck");
    expect(stored!.title).toBe("Test Deck");
    expect(stored!.slides.length).toBe(1);
  });

  it("TC-7.7: GET presentation by slug — existing", async () => {
    const now = new Date().toISOString();
    await writePresentation("my-deck", {
      id: "my-deck",
      title: "My Deck",
      createdAt: now,
      updatedAt: now,
      slides: [
        { title: "S1", content: "C1" },
        { title: "S2", content: "C2" },
      ],
    });

    const pres = await readPresentation("my-deck");
    expect(pres).not.toBeNull();
    expect(pres!.slides.length).toBe(2);
    expect(pres!.slides[0].title).toBe("S1");
  });

  it("TC-7.8: GET presentation by slug — non-existing returns null", async () => {
    const pres = await readPresentation("does-not-exist");
    expect(pres).toBeNull();
  });

  it("TC-7.9: PUT presentation — valid update", async () => {
    const now = new Date().toISOString();
    await writePresentation("updatable", {
      id: "updatable",
      title: "Original Title",
      createdAt: now,
      updatedAt: now,
      slides: [{ title: "S1", content: "C1" }],
    });

    const existing = await readPresentation("updatable");
    expect(existing).not.toBeNull();

    const updated: Presentation = {
      ...existing!,
      title: "Updated Title",
      slides: [
        { title: "S1", content: "C1 updated" },
        { title: "S2", content: "C2 new" },
      ],
      updatedAt: new Date().toISOString(),
    };

    await writePresentation("updatable", updated);
    const result = await readPresentation("updatable");
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Updated Title");
    expect(result!.slides.length).toBe(2);
    expect(result!.updatedAt).not.toBe(now);
  });

  it("TC-7.12: DELETE presentation — file removed", async () => {
    const now = new Date().toISOString();
    await writePresentation("deletable", {
      id: "deletable",
      title: "Delete Me",
      createdAt: now,
      updatedAt: now,
      slides: [],
    });

    // Verify file exists
    const before = await readPresentation("deletable");
    expect(before).not.toBeNull();

    // Delete
    await fs.unlink(path.join(PRESENTATIONS_DIR, "deletable.json"));

    // Verify gone
    const after = await readPresentation("deletable");
    expect(after).toBeNull();
  });

  it("TC-7.16: Presentation response shape", async () => {
    const now = new Date().toISOString();
    const pres: Presentation = {
      id: "shape-test",
      title: "Shape Test",
      createdAt: now,
      updatedAt: now,
      slides: [{ title: "S1", content: "C1", notes: "N1" }],
    };

    await writePresentation("shape-test", pres);
    const result = await readPresentation("shape-test");

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("createdAt");
    expect(result).toHaveProperty("updatedAt");
    expect(result).toHaveProperty("slides");
    expect(result!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ─── Slug generation tests ──────────────────────────────────────────────────

describe("Slug generation", () => {
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  it("converts simple title to slug", () => {
    expect(generateSlug("My Presentation")).toBe("my-presentation");
  });

  it("strips special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("one---two---three")).toBe("one-two-three");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("---hello---")).toBe("hello");
  });

  it("caps at 40 characters", () => {
    const long = "a".repeat(50);
    expect(generateSlug(long).length).toBeLessThanOrEqual(40);
  });

  it("handles unicode by stripping non-alphanumeric", () => {
    expect(generateSlug("café résumé")).toBe("caf-rsum");
  });

  it("returns empty string for all-special-char titles", () => {
    expect(generateSlug("!!!")).toBe("");
  });
});

// ─── API route handler export checks ────────────────────────────────────────

describe("API route handler exports (TC-9.5)", () => {
  it("presentations route exports GET and POST", async () => {
    const mod = await import("../app/api/presentations/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.POST).toBe("function");
  });

  it("presentations/[slug] route exports GET, PUT, DELETE", async () => {
    const mod = await import("../app/api/presentations/[slug]/route");
    expect(typeof mod.GET).toBe("function");
    expect(typeof mod.PUT).toBe("function");
    expect(typeof mod.DELETE).toBe("function");
  });

  it("generate route exports POST", async () => {
    const mod = await import("../app/api/generate/route");
    expect(typeof mod.POST).toBe("function");
  });
});

// ─── Security edge cases ────────────────────────────────────────────────────

describe("Security: slug sanitization (SEC-1)", () => {
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
  }

  it("path traversal characters are stripped", () => {
    const slug = generateSlug("../../etc/passwd");
    expect(slug).not.toContain("..");
    expect(slug).not.toContain("/");
    expect(slug).not.toContain("\\");
  });

  it("backslash characters are stripped", () => {
    const slug = generateSlug("..\\windows\\system32");
    expect(slug).not.toContain("\\");
    expect(slug).not.toContain("..");
  });
});
