### AI Prompt Upgrade for High-Fidelity reveal.js Slides
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #36 · **PR:** #39

The SYSTEM_PROMPT in `src/app/api/generate/route.ts` now instructs the AI to use rich reveal.js features:
- **Auto-animate** (`autoAnimate: true` on Slide) — morphing transitions between consecutive slides
- **r-fit-text** — auto-sizing text on title/impact slides
- **Rich fragments** — 10 types (fade-up, grow, shrink, highlight-red, etc.) instead of basic `fragment`
- **Code blocks with line highlighting** — `data-line-numbers="1|3-5|8"` for step-through
- **Background gradients** — `backgroundGradient` field for CSS gradients on slides
- **Styled tables and blockquotes** — with fragment rows and attribution

Two new optional fields added to the `Slide` type (`src/lib/types.ts`):
- `autoAnimate?: boolean`
- `backgroundGradient?: string`

`RevealSlideshow.tsx` updated to render these as `data-auto-animate` and `data-background-gradient` section attributes.

STYLE_INSTRUCTIONS expanded with per-style feature guidance (professional: no flashy animations; creative: bold gradients + auto-animate; minimal: r-fit-text + fade only; technical: code blocks + dark themes).

**Backward compatible** — all new fields are optional. Existing presentations render unchanged.
