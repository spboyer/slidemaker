/**
 * Copilot Extension skillset endpoint + presentation-service tests
 */

import { describe, it, expect } from "vitest";

import {
  generateSlug,
  VALID_STYLES,
  type PresentationStyle,
} from "@/lib/presentation-service";

describe("presentation-service exports", () => {
  it("VALID_STYLES contains expected values", () => {
    expect(VALID_STYLES).toEqual([
      "professional",
      "creative",
      "minimal",
      "technical",
    ]);
  });

  it("generateSlug works correctly", () => {
    expect(generateSlug("Introduction to Rust")).toBe("introduction-to-rust");
  });

  it("generateSlug handles special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("generateSlug caps at 40 characters", () => {
    const long = "a".repeat(50);
    expect(generateSlug(long).length).toBeLessThanOrEqual(40);
  });

  it("generateSlug returns empty for non-alphanumeric titles", () => {
    expect(generateSlug("!!!")).toBe("");
  });
});

describe("Copilot skillset route exports", () => {
  it("exports POST handler", async () => {
    const mod = await import("@/app/api/copilot/skillset/route");
    expect(typeof mod.POST).toBe("function");
  });
});

// Replicate parseSkillsetMessage logic for unit testing
function parseSkillsetMessage(message: string): {
  topic: string;
  style?: PresentationStyle;
  numSlides?: number;
} {
  let remaining = message.trim();

  let numSlides: number | undefined;
  const slidesMatch = remaining.match(/--slides\s+(\d+)/i);
  if (slidesMatch) {
    numSlides = parseInt(slidesMatch[1], 10);
    if (numSlides < 1 || numSlides > 20) numSlides = undefined;
    remaining = remaining.replace(slidesMatch[0], "");
  }

  let style: PresentationStyle | undefined;
  const styleMatch = remaining.match(/--style\s+(\S+)/i);
  if (styleMatch) {
    const candidate = styleMatch[1].toLowerCase();
    if (VALID_STYLES.includes(candidate as PresentationStyle)) {
      style = candidate as PresentationStyle;
    }
    remaining = remaining.replace(styleMatch[0], "");
  }

  remaining = remaining.replace(/^\/\S+\s*/, "");
  const topic = remaining.trim();

  return { topic, style, numSlides };
}

describe("parseSkillsetMessage", () => {
  it("parses topic only", () => {
    const result = parseSkillsetMessage("Introduction to Rust");
    expect(result.topic).toBe("Introduction to Rust");
    expect(result.style).toBeUndefined();
    expect(result.numSlides).toBeUndefined();
  });

  it("parses topic with --style flag", () => {
    const result = parseSkillsetMessage(
      "Introduction to Rust --style technical",
    );
    expect(result.topic).toBe("Introduction to Rust");
    expect(result.style).toBe("technical");
  });

  it("parses topic with --slides flag", () => {
    const result = parseSkillsetMessage("Introduction to Rust --slides 8");
    expect(result.topic).toBe("Introduction to Rust");
    expect(result.numSlides).toBe(8);
  });

  it("parses topic with both flags", () => {
    const result = parseSkillsetMessage(
      "Introduction to Rust --style technical --slides 8",
    );
    expect(result.topic).toBe("Introduction to Rust");
    expect(result.style).toBe("technical");
    expect(result.numSlides).toBe(8);
  });

  it("strips /slidemaker prefix", () => {
    const result = parseSkillsetMessage(
      "/slidemaker Introduction to Rust --style technical --slides 8",
    );
    expect(result.topic).toBe("Introduction to Rust");
    expect(result.style).toBe("technical");
    expect(result.numSlides).toBe(8);
  });

  it("ignores invalid style", () => {
    const result = parseSkillsetMessage("My Topic --style invalid");
    expect(result.topic).toBe("My Topic");
    expect(result.style).toBeUndefined();
  });

  it("ignores out-of-range slides", () => {
    const result = parseSkillsetMessage("My Topic --slides 25");
    expect(result.topic).toBe("My Topic");
    expect(result.numSlides).toBeUndefined();
  });

  it("handles empty message after stripping prefix", () => {
    const result = parseSkillsetMessage("/slidemaker");
    expect(result.topic).toBe("");
  });

  it("handles flags in different order", () => {
    const result = parseSkillsetMessage(
      "--slides 3 --style minimal My Topic",
    );
    expect(result.topic).toBe("My Topic");
    expect(result.style).toBe("minimal");
    expect(result.numSlides).toBe(3);
  });
});
