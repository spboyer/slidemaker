### SYSTEM_PROMPT V2: Conference-Quality Slide Generation
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Status:** Implemented

**What changed:**
Complete rewrite of the SYSTEM_PROMPT in `src/app/api/generate/route.ts` to produce slides that match revealjs.com demo quality. Also upgraded all four STYLE_INSTRUCTIONS entries.

**Key additions:**
1. **Slide Type Taxonomy** — 8 defined slide types (Cover, Section Divider, Content, Code, Comparison, Quote, Impact, Closing) with specific HTML rules per type. Every deck must start with Cover and end with Closing.
2. **Typography Rules** — h1 only on cover slide, short punchy text (3-7 word titles, 3-4 lines max per slide), no h1 elsewhere.
3. **Strict HTML Quality Rules** — Max 5 bullets, no nested lists, no r-fit-text, no nested sections, code blocks require data-trim data-noescape, ~60% fragment usage not 100%.
4. **Background Design System** — Cover requires dark gradient, section dividers require contrasting backgrounds, 40%+ slides with custom backgrounds, defined complementary color palettes (deep blues, dark warm, emerald, sunset).
5. **Speaker Notes Quality** — Must include timing cues, engagement prompts, and transition hints. No restating slide content.
6. **Theme Intelligence** — Topic-aware theme suggestions. Technical→night/black/moon, business→white/simple/serif, creative→league/sky/solarized. NEVER suggest "beige".
7. **Upgraded Example** — 3-slide deck fragment (cover + auto-animate impact pair) replacing the old 2-slide example.

**Constraints preserved:**
- No `r-fit-text` (fitty crash in React)
- No vertical/nested sections (data model doesn't support)
- JSON output format unchanged (slides array with title, content, notes, etc.)
- All new Slide fields remain optional — backward compatible

**Rationale:** Shayne reported slide styles "just aren't impressive." The v1 prompt gave general guidance but lacked specific constraints on typography, backgrounds, and slide structure. The v2 prompt is prescriptive — it defines what each slide type looks like, sets hard limits on bullet counts and nesting, and provides curated color palettes instead of leaving background choices to chance.

**Verified:** Build passes, all 50 unit tests pass.
