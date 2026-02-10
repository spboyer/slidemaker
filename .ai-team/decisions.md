# Decisions

> Shared decision log. All agents read this before starting work. Scribe merges new entries from the inbox.

---

### PRD Decomposition into GitHub Issues
**Author:** Keyser (Lead) · **Date:** 2025-07-22 · **Status:** Accepted

9 user stories decomposed into issues #1–#9. McManus owns APIs (#7, #8), Verbal owns frontend (#1–#6), Fenster owns testing (#9). Dependency graph: US-7 (#8) and US-8 (#7) are foundational with no deps; most frontend stories depend on them. US-2 (#2) can start immediately.

**Execution order:** McManus US-7+US-8 and Verbal US-2 in parallel → Verbal US-3/5/6 after CRUD API → Verbal US-1/4 after both APIs → Fenster US-9 last.

---

### Next.js 16 + Tailwind 4 Scaffold
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10

- Scaffolded Next.js 16.1.6, React 19.2.3, Tailwind CSS v4, TypeScript.
- React Compiler declined; Turbopack disabled.
- `/presentations` directory at repo root for JSON file storage.
- OpenAI client in `src/lib/openai.ts` reads `OPENAI_API_KEY` from env.
- Import alias `@/*` maps to `src/*`. Shared types in `src/lib/types.ts`.

---

### Lazy OpenAI Client Initialization
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

OpenAI SDK constructor throws if `OPENAI_API_KEY` is not set, breaking `npm run build`. Changed to lazy `getOpenAIClient()` factory. All server code must use `getOpenAIClient()` instead of the old `openai` export.

---

### Slug Generation Convention
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Slugs: lowercase, strip non-alphanumeric (except spaces/hyphens), collapse multiple hyphens, trim, cap at 40 chars. No collision detection — duplicate titles overwrite.

---

### Next.js 16 Dynamic Route Params
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Dynamic route handler params are `Promise<{ slug: string }>`. Must `await params` before accessing `.slug`.

---

### AI Model and Response Format
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Generate endpoint uses `gpt-4o`, `response_format: { type: "json_object" }`, `temperature: 0.7`. System prompt returns `{ slides: Slide[] }`. Existing slides included in user message for complementary generation.

---

### File Storage Path
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Presentations stored in `presentations/` at repo root (`path.join(process.cwd(), "presentations")`). Directory created on demand with `fs.mkdir({ recursive: true })`.

---

### Error Handling Strategy
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

All API routes return JSON errors with appropriate HTTP status. OpenAI 429 → 429, 401 → 401, timeout → 504, other → 500.

---

### Slide Component Architecture
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #2

- SlideViewer receives a single `Slide` + `index` — pure presentational, parent owns state.
- Gradient rotation: 8 presets cycle by slide index.
- Keyboard navigation lives in SlideNav via `useEffect` keydown listener with `useCallback`.
- Initial sample slides replaced by API fetch after #7 completed.
- `prose prose-invert` for markdown — Tailwind v4 includes typography utilities natively.

---

### Test Plan & Infrastructure
**Author:** Fenster (Tester) · **Date:** 2026-02-10

- Test plan covers all 9 user stories with 40+ test cases in `src/__tests__/test-plan.md`.
- Naming: `TC-{US}.{seq}`. Priority: P0 (build & CRUD basics), P1 (core API), P2 (UI & security).
- Test runner: Vitest (see "Vitest Test Infrastructure" below).
- API tests (US-7: 17 cases, US-8: 8 cases) are primary validation target.
- Security cases: path traversal (SEC-1), XSS (SEC-2), large payloads (SEC-3), API key leakage (SEC-4). McManus should ensure slug sanitization.

---

### Editor, Slide Management & Landing Page
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #3, #5, #6

- SlideEditor uses side-by-side layout — edit panel left, live SlideViewer preview right (stacks vertically on mobile via `lg:flex-row`).
- SlideManager is a toggle-able sidebar panel with move-up/move-down buttons for reorder (no DnD library).
- Auto-save on every action — edits, reorder, delete all persist immediately via `PUT /api/presentations/{slug}`.
- Landing page uses PresentationList client component fetching from `GET /api/presentations` on mount.
- `/presentation/new` redirects to `/` — creation flow handled by PresentationChat component.
- `window.confirm()` for destructive actions (presentation delete, slide delete).

---

### Chat Sidebar & Add Slide Integration
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #1, #4

- `PresentationChat.tsx` is a stateless chat component: receives `existingSlides` and `onSlidesGenerated` callback. Parent page owns all presentation state and persistence logic.
- `/presentation/new` route is handled by the same `[slug]/page.tsx` — when `slug === "new"`, chat opens by default; on first AI generation, the page POSTs to `/api/presentations` and uses `router.replace()` to switch to the real slug URL.
- `SlideNav` buttons (`onAddSlide`, `onAddBlank`) are optional props — backward compatible; existing usages without them render the original nav without buttons.
- "AI Slide" button calls `POST /api/generate` with `{ topic: presentationTitle, numSlides: 1, existingSlides }` and appends the result.
- "Blank" button appends `{ title: "New Slide", content: "" }` and opens editor mode.
- All mutations (add slide, chat-generated, blank) auto-save via PUT to the existing presentation.

---

### Vitest Test Infrastructure
**Author:** Fenster (Tester) · **Date:** 2026-02-10 · **Issue:** #9

- Vitest installed as dev dependency (`npm install -D vitest`).
- Config in `vitest.config.ts` with `@` path alias matching `tsconfig.json`.
- Test script: `"test": "vitest run"` in package.json.
- Tests in `src/__tests__/smoke.test.ts` — 23 tests, all passing.
- CRUD integration tests use isolated temp directories (not the real `presentations/` dir) with `afterAll` cleanup.
- API route handler functions are verified as importable and callable — full HTTP-level testing would require `next/test` or a running dev server.
- Slug generation is tested at unit level including SEC-1 path traversal checks.
- Build, lint, and TypeScript compilation all pass cleanly.

---

### No Secrets in GitHub Content
**Author:** Shayne Boyer (via Copilot) · **Date:** 2026-02-10 · **Status:** Directive

Never include secrets (tokens, API keys, credentials, passwords) in GitHub issues, PRs, commit messages, comments, or any repo content. Use environment variables or secret managers only. A leaked `gho_` OAuth token in issue #12 triggered a GitHub secret scanning alert. Preventing recurrence.

---

### Chat Style Values Must Match API Valid Styles
**Author:** Keyser (Lead) · **Date:** 2025-07-23 · **Issue:** #23

`PresentationChat.inferStyle()` must only return values that `/api/generate` accepts in its `VALID_STYLES` array: `"professional"`, `"creative"`, `"minimal"`, `"technical"`. The previous `"business"` value was not in the API's allow-list and caused 400 errors. If new styles are added to the API, update `inferStyle()` to match — or vice versa. A shared constant would prevent future drift.

---

### Switched to GitHub Models API
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #12

Replaced direct OpenAI API integration with GitHub Models API. The OpenAI SDK is still used as the HTTP client, but pointed at `https://models.github.ai/inference` with a GitHub token instead of an OpenAI API key. Token resolution checks `GITHUB_TOKEN` env var first, then falls back to `gh auth token` CLI output for zero-config local development. Model names use GitHub Models convention (`openai/gpt-4o` instead of `gpt-4o`). Eliminates the need for a separate OpenAI API key.

---

### RevealSlideshow Integration & Keyboard Coordination
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #16, #17

- `SlideViewer` is no longer used in the main presentation view — replaced by `RevealSlideshow`. `SlideViewer` remains in `SlideEditor` for the live preview panel.
- Keyboard coordination: reveal.js uses `keyboardCondition: "focused"` (set in RevealSlideshow). SlideNav's global keydown listener skips events when the reveal container is focused. This prevents double-navigation.
- ThemePicker uses native `<details>` element for the dropdown — no external dropdown library needed.
- Theme changes are persisted via `PUT /api/presentations/{slug}` with `{ slides, theme }` body. The API must accept and store the `theme` field.
- Fullscreen uses the browser Fullscreen API on the `.reveal` container element.

---

### RevealSlideshow CSS Loading Strategy
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #15

reveal.js CSS (base `reveal.css` and theme files) cannot be imported via JS `import` in Next.js dynamic imports — they must be loaded as `<link>` tags. The `RevealSlideshow` component injects `<link>` elements into `<head>` pointing to jsDelivr CDN (`https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/...`). Theme switching swaps the `href` on the existing link. Both links are cleaned up on unmount. If the team wants to self-host these CSS files later, update the `loadRevealBaseCSS()` and `loadThemeCSS()` functions in `RevealSlideshow.tsx`.

reveal.js 5.x ships no TypeScript declarations — `src/types/reveal.d.ts` provides ambient module declarations. Keep this in sync if new reveal.js APIs are used.

---

### 2026-02-10: Always update docs, tests, and agents.md with changes
**By:** Shayne Boyer (via Copilot)
**What:** When making changes or additions to the codebase, always update related documentation (README, inline docs), tests, and agents.md. No change ships without corresponding doc/test updates.
**Why:** User directive — ensures the project stays well-documented and tested as it evolves.

---

### README Documentation Standard
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **PR:** #31

Replaced the default create-next-app boilerplate README with comprehensive SlideМaker documentation. The README now covers: features, tech stack, prerequisites (GitHub CLI), environment setup (gh auth login flow), usage guide with keyboard shortcuts, API reference for all endpoints, development commands, and project structure. No secrets or tokens are included — follows the team security directive. MIT license declared.

---

### Playwright E2E Test Setup
**Author:** Fenster (Tester) · **Date:** 2026-02-10 · **Issue:** #37 · **PR:** #38

1. **Chromium-only**: Playwright configured with Chromium only (not Firefox/WebKit) for CI speed. Can expand later if cross-browser coverage is needed.
2. **File-based fixtures**: E2E test fixtures write JSON files directly to `presentations/` directory rather than using the API or AI generation. Tests independent of GitHub Models API.
3. **Chat generation tests skip gracefully**: Tests in `chat-generation.spec.ts` skip via `test.skip()` when `/api/generate` returns auth errors (401/403). Prevents CI failures without `GITHUB_TOKEN`.
4. **webServer auto-start**: `playwright.config.ts` uses `webServer.command: "npm run dev"` so `npm run test:e2e` is self-contained. `reuseExistingServer: true` in local dev.
5. **Test isolation**: Each test file uses a unique presentation slug (`e2e-{feature}-test`) and cleans up in `afterAll` / `afterEach`.
6. **reveal.js readiness**: Tests wait for `.reveal .slides section` to appear before interacting. `waitForReveal()` helper in `e2e/helpers.ts` handles this with a 15s timeout.

**Impact:** `npm run test:e2e` runs the full Playwright suite. `e2e/helpers.ts` is the shared fixture module. Tests needing the AI API should follow the skip pattern in `chat-generation.spec.ts`. Playwright artifacts are gitignored.

---

### Console Error Detection Playwright Tests
**Author:** Fenster (Tester) · **Date:** 2026-02-10

New `e2e/console-errors.spec.ts` catches uncaught browser JS errors during presentation load, navigation, and r-fit-text content rendering. Uses `page.on('pageerror')` to detect errors that Playwright tests otherwise silently ignore — prevents regressions like the fitty rAF crash.

---

### Slide Quality Audit — Gap Analysis
**Author:** Keyser (Lead) · **Date:** 2026-02-10

Comprehensive audit of the gap between generated slides and the revealjs.com demo quality bar. Key findings:

1. **P0 — `all: revert` CSS is the #1 problem.** Applied to 30+ elements in `.reveal .slides`, it reverts ALL properties to browser defaults, destroying reveal.js theme styles (fonts, colors, heading sizes, letter-spacing, text-transforms), fragment animations, and code block styling. All 11 themes are broken equally. Fix: replace with targeted property-level reverts for only the properties Tailwind v4 resets.

2. **P1 — Prompt improvements needed.** Missing `data-id` for auto-animate, no `r-stack`/`r-hstack` layouts, light backgrounds on dark themes, no code blocks for technical topics, underwhelming title slides.

3. **P1 — CSS replacement for `r-fit-text`.** Use `font-size: clamp()` or similar to restore dramatic title slide sizing without the fitty library crash.

4. **P2 — Background images already in data model but not prompted.** P3 — vertical slides and background video are nice-to-haves.

**Execution order:** Verbal fixes CSS (P0) → Verbal adds r-fit-text CSS replacement (P1) → McManus upgrades prompt (P1) → McManus adds background image instructions (P2).

---

### SYSTEM_PROMPT V2: Conference-Quality Slide Generation
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Status:** Implemented

Complete rewrite of the SYSTEM_PROMPT in `src/app/api/generate/route.ts` to produce slides matching revealjs.com demo quality:

1. **Slide Type Taxonomy** — 8 defined types (Cover, Section Divider, Content, Code, Comparison, Quote, Impact, Closing) with specific HTML rules per type. Every deck must start with Cover and end with Closing.
2. **Typography Rules** — h1 only on cover slide, short punchy text (3-7 word titles, 3-4 lines max), no h1 elsewhere.
3. **Strict HTML Quality Rules** — Max 5 bullets, no nested lists, no r-fit-text, no nested sections, code blocks require data-trim data-noescape, ~60% fragment usage not 100%.
4. **Background Design System** — Cover requires dark gradient, section dividers require contrasting backgrounds, 40%+ slides with custom backgrounds, defined complementary color palettes.
5. **Speaker Notes Quality** — Timing cues, engagement prompts, transition hints.
6. **Theme Intelligence** — Topic-aware: technical→night/black/moon, business→white/simple/serif, creative→league/sky/solarized. NEVER suggest "beige".
7. **Upgraded Example** — 3-slide deck fragment (cover + auto-animate impact pair).

All new Slide fields remain optional — backward compatible. Build passes, 50 unit tests pass.

---

### Remove r-fit-text from AI Generation Prompt
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10

Removed r-fit-text instructions from SYSTEM_PROMPT — AI no longer generates slides with the `r-fit-text` class. The fitty library used by reveal.js for r-fit-text causes uncaught TypeError crashes in React due to stale DOM references in rAF loops. Verbal also strips r-fit-text on the rendering side.

---

### Tailwind v4 / reveal.js CSS Isolation Strategy (Updated)
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #32, #33, #34

Original approach used `all: revert` on all content elements scoped to `.reveal .slides`. This was replaced with targeted property-level reverts (see "CSS Scoping: Replace `all: revert`" decision below) after Keyser's audit revealed it was destroying theme styles.

Plugin loading convention and overview mode fix remain unchanged:
- Plugins (Highlight, Notes, Zoom) dynamically imported alongside reveal.js.
- highlight.js Monokai CSS loaded via CDN `<link>` tag with cleanup on unmount.
- `overviewhidden` event syncs `currentSlideIndex` when leaving overview mode.

---

### CSS Scoping: Replace `all: revert` with Targeted Property Reverts
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

Replaced the nuclear `all: revert` rule (applied to 30+ elements inside `.reveal .slides`) with targeted `revert` on only the specific properties Tailwind v4's base layer resets:
- `margin`, `padding` (headings, paragraphs, lists, blockquotes, tables, figures)
- `font-size`, `font-weight` (headings)
- `font-family`, `font-size` (pre, code)
- `list-style`, `padding`, `margin` (ul, ol)
- `border`, `padding`, `text-align` (table, th, td)
- `color`, `text-decoration` (links)
- `font-weight` on strong/b, `font-style` on em/i
- `opacity`, `transform`, `visibility`, `transition` (on `.fragment`)

Also added r-fit-text compensation CSS (standalone title headings render at 2.5–3em) and fragment animation preservation. All 11 themes now render correctly. Build passes, 50 unit tests pass.

---

### Strip r-fit-text from Slide Content in RevealSlideshow
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

The `r-fit-text` CSS class is stripped from slide HTML content before rendering via `stripFitText()` in `RevealSlideshow.tsx`. This prevents fitty's `requestAnimationFrame` loop from crashing when React reconciliation detaches DOM nodes that fitty still holds references to.