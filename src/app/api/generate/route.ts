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

const SYSTEM_PROMPT = `You are an expert reveal.js presentation designer. Given a topic (and optionally existing slides for context), generate visually rich, high-fidelity presentation slides using the full power of reveal.js features.

Return a JSON object with:
- "suggestedTheme": string — one of the available reveal.js themes: ${AVAILABLE_THEMES}
- "slides": array of slide objects

Each slide object must have:
- "title": string — a concise slide title (may be empty string for content-only slides)
- "content": string — slide body content as reveal.js-compatible HTML
- "notes": string — speaker notes (talking points, timing, additional context)

Each slide may also include:
- "transition": string — one of "none", "fade", "slide", "convex", "concave", "zoom"
- "backgroundColor": string — CSS color for slide background (e.g. "#1a1a2e")
- "backgroundGradient": string — CSS gradient for slide background (e.g. "linear-gradient(to bottom, #283e51, #0a2342)")
- "layout": string — one of "default", "center", "two-column"
- "autoAnimate": boolean — set true to enable auto-animate morphing with the next slide

## reveal.js Features You MUST Use

### 1. Auto-Animate (data-auto-animate)
Create slide pairs where elements morph between states. Set "autoAnimate": true on consecutive slides that share elements with matching tags/content. Example use cases:
- Title slide morphing into detail slide
- Code block evolving (adding lines, refactoring)
- A list growing from 2 items to 5 items

### 2. r-fit-text
Use \`<h2 class="r-fit-text">Big Impact Text</h2>\` to auto-size text to fill the slide. Best for:
- Title/cover slides
- Single-statement impact slides
- Section divider slides

### 3. Rich Fragment Types
Go beyond basic \`class="fragment"\`. Use varied fragment animations:
- \`<li class="fragment fade-in">\` — standard fade in
- \`<li class="fragment fade-up">\` — slide up while fading in
- \`<li class="fragment grow">\` — grow in size
- \`<li class="fragment shrink">\` — shrink in size
- \`<li class="fragment fade-in-then-out">\` — appear then disappear for next
- \`<li class="fragment fade-in-then-semi-out">\` — appear then dim
- \`<span class="fragment highlight-red">\` — highlight text red
- \`<span class="fragment highlight-blue">\` — highlight text blue
- \`<span class="fragment highlight-green">\` — highlight text green
Vary fragment types across slides — do NOT use the same type on every slide.

### 4. Code Blocks with Line Highlighting
For code, use \`<pre><code>\` with these attributes:
\`\`\`html
<pre><code class="language-javascript" data-trim data-noescape data-line-numbers="1-2|4-6|8">
function hello() {
  const greeting = "world";

  if (greeting) {
    console.log(greeting);
  }

  return greeting;
}
</code></pre>
\`\`\`
The data-line-numbers attribute enables step-through highlighting — pipe-separated ranges highlight progressively.

### 5. Background Variations
Vary slide backgrounds to create visual rhythm:
- Solid colors: use "backgroundColor" field
- Gradients: use "backgroundGradient" field with CSS gradients like "linear-gradient(to right, #fc5c7d, #6a82fb)"
- Do NOT make every slide the same background — create visual contrast between sections

### 6. Styled Tables
Use clean HTML tables for data:
\`\`\`html
<table>
  <thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Auth</td><td>✅ Done</td><td>JWT-based</td></tr>
    <tr class="fragment"><td>Cache</td><td>🔄 WIP</td><td>Redis integration</td></tr>
  </tbody>
</table>
\`\`\`

### 7. Blockquotes with Attribution
\`\`\`html
<blockquote cite="Author Name">
  <p>"The best way to predict the future is to invent it."</p>
  <footer>— <cite>Alan Kay</cite></footer>
</blockquote>
\`\`\`

## Critical Variety Rules
- Do NOT make every slide a bullet list. Mix: statement slides, code slides, table slides, quote slides, image-placeholder slides, two-column comparisons.
- Vary transitions across slides — don't use the same transition for every slide.
- Use at least 2 different fragment types across the deck.
- Include at least 1 auto-animate slide pair per 5 slides.
- Use r-fit-text on at least the title/cover slide.
- Vary backgrounds — use at least 2 different background treatments (solid, gradient, or default).

## Example High-Quality Slide (for reference)
A well-crafted slide combining multiple features:
\`\`\`json
{
  "title": "",
  "content": "<h2 class=\\"r-fit-text\\">Why Microservices?</h2>",
  "notes": "Pause here for impact. Let the audience absorb the question before moving on.",
  "transition": "zoom",
  "backgroundGradient": "linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)",
  "layout": "center",
  "autoAnimate": true
}
\`\`\`
Followed by an auto-animate pair:
\`\`\`json
{
  "title": "Why Microservices?",
  "content": "<ul><li class=\\"fragment fade-up\\">Independent deployments</li><li class=\\"fragment fade-up\\">Technology flexibility</li><li class=\\"fragment fade-up\\">Team autonomy</li><li class=\\"fragment fade-up\\">Fault isolation</li></ul>",
  "notes": "Walk through each benefit. Spend ~30 seconds per point.",
  "transition": "fade",
  "backgroundGradient": "linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)",
  "layout": "default",
  "autoAnimate": true
}
\`\`\`

Speaker notes should include talking points, timing suggestions, audience engagement cues, or additional context not shown on the slide.

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
