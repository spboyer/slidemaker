import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import type { Slide } from "@/lib/types";
import { REVEAL_THEMES } from "@/lib/reveal-themes";

type PresentationStyle = "professional" | "creative" | "minimal" | "technical";

const VALID_STYLES: PresentationStyle[] = [
  "professional",
  "creative",
  "minimal",
  "technical",
];

const STYLE_INSTRUCTIONS: Record<PresentationStyle, string> = {
  professional: `Tone: formal and polished. Use clean layouts, concise bullet points, and business-appropriate language. Suggest a neutral theme like "simple", "white", or "serif".`,
  creative: `Tone: bold and visually engaging. Use varied layouts (center, two-column), colorful backgrounds, and dynamic transitions like "zoom" or "convex". Suggest a vibrant theme like "moon", "blood", or "league".`,
  minimal: `Tone: clean and understated. Use short text, lots of whitespace, "fade" transitions, and simple layouts. Suggest "white", "simple", or "sky" theme.`,
  technical: `Tone: precise and detail-oriented. Use code blocks frequently, include data-driven content, and prefer "slide" or "none" transitions. Suggest "black", "night", or "solarized" theme.`,
};

const AVAILABLE_THEMES = REVEAL_THEMES.map((t) => t.id).join(", ");

const SYSTEM_PROMPT = `You are a reveal.js presentation slide generator. Given a topic (and optionally existing slides for context), generate presentation slides with rich reveal.js-compatible HTML content.

Return a JSON object with:
- "suggestedTheme": string — one of the available reveal.js themes: ${AVAILABLE_THEMES}
- "slides": array of slide objects

Each slide object must have:
- "title": string — a concise slide title
- "content": string — slide body content as reveal.js-compatible HTML
- "notes": string — speaker notes for this slide (plain text or HTML)

Each slide may also include:
- "transition": string — one of "none", "fade", "slide", "convex", "concave", "zoom"
- "backgroundColor": string — a CSS color value for the slide background (e.g. "#1a1a2e")
- "layout": string — one of "default", "center", "two-column"

Content formatting rules:
- Use \`<li class="fragment">\` for list items that should animate in one-by-one
- Use \`<pre><code class="language-X">\` (where X is the language) for syntax-highlighted code blocks
- Use standard HTML tags: <h3>, <p>, <ul>, <ol>, <blockquote>, <table>, <strong>, <em>
- For two-column layouts, use \`<div class="r-hstack">\` with child \`<div>\` elements
- Vary layouts across slides — mix default, center, and two-column for visual interest
- Keep each slide focused on one idea

Speaker notes should include talking points, timing suggestions, or additional context not shown on the slide.

Suggest meaningful transitions per slide — use "fade" for narrative flow, "slide" for sequential content, "zoom" for emphasis, and "none" for dense information.

When existing slides are provided, generate new slides that complement and extend the existing deck without repeating covered material.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.topic || typeof body.topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    const numSlides = body.numSlides ?? 5;

    if (typeof numSlides !== "number" || numSlides < 1 || numSlides > 20) {
      return NextResponse.json(
        { error: "numSlides must be a number between 1 and 20" },
        { status: 400 }
      );
    }

    const style: PresentationStyle | undefined = body.style;
    if (style !== undefined && !VALID_STYLES.includes(style)) {
      return NextResponse.json(
        {
          error: `Invalid style. Must be one of: ${VALID_STYLES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let userMessage = `Generate ${numSlides} slides about: ${body.topic}`;

    if (style) {
      userMessage += `\n\nPresentation style: ${style}\n${STYLE_INSTRUCTIONS[style]}`;
    }

    if (body.existingSlides && Array.isArray(body.existingSlides)) {
      userMessage += `\n\nExisting slides in the deck (generate slides that complement these):\n${JSON.stringify(body.existingSlides, null, 2)}`;
    }

    let client;
    try {
      client = getOpenAIClient();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize AI client. Check your GitHub authentication.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const response = await client.chat.completions.create({
      model: "openai/gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as {
      slides: Slide[];
      suggestedTheme?: string;
    };

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      return NextResponse.json(
        { error: "Invalid response format from OpenAI" },
        { status: 500 }
      );
    }

    const result: { slides: Slide[]; suggestedTheme?: string } = {
      slides: parsed.slides,
    };

    if (parsed.suggestedTheme) {
      result.suggestedTheme = parsed.suggestedTheme;
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error generating slides:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };

      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (apiError.status === 401) {
        return NextResponse.json(
          {
            error:
              "Invalid or expired GitHub token. Run 'gh auth login' or check your GITHUB_TOKEN.",
          },
          { status: 401 }
        );
      }
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    );
  }
}
