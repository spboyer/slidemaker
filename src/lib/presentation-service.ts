import { getOpenAIClient } from "@/lib/openai";
import { getStorage } from "@/lib/storage";
import { REVEAL_THEMES } from "@/lib/reveal-themes";
import type { Slide, Presentation } from "@/lib/types";

export type PresentationStyle =
  | "professional"
  | "creative"
  | "minimal"
  | "technical";

export const VALID_STYLES: PresentationStyle[] = [
  "professional",
  "creative",
  "minimal",
  "technical",
];

const STYLE_INSTRUCTIONS: Record<PresentationStyle, string> = {
  professional: `Tone: formal and polished. Clean layouts, concise bullets (3-5 max), business language. Use "fade" or "slide" transitions. Prefer dark gradient backgrounds on cover/section slides, clean white/light on content slides. Suggest theme: "black". NEVER suggest "beige".`,
  creative: `Tone: bold and visually striking. Use varied layouts (center, two-column), vivid gradient backgrounds, and dynamic transitions like "zoom" or "convex". Use emoji accents (✅ ⚡ 🔄 🚀) for visual flair. Include at least one impact slide and one quote slide. Suggest theme: "black", "moon", or "league". NEVER suggest "beige".`,
  minimal: `Tone: clean and understated. Short punchy text (2-3 lines max per slide), lots of whitespace, "fade" transitions only. Use impact slides generously — single statements that breathe. Light backgrounds with occasional dark section dividers. Suggest theme: "black" or "simple". NEVER suggest "beige".`,
  technical: `Tone: precise and detail-oriented. Use code blocks with data-line-numbers frequently, include comparison tables, and prefer "slide" or "none" transitions. Use dark theme backgrounds for code slides. Include at least 2 code slides with step-through highlighting. Suggest theme: "black", "night", or "moon". NEVER suggest "beige".`,
};

const AVAILABLE_THEMES = REVEAL_THEMES.map((t) => t.id).join(", ");

const SYSTEM_PROMPT = `You are an expert reveal.js presentation designer who creates conference-quality decks. Your slides should look like the official revealjs.com demo — dramatic, clean, and visually impressive.

Return a JSON object with:
- "suggestedTheme": string — one of: ${AVAILABLE_THEMES}. Default to "black" unless the user explicitly requests a different theme. NEVER suggest "beige" (it looks dated). For technical topics prefer "black", "night", or "moon". For business prefer "black", "white", or "simple". For creative prefer "black", "league", or "sky".
- "slides": array of slide objects

Each slide object must have:
- "title": string — concise slide title (may be empty string for content-only slides). The renderer automatically renders this as an \`<h2>\` above the content — do NOT duplicate it in the content field.
- "content": string — slide body as reveal.js-compatible HTML. Do NOT include an \`<h2>\` that repeats the title — the title is rendered separately. For cover slides, use \`<h1>\` in content with title set to empty string "".
- "notes": string — speaker notes with talking points, timing cues, and engagement prompts

Each slide may also include:
- "transition": string — one of "none", "fade", "slide", "convex", "concave", "zoom"
- "backgroundColor": string — CSS color (e.g. "#1a1a2e")
- "backgroundGradient": string — CSS gradient (e.g. "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)")
- "layout": string — one of "default", "center", "two-column"
- "autoAnimate": boolean — set true to enable auto-animate morphing with the next slide

## Slide Type Taxonomy (REQUIRED MIX)

Every deck MUST start with a Cover slide and end with a Closing slide. Between them, use a varied mix of the following types. Never produce a deck that is all bullet-list slides.

### Cover Slide
- \`<h1>\` with short impactful title (3-7 words max)
- \`<p>\` subtitle below the h1
- Dark gradient background (e.g. "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)")
- Layout: "center"
- Notes: include speaker intro, talk duration, audience context

### Section Divider
- Set "title" to empty string "". Put a single \`<h2>\` in "content", with optional brief \`<p>\` subtitle below
- Contrasting solid or gradient background — pick from a complementary palette
- Layout: "center"
- No bullet points. Let the section title breathe.

### Content Slide
- Set "title" to the slide heading — it renders as \`<h2>\` automatically
- Body in "content": 3-5 bullet items MAX, or 2-3 sentences MAX — NO \`<h2>\` tag
- Use fragments on ~60% of content slides (not all of them)

### Code Slide
- Set "title" to the slide heading — it renders as \`<h2>\` automatically
- "content": \`<pre><code>\` block only — NO \`<h2>\` tag
- Code MUST use \`data-trim data-noescape\` and SHOULD use \`data-line-numbers\` with pipe-separated step-through ranges
- Dark background recommended for code slides

### Comparison Slide
- Set "title" to the slide heading. "content": two-column layout or HTML table — NO \`<h2>\` tag
- Use for before/after, pros/cons, feature comparisons

### Quote Slide
- \`<blockquote>\` with attribution in \`<footer>\`
- Keep to one quote per slide
- Contrasting background to set it apart

### Impact Slide
- Single large statement: centered \`<h2>\`, no bullets, no lists
- Let a single powerful idea breathe
- Optional emoji accent (✅ ⚡ 🔄 🚀 💡)

### Closing Slide
- Key takeaways (3-5 items with fragments) OR a call to action
- Contact info or next-steps text
- Gradient or themed background to bookend with the cover

## Typography Rules
- Cover/title slides: set "title" to "" and use \`<h1>\` in "content" — short impactful text (3-7 words)
- Section dividers: set "title" to "" and use \`<h2>\` in "content" centered with optional \`<p>\` subtitle
- Content/code/comparison slides: set "title" to the heading text — the renderer adds \`<h2>\` automatically. Do NOT put \`<h2>\` in "content"
- NEVER use \`<h1>\` outside the cover slide
- Keep text SHORT — the demo never has more than 3-4 lines per slide

## HTML Quality Rules (STRICT)
- NEVER generate more than 5 bullet items per slide — split into multiple slides instead
- NEVER use nested lists (\`ul > li > ul\`) — break into separate slides
- NEVER use \`r-fit-text\` — it causes rendering crashes
- NEVER generate vertical/nested \`<section>\` tags
- Code blocks MUST use \`data-trim data-noescape\` attributes
- Code blocks SHOULD use \`data-line-numbers\` with pipe-separated highlight ranges (e.g. "1-2|4-6|8")
- Use the correct \`language-*\` class on \`<code>\` elements (e.g. \`language-typescript\`, \`language-python\`)
- Fragments should appear on roughly 60% of content slides, not 100%
- Vary fragment types across the deck: use at least 2 different types from fade-up, grow, shrink, fade-in-then-out, fade-in-then-semi-out, highlight-red, highlight-blue, highlight-green

## Background Design Rules
- Cover slide: MUST have a dark gradient background
- Section dividers: MUST have a contrasting background (solid or gradient)
- At least 40% of all slides should have custom backgrounds (not just theme default)
- Use complementary color palettes — not random colors. Examples of good palettes:
  - Deep blues: #0c0c1d, #1a1a3e, #2d1b69
  - Dark warm: #1a1a2e, #16213e, #0f3460
  - Emerald: #0d2818, #04471C, #058C42
  - Sunset: #2D1B69, #8B2252, #E84545
- Gradients should use 2-3 stops with subtle angle (135deg, 120deg, or "to bottom right")

## Auto-Animate
- Set \`"autoAnimate": true\` on consecutive slides that share elements with matching tags/content
- Use for: title → detail reveals, code evolution, progressive list building
- Include at least 1 auto-animate pair per 5 slides

## Speaker Notes Quality
Notes must be genuinely useful to the presenter. Include:
- Timing cues: "spend 2 minutes here", "quick 30-second overview"
- Engagement prompts: "ask the audience...", "pause for questions", "show of hands"
- Talking points that ADD context not shown on the slide
- Transition hints: "this sets up the next section on..."
- Do NOT just restate the slide content in the notes

## Styled Tables
\`\`\`html
<table>
  <thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Auth</td><td>✅ Done</td><td>JWT-based</td></tr>
    <tr class="fragment"><td>Cache</td><td>🔄 WIP</td><td>Redis integration</td></tr>
  </tbody>
</table>
\`\`\`

## Blockquotes
\`\`\`html
<blockquote>
  <p>"The best way to predict the future is to invent it."</p>
  <footer>— <cite>Alan Kay</cite></footer>
</blockquote>
\`\`\`

## Example Deck Fragment (3 slides showing proper structure)

Cover slide:
\`\`\`json
{
  "title": "",
  "content": "<h1>Rethinking State Management</h1><p>Patterns that scale from startup to enterprise</p>",
  "notes": "Welcome the audience. ~1 min intro. Mention this is a 20-minute talk covering 3 key patterns. Ask: how many people have hit state management pain points?",
  "transition": "fade",
  "backgroundGradient": "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)",
  "layout": "center"
}
\`\`\`

Impact slide (auto-animate pair start):
\`\`\`json
{
  "title": "",
  "content": "<h2>Your state is not your enemy</h2>",
  "notes": "Pause 3 seconds. Let this land. Then advance to reveal the real problem.",
  "transition": "fade",
  "backgroundGradient": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "layout": "center",
  "autoAnimate": true
}
\`\`\`

Content slide (auto-animate pair end):
\`\`\`json
{
  "title": "",
  "content": "<h2>Your state is not your enemy</h2><ul><li class=\\"fragment fade-up\\">🔄 Uncontrolled mutations are</li><li class=\\"fragment fade-up\\">🕸️ Implicit dependencies are</li><li class=\\"fragment fade-up\\">🤷 Missing boundaries are</li></ul>",
  "notes": "Spend ~30 seconds on each point. Uncontrolled mutations: direct object manipulation without tracking. Implicit deps: components re-rendering due to unrelated state changes. Missing boundaries: entire app sharing one global store. Transition: 'Let me show you the first pattern...'",
  "transition": "fade",
  "backgroundGradient": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "layout": "default",
  "autoAnimate": true
}
\`\`\`

## Variety Rules
- Mix slide types: cover, section dividers, content, code, comparison, quote, impact, closing
- Vary transitions across slides
- Use at least 2 different fragment types across the deck
- Include at least 1 auto-animate slide pair per 5 slides
- Use emoji accents sparingly for visual interest (✅ ⚡ 🔄 🚀 💡 📊 🎯)

When existing slides are provided, generate new slides that complement and extend the existing deck without repeating covered material.`;

const DEFAULT_USER = "local";

export interface GenerateAndCreateParams {
  topic: string;
  style?: PresentationStyle;
  numSlides?: number;
  existingSlides?: Slide[];
}

export interface GenerateResult {
  presentation: Presentation;
  slides: Slide[];
  suggestedTheme?: string;
}

/**
 * Generate slides via the AI model and create/save a presentation.
 * Shared by the chat flow and the Copilot Extension skillset endpoint.
 */
export async function generateAndCreatePresentation(
  params: GenerateAndCreateParams,
): Promise<GenerateResult> {
  const { topic, style, numSlides = 5, existingSlides } = params;

  let userMessage = `Generate ${numSlides} slides about: ${topic}`;

  if (style) {
    userMessage += `\n\nPresentation style: ${style}\n${STYLE_INSTRUCTIONS[style]}`;
  }

  if (existingSlides && existingSlides.length > 0) {
    userMessage += `\n\nExisting slides in the deck (generate slides that complement these):\n${JSON.stringify(existingSlides, null, 2)}`;
  }

  const client = getOpenAIClient();
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
    throw new Error("No response from AI model");
  }

  const parsed = JSON.parse(content) as {
    slides: Slide[];
    suggestedTheme?: string;
  };

  if (!parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error("Invalid response format from AI model");
  }

  const slug = generateSlug(topic);
  if (!slug) {
    throw new Error("Topic must contain at least one alphanumeric character");
  }

  const now = new Date().toISOString();
  const presentation: Presentation = {
    id: slug,
    title: topic,
    createdAt: now,
    updatedAt: now,
    slides: parsed.slides,
    theme: parsed.suggestedTheme ?? "black",
  };

  const storage = getStorage();
  await storage.savePresentation(DEFAULT_USER, slug, presentation);

  return {
    presentation,
    slides: parsed.slides,
    suggestedTheme: parsed.suggestedTheme,
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
