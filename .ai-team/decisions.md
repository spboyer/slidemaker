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

### 2026-02-11: No secrets or tokens in repo content (consolidated)
**By:** Shayne Boyer, Shayne Boyer (via Copilot)
**Status:** Directive

**What:** Never commit GitHub tokens, API keys, credentials, passwords, or any secrets into git — including issues, PRs, commit messages, comments, and repo content. All agents must use environment variable references, secret managers, or placeholders only.

**Why:** A leaked `gho_` OAuth token in GitHub issue #12 triggered a secret scanning alert on 2026-02-10. Shayne issued a standing directive: no secrets in any form. The token audit on 2026-02-11 confirmed no actual tokens were committed to the repository, reinforcing that the policy is working but must remain enforced.

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

### r-fit-text Elimination (Prompt + Rendering)
**Authors:** McManus (Backend Dev), Verbal (Frontend Dev) · **Date:** 2026-02-10

The fitty library used by reveal.js for `r-fit-text` causes uncaught `TypeError` crashes in React due to stale DOM references in `requestAnimationFrame` loops. Eliminated on both sides:
- **Prompt:** Removed r-fit-text instructions from SYSTEM_PROMPT — AI no longer generates slides with the class.
- **Rendering:** `stripFitText()` in `RevealSlideshow.tsx` strips the `r-fit-text` class from slide HTML before `dangerouslySetInnerHTML`, preventing fitty activation.

---

### Tailwind v4 / reveal.js CSS Isolation Strategy (Consolidated)
**Authors:** Verbal (Frontend Dev), Keyser (Lead) · **Date:** 2026-02-10 · **Issues:** #32, #33, #34

**Evolution:** Original `all: revert` on 30+ elements scoped to `.reveal .slides` was destroying theme styles (fonts, colors, heading sizes, fragment animations). Keyser's audit identified this as P0. Replaced with targeted property-level reverts:
- `margin`, `padding` (headings, paragraphs, lists, blockquotes, tables, figures)
- `font-size`, `font-weight` (headings)
- `font-family`, `font-size` (pre, code)
- `list-style`, `padding`, `margin` (ul, ol)
- `border`, `padding`, `text-align` (table, th, td)
- `color`, `text-decoration` (links)
- `font-weight` on strong/b, `font-style` on em/i

Fragment `opacity`, `transform`, `visibility`, `transition` reverts were subsequently removed (see "Code Block Rendering Fix" below) — they broke fragment animations.

Plugin loading convention unchanged:
- Plugins (Highlight, Notes, Zoom) dynamically imported alongside reveal.js.
- highlight.js Monokai CSS loaded via CDN `<link>` tag with cleanup on unmount.
- `overviewhidden` event syncs `currentSlideIndex` when leaving overview mode.

---

### Default Theme Locked to "black"
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Status:** Directive (Shayne Boyer)

`black` set as the one and only default theme with `slide` transition. Matches the revealjs.com demo (`#191919` background, white text, Source Sans Pro font, `#42affa` link color). Updated defaults in `RevealSlideshow.tsx`, `page.tsx`, `route.ts` SYSTEM_PROMPT, and `untitled-presentation.json`. Fixed CSS specificity issue where `.reveal .slides h1` reverts at (0,2,1) were overriding theme heading sizes from `.reveal h1` at (0,1,1). Created 8-slide showcase presentation.

---

### Fix: reveal-viewport Background/Color Override — Tailwind Cascade
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

Playwright computed style inspection revealed that `.reveal-viewport` had `backgroundColor: rgb(255, 255, 255)` (white) instead of the black theme's `--r-background-color: #191919`. Text color was `rgb(0, 0, 0)` instead of `--r-main-color: #fff`. Title headings were 105px instead of the expected 67px.

**Root cause:** Tailwind's `:root { --background: #fff }` cascades through `body { background: var(--background) }` and wins over the theme's `.reveal-viewport { background-color: var(--r-background-color) }` at equal specificity. Similarly for `color: var(--foreground)`. The r-fit-text replacement CSS at specificity (0,4,1) was overriding theme heading sizes at (0,1,1).

**Changes to `src/app/globals.css`:**
1. Added `.reveal-viewport { background-color: var(--r-background-color, #191919) !important; color: var(--r-main-color, #fff) !important }` — forces reveal.js theme custom properties.
2. Added `.reveal { color: var(--r-main-color, #fff) !important; font-family: var(--r-main-font) !important }` — prevents Tailwind body styles from cascading into slides.
3. Removed all r-fit-text replacement heading rules (the `h1:first-child:last-of-type` and `h1:first-child:only-child` blocks) — theme already handles sizing correctly via `--r-heading1-size: 2.5em` and `--r-heading2-size: 1.6em`.

**Why `!important`:** The Tailwind body cascade is structural — it flows through inherited properties. No specificity trick on `.reveal-viewport` alone beats an inherited `background` from `body`. `!important` is the correct and minimal solution.

**Verified:** Build passes, 50 unit tests pass, 34 Playwright e2e tests pass.

---

### Code Block Rendering Fix — pre/code Styles and Fragment Revert
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Status:** Implemented

Three CSS fixes in `src/app/globals.css` to make code blocks render like the reveal.js demo:

1. **Removed `font-size: revert` on pre/code.** `revert` goes to UA default `inherit`, which inherits `.reveal`'s 42px base font — code text was 42px instead of ~23px. Now the theme's `.reveal pre { font-size: 0.55em }` at specificity (0,1,1) wins correctly, giving ~23px code text.

2. **Added explicit code block styling.** Tailwind strips `pre` backgrounds, and without highlight.js theme activation the code block was fully transparent with no padding. Added: `background: #3f3f3f`, `padding: 20px`, `border-radius: 8px`, `overflow: auto`, `box-shadow: 0px 5px 15px rgba(0,0,0,0.15)` to `.reveal .slides pre`.

3. **Removed fragment opacity/transform/visibility/transition revert.** reveal.js sets fragments to `opacity: 0` initially and animates them in. Our `opacity: revert` set it to 1 (visible), breaking all fragment animations — fragments were always visible instead of fading/sliding in.

**Rule:** Never use `font-size: revert` on elements nested inside `.reveal` — the UA default for pre/code is `inherit`, which inherits the 42px base from `.reveal`, not the expected browser monospace sizing.

**Verified:** Build passes, 50 unit tests pass, 34 Playwright e2e tests pass.

---

### highlight.js Activation Fix — Post-Render Re-Highlighting
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

**Problem:** The `RevealHighlight` plugin processes `<pre><code>` elements during `deck.initialize()`, adding syntax highlighting (`hljs` class, `data-highlighted` attribute, colored `<span>` elements, line-number tables). However, `setReady(true)` called after initialization triggers a React re-render. React's `dangerouslySetInnerHTML` reconciliation compares the original `slide.content` HTML string against the plugin-modified DOM, finds them different, and replaces the highlighted DOM with the original unprocessed HTML — wiping all syntax highlighting.

**Root Cause:** React owns the DOM tree rendered via JSX. When a reveal.js plugin modifies DOM elements rendered by `dangerouslySetInnerHTML`, any subsequent React re-render (triggered by state changes like `setReady(true)`) will overwrite those modifications with the original HTML string. This is a fundamental tension between React's declarative DOM ownership and imperative plugin DOM manipulation.

**Fix:** Added `highlightCodeBlocks()` utility in `RevealSlideshow.tsx` that:
1. Gets the highlight plugin via `deck.getPlugin('highlight')`
2. Queries `pre code:not([data-highlighted])` to find unprocessed code blocks
3. Adds `code-wrapper` class to parent `<pre>` (normally done by plugin init)
4. Trims whitespace if `data-trim` attribute is present
5. Calls `plugin.highlightBlock(block)` which runs the plugin's own bundled hljs

Called from:
- A `useEffect` dependent on `ready` state — runs after the `setReady(true)` re-render
- After `deck.sync()` in the content-change effect — handles dynamically added code blocks

**Impact:** Code blocks now show full syntax highlighting with Monokai theme colors, line numbers, and fragment-based line highlighting steps. No new dependencies — uses the plugin's own bundled hljs instance. Build passes, 50 unit tests pass, 34 e2e tests pass.

---

### Slide Area Polish — Compact Chrome, Fragment Visibility, Control Colors
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Status:** Implemented

Three visual gaps identified via Playwright screenshot comparison against revealjs.com demo:

**1. Compact Chrome (Gap 1 — Scale Factor)**
- Top bar: `px-4 py-2` → `px-3 py-1`, link text shortened to icon "←", title truncated with `truncate`
- SlideNav: `px-6 py-4` → `px-3 py-1.5`, buttons reduced from `rounded-lg px-5 py-2 text-sm` to `rounded px-3 py-1 text-xs`, prev/next text replaced with arrow icons only, "AI Slide"→"AI", labels shortened
- Combined savings: ~50px vertical space recovered for the slide container
- Because `embedded: true` in Reveal config, the deck scales to fit its container — taller container = better scale factor

**2. Fragment Visibility in Editor (Gap 2)**
- Chose **Option B**: CSS-only fix in `globals.css`
- Rule: `.reveal.embedded .slides .fragment:not(.visible) { opacity: 1; visibility: inherit; }`
- Fragments show as visible content in embedded editor mode
- Fragment animations preserved in fullscreen presentation mode (not embedded)
- No changes to RevealSlideshow component or Reveal configuration

**3. Navigation Control Colors (Gap 3)**
- `.reveal .controls { color: var(--r-link-color, #42affa) !important; }` — uses theme's link color
- `.reveal .progress { color: var(--r-link-color, #42affa); }` — progress bar matches

**Additional:**
- Speaker notes hint moved from bottom-right to top-right (avoids overlap with reveal.js controls), text shortened to "S = notes"

**Files changed:** `src/app/globals.css`, `src/app/components/SlideNav.tsx`, `src/app/presentation/[slug]/page.tsx`

**Verified:** Build passes, 50 unit tests pass, 34 Playwright e2e tests pass.

---

### CSS: Cap h1 Font Size for Proportional Titles
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

**Problem:** The reveal.js black theme sets `--r-heading1-size: 2.5em` which at 42px base = 105px. Short titles like "REVEAL.JS" look fine, but multi-word titles like "UNDERSTANDING TYPESCRIPT BASICS" fill the entire slide, wrapping to 2 lines and pushing the subtitle off-screen.

**Fix:** Added `.reveal .slides section h1 { font-size: min(var(--r-heading1-size, 2.5em), 2em); }` to `globals.css`. This caps h1 at 2em (84px at 42px base) — proportional like the revealjs.com demo title at ~72px. The `min()` function respects theme custom properties while enforcing a ceiling.

**Showcase presentation updated:** Replaced the 5-slide `untitled-presentation.json` with a new version featuring a short 1-word h1 title ("TypeScript"), proper `class="language-typescript"` on code blocks for syntax highlighting, a comparison table, and a closing slide using h2. Designed to look proportional at any h1 size.

**Verified:** Build passes, 50 unit tests pass, 34 Playwright e2e tests pass.

---

### Storage Abstraction Layer
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #40 · **Status:** Implemented

Introduced `src/lib/storage.ts` — a `StorageProvider` interface that decouples API routes from the filesystem. Two implementations:

**1. Interface Design**
```typescript
interface StorageProvider {
  savePresentation(userId: string, slug: string, data: Presentation): Promise<void>;
  getPresentation(userId: string, slug: string): Promise<Presentation | null>;
  listPresentations(userId: string): Promise<PresentationSummary[]>;
  deletePresentation(userId: string, slug: string): Promise<boolean>;
}
```
All methods take `userId` as the first parameter to support multi-tenancy. `PresentationSummary` returns `{ id, title, createdAt, updatedAt, slideCount }` — same shape as the existing GET list response.

**2. Implementations**
- `LocalFileStorage`: Wraps the existing `presentations/{slug}.json` file I/O. `userId` is ignored (hardcoded to `"local"` in routes). Exact same paths and behavior as before — fully backwards compatible.
- `BlobStorage`: Azure Blob Storage. Blobs stored at `{userId}/{slug}.json` in a `presentations` container. Uses `@azure/storage-blob` SDK. Supports `AZURE_STORAGE_CONNECTION_STRING` or `DefaultAzureCredential` via `AZURE_STORAGE_ACCOUNT_NAME`.

**3. Factory Function**
`getStorage()` returns a singleton:
- If `AZURE_STORAGE_CONNECTION_STRING` is set → `BlobStorage`
- Else if `AZURE_STORAGE_ACCOUNT_NAME` is set → `BlobStorage` (with `DefaultAzureCredential`)
- Else → `LocalFileStorage`

The singleton is cached in module scope. No env var? Local dev just works with no config.

**4. API Route Changes**
Both `src/app/api/presentations/route.ts` and `src/app/api/presentations/[slug]/route.ts` now call `getStorage()` instead of using `fs` directly. `generateSlug()` stays in the presentations route — it's not a storage concern. All routes pass `DEFAULT_USER = "local"` as the userId.

**5. Gotchas for Team**
- `@azure/storage-blob` and `@azure/identity` are now production dependencies.
- `BlobStorage` dynamically imports the Azure SDKs — they won't be loaded in local dev.
- The `deletePresentation` return value is `boolean` (true = deleted, false = not found). The route maps `false` to 404.
- To test with Azure locally: set `AZURE_STORAGE_CONNECTION_STRING` in `.env.local`.
- The singleton factory means the storage backend is fixed for the process lifetime. Restart the dev server after changing env vars.

**Verified:** Build passes, 50 unit tests pass.

---

### GitHub OAuth via NextAuth.js (Auth.js v5)
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #41

#### Auth Configuration

- Auth.js v5 (`next-auth@5.0.0-beta.30`) with GitHub OAuth provider
- Config in `src/auth.ts` exports `handlers`, `auth`, `signIn`, `signOut`
- Route handler at `src/app/api/auth/[...nextauth]/route.ts`
- JWT strategy - sessions in encrypted cookies, no database needed
- Auth.js v5 auto-reads `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` env vars

#### Session Data Shape

```typescript
session.user = {
  id: string;        // GitHub user ID
  name: string;      // GitHub display name
  email: string;     // GitHub email
  image: string;     // GitHub avatar URL
  username: string;  // GitHub login (e.g., "spboyer")
}
```

#### Local Dev Bypass

When `AUTH_GITHUB_ID` is not set, middleware skips all auth checks.
`UserMenu` shows "Dev Mode" badge. Detected via `data-auth-enabled` on `<html>`.

#### Middleware

Uses Auth.js v5 `auth()` wrapper with `req.auth`. Matcher: `/api/:path*`, `/presentation/:path*`.

- **Public:** `/`, `/auth/signin`, `/api/auth/*`
- **Protected:** `/api/presentations/*`, `/api/generate/*`, `/presentation/*`
- API routes return 401 JSON; page routes redirect to sign-in

#### Frontend

- `AuthProvider.tsx` wraps `SessionProvider` from `next-auth/react`
- `UserMenu.tsx` - avatar + sign-out / "Sign in with GitHub" / "Dev Mode"
- Added to home page and presentation page headers

#### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_GITHUB_ID` | No (enables OAuth) | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | With AUTH_GITHUB_ID | OAuth App Client Secret |
| `AUTH_SECRET` | Auto-generated in dev | Session encryption secret |

#### Setup (Manual Step for Shayne)

1. GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Application name: SlideMaker
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID -> `AUTH_GITHUB_ID`, generate Client Secret -> `AUTH_GITHUB_SECRET`
6. Add to `.env.local` (gitignored)

---

### CORS Middleware for API Routes
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #44 · **Status:** Implemented

Added `src/middleware.ts` — Next.js middleware that adds CORS headers to all `/api/*` responses, enabling the MCP server and Copilot Extension to call the API from external processes.

#### CORS Configuration

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | Per-origin (see below) |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |
| `Access-Control-Max-Age` | `86400` (24 hours) |

**Origin resolution (`CORS_ALLOWED_ORIGINS` env var):**
- **Development** (`NODE_ENV !== 'production'`): Always `*` — allows all origins for local dev.
- **Production** (`NODE_ENV === 'production'`):
  - If `CORS_ALLOWED_ORIGINS` is not set → no `Access-Control-Allow-Origin` header (deny all cross-origin requests).
  - If set to `*` → allows all origins.
  - If set to a comma-separated list (e.g. `https://app.example.com,https://copilot.example.com`) → only those exact origins are allowed (per-request origin matching).

**Preflight:** `OPTIONS` requests return `204 No Content` with CORS headers — no body, no downstream route handler invocation.

#### Extending for Auth Middleware (Issues #41, #42)

The middleware structure is designed for extension. To add auth checks:

1. CORS runs first (headers must be set even on auth failures for the browser to read the error).
2. After CORS header injection, add auth logic before `NextResponse.next()`:

```ts
// After setCorsHeaders(response.headers, allowedOrigin) for non-OPTIONS:
const authResult = validateAuth(request);
if (!authResult.valid) {
  const errorResponse = NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
  setCorsHeaders(errorResponse.headers, allowedOrigin);
  return errorResponse;
}
return response;
```

The `setCorsHeaders` helper is already extracted as a reusable function for this purpose.

#### Files Changed
- `src/middleware.ts` (new) — middleware with `config.matcher: ["/api/:path*"]`

**Verified:** Build passes, 50 unit tests pass.

---

### Phase 2 Test Strategy
**Author:** Fenster (Tester) · **Date:** 2026-02-10 · **Issue:** #49 · **Status:** Proposed

**Context:** Phase 2 introduces storage abstraction (#40), GitHub OAuth (#41), CORS middleware (#44), Copilot Extension, and MCP Server. Test scaffolding is needed ahead of implementation.

**Decisions:**

1. **Test plan expanded with 5 new sections (TC-10 through TC-14):**
   - TC-10.x (5 cases): Storage abstraction — LocalFileStorage CRUD, factory pattern for local vs Azure Blob
   - TC-11.x (6 cases): Auth — 401 enforcement, session access, dev bypass, bearer tokens, rate limiting
   - TC-12.x (3 cases): CORS — preflight headers, response headers, dev mode wildcard origin
   - TC-13.x (3 cases): Copilot Extension — skillset invocation, response format, error handling
   - TC-14.x (4 cases): MCP Server — all four CRUD tools

2. **Scaffold files created:**
   - `src/__tests__/storage.test.ts` — Vitest `test.todo()` stubs for TC-10.x
   - `src/__tests__/auth.test.ts` — Vitest `test.todo()` stubs for TC-11.x
   - `e2e/cors.spec.ts` — Playwright `test.fixme()` stubs for TC-12.x (e2e because CORS requires real HTTP)

3. **Priority classification:**
   - P1: Storage (TC-10.x), core auth (TC-11.1–11.3), CORS (TC-12.x) — foundational infra
   - P2: Bearer token auth (TC-11.4–11.6), Copilot Extension (TC-13.x), MCP Server (TC-14.x) — secondary features

4. **Pattern conventions maintained:**
   - Vitest for unit/integration tests in `src/__tests__/`
   - Playwright for e2e tests in `e2e/`
   - TC-{US}.{seq} naming scheme
   - Imports from `@/lib/*` path alias
   - `test.todo()` for vitest stubs, `test.fixme()` for Playwright stubs

5. **No existing tests broken:** All 50 existing unit tests pass alongside the 11 new todo stubs.

**Impact:** McManus can implement against these test contracts. When each feature merges, Fenster fills in the stubs with real assertions.

---

### Bearer Token Authentication for API Clients
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #42

**What:** Added `Authorization: Bearer <github-token>` support for external API clients (MCP server, Copilot Extension) alongside existing OAuth session auth.

#### How Bearer Token Validation Works

1. Middleware flow: CORS -> auth (session OR bearer) -> rate limit -> next.
2. If a NextAuth session exists, it takes priority -- bearer token is not checked.
3. If no session on an API route (`/api/*`), the middleware extracts `Authorization: Bearer <token>` from the request header.
4. The token is validated by calling `GET https://api.github.com/user` with the token. The response provides `id`, `login`, and `avatar_url`.
5. Invalid/expired tokens get `401` with `WWW-Authenticate: Bearer` header. All error responses include CORS headers.
6. Non-API protected routes (e.g. `/presentation/*`) without a session still redirect to sign-in (no bearer support for browser pages).

#### Caching Strategy

- Validated tokens are cached in-memory using a `Map<tokenHash, CachedToken>`.
- Token keys are SHA-256 hashes (`crypto.createHash('sha256')`) -- raw tokens are never stored.
- TTL: 5 minutes. After expiry, the next request re-validates against GitHub.
- A `setInterval` cleanup runs every 60 seconds to evict expired entries (with `.unref()` to avoid blocking Node shutdown).

#### Rate Limiting Behavior

- Fixed-window: 60 requests per 60-second window per user ID.
- Applies to both session-authenticated and bearer-token-authenticated users.
- Exceeded limits return `429` with `Retry-After: <seconds>` header (seconds remaining in window).
- Independent per user -- one user's exhaustion doesn't affect others.

#### Files Changed

- `src/lib/auth-utils.ts` -- New module: `validateBearerToken()`, `checkRateLimit()`, `hashToken()`, token cache, rate limit map.
- `src/middleware.ts` -- Updated to check bearer token when no session, added rate limiting after auth.
- `src/__tests__/auth.test.ts` -- 10 tests: token hashing, validation, caching, rate limiting.

#### How to Test

```bash
# With a valid GitHub token:
curl -H "Authorization: Bearer $(gh auth token)" http://localhost:3000/api/presentations

# Invalid token (expect 401):
curl -H "Authorization: Bearer bad_token" http://localhost:3000/api/presentations

# Rate limit test (expect 429 after 60 requests):
for i in $(seq 1 65); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gh auth token)" \
    http://localhost:3000/api/presentations
done
```

---

### Dockerfile + Azure Container Apps Deployment with CI/CD
**Author:** McManus (Backend Dev / DevOps) · **Date:** 2026-02-10 · **Issue:** #43

#### Dockerfile Build Strategy

Multi-stage Docker build using `node:22-alpine`:
1. **deps** — `npm ci` installs production + dev dependencies (needed for build).
2. **build** — Copies `node_modules` from deps, runs `npm run build`. Next.js `output: "standalone"` produces a self-contained `server.js` with only the required `node_modules` subset (~100MB vs ~500MB full).
3. **runtime** — Copies only `standalone/`, `.next/static/`, and `public/`. Final image contains no source code, no dev dependencies, no build tooling.

Added `output: "standalone"` to `next.config.ts` — the only source code change. `.dockerignore` excludes `node_modules`, `.next`, `.git`, tests, docs, and env files from build context.

`docker-compose.yml` provided for local dev with `.env.local` injection and `presentations/` volume mount.

#### Azure Resources (Bicep IaC)

`infra/main.bicep` provisions:
- **Azure Container Registry (ACR)** — Basic SKU, admin disabled, pull via managed identity.
- **Azure Container App** — Runs the Docker image with HTTP ingress on port 3000, scales 0–3 replicas based on concurrent requests.
- **Container App Environment + Log Analytics Workspace** — Centralized logging.
- **Azure Storage Account + blob container** (`presentations`) — For production file persistence.
- **User-assigned Managed Identity** — Granted ACR Pull and Storage Blob Data Contributor roles.

All resource names use `uniqueString(resourceGroup().id)` to avoid collisions. Parameters: `location` (default: resource group location), `resourcePrefix` (default: `slidemaker`), `containerImage`.

`infra/main.bicepparam` provides sensible defaults (eastus2, slidemaker prefix).

#### CI/CD Pipeline Flow

`.github/workflows/deploy.yml` triggers on push to `master` or manual dispatch:

1. **build-and-push** job:
   - Checks out code
   - Azure Login via OIDC (federated credentials, no stored secrets)
   - Deploys/updates infrastructure via `azure/arm-deploy` with Bicep
   - Logs into ACR via `az acr login`
   - Builds Docker image tagged with commit SHA + `latest`
   - Pushes both tags to ACR

2. **deploy** job (depends on build-and-push):
   - Azure Login via OIDC
   - Deploys new image to Container App via `azure/container-apps-deploy-action`

#### Required GitHub Secrets

| Secret | Description | How to set |
|--------|-------------|------------|
| `AZURE_CLIENT_ID` | App registration client ID for OIDC | Create in Entra ID → App registrations; add federated credential for `repo:spboyer/slidemaker:ref:refs/heads/master` |
| `AZURE_TENANT_ID` | Entra ID tenant ID | Found in Entra ID → Overview |
| `AZURE_SUBSCRIPTION_ID` | Target Azure subscription ID | Found in Azure Portal → Subscriptions |

The app registration's service principal needs **Contributor** on the resource group (`slidemaker-rg`) and **AcrPush** on the container registry. Create the resource group before first deploy: `az group create -n slidemaker-rg -l eastus2`.

No API keys or tokens are stored in the pipeline — OIDC federated credentials provide zero-secret auth to Azure.

---

### Copilot Extension Skillset Endpoint
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #45

Added `POST /api/copilot/skillset` endpoint for GitHub Copilot Extension skill invocations. Key decisions:

1. **Shared presentation service** (`src/lib/presentation-service.ts`): Extracted the generate-and-create logic (AI call, slug generation, storage persistence) into a shared utility `generateAndCreatePresentation()`. Both the existing chat flow and the new Copilot endpoint can use this service, eliminating duplication. The SYSTEM_PROMPT and style instructions are co-located in the service module.

2. **Input parsing**: The skillset endpoint parses the last user message from the Copilot `messages` array. Supports `--style <style>` and `--slides <N>` flags, and strips `/slidemaker` prefix if present. Invalid styles are silently ignored; out-of-range slide counts fall back to default (5).

3. **Auth model**: Uses `X-GitHub-Token` header validation via the existing `validateBearerToken()` from `auth-utils.ts`. When `AUTH_GITHUB_ID` is not set (dev mode), all requests are allowed — matching the middleware pattern.

4. **Response format**: Returns GitHub Copilot Extension format (`{ messages: [{ role: "assistant", content: "..." }] }`) with a formatted summary including edit link, slide count, theme, and slide listing.

5. **Edit URL construction**: Uses `NEXTAUTH_URL` or `VERCEL_URL` env vars to build the presentation edit link, falling back to `http://localhost:3000`.

6. **Error handling**: Missing topic returns a friendly usage hint. AI failures return error message with retry suggestion. Auth failures return 401 with Copilot-format error messages.

7. **Tests**: 15 new tests in `copilot-skillset.test.ts` covering: service exports, route handler export, and `parseSkillsetMessage` parsing (topic extraction, flag parsing, prefix stripping, edge cases). Total test count: 75 passing.

**Files added:**
- `src/lib/presentation-service.ts` — shared generate+create service
- `src/app/api/copilot/skillset/route.ts` — Copilot Extension endpoint
- `src/__tests__/copilot-skillset.test.ts` — unit tests

**Not changed:** Existing generate and presentations routes were left unchanged to avoid risk. They can be refactored to use `presentation-service.ts` in a follow-up.

---

### MCP Server Package for SlideМaker
**Author:** McManus (Backend Dev) · **Date:** 2025-07-15 · **Status:** Implemented · **Issue:** #47

MCP (Model Context Protocol) is a standard for exposing tools to AI assistants like Claude, Copilot CLI, and other MCP-compatible clients. Created a standalone npm package at `packages/mcp-server/` that wraps the SlideМaker API as MCP tools using `@modelcontextprotocol/sdk` with stdio transport.

The MCP server is a thin HTTP client — all business logic stays in the Next.js API. Each tool validates input, calls the SlideМaker REST API with Bearer token auth, and returns formatted results.

#### Token Resolution Order

1. `SLIDEMAKER_TOKEN` env var
2. `GITHUB_TOKEN` env var
3. `gh auth token` CLI output (subprocess, 5s timeout)

If none are found, the server throws a clear error at tool invocation time.

#### Configuration

| Env Var | Description | Default |
|---|---|---|
| `SLIDEMAKER_API_URL` | Base URL of the SlideМaker app | `http://localhost:3000` |
| `SLIDEMAKER_TOKEN` | Auth token (highest priority) | — |
| `GITHUB_TOKEN` | Fallback auth token | — |

#### MCP Tools

- **`create_presentation`** — Input: `{ topic, style?, numSlides? }`. Calls `POST /api/generate` → `POST /api/presentations`. Style options: professional, creative, minimal, technical.
- **`list_presentations`** — Input: `{}`. Calls `GET /api/presentations`.
- **`get_presentation`** — Input: `{ slug }`. Calls `GET /api/presentations/{slug}`.
- **`delete_presentation`** — Input: `{ slug }`. Calls `DELETE /api/presentations/{slug}`.

#### Running Locally

```bash
cd packages/mcp-server
npm install && npm run build
SLIDEMAKER_API_URL=http://localhost:3000 node dist/index.js
```

#### Claude Desktop Config

```json
{
  "mcpServers": {
    "slidemaker": {
      "command": "node",
      "args": ["path/to/slidemaker/packages/mcp-server/dist/index.js"],
      "env": { "SLIDEMAKER_API_URL": "http://localhost:3000" }
    }
  }
}
```

#### Package Structure

```
packages/mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # MCP server entry, stdio transport, tool routing
│   ├── api.ts          # Shared HTTP client for SlideМaker API
│   └── tools/
│       ├── create.ts   # create_presentation tool
│       ├── list.ts     # list_presentations tool
│       ├── get.ts      # get_presentation tool
│       └── delete.ts   # delete_presentation tool
└── dist/               # Compiled output (ES2022, ESNext modules)
```

**Constraints:** Separate package — does not modify the main Next.js app. Thin client; all business logic lives in the API. Uses stdio transport. TypeScript with ES modules targeting ES2022.

---

### Copilot Extension Registration & Setup Documentation
**Author:** Keyser (Lead) · **Date:** 2025-07-22 · **Issue:** #46 · **Status:** Proposed

Added documentation and skill definition for registering SlideМaker as a GitHub Copilot Extension:

1. **`copilot-extension.json`** — Skill definition at project root with `topic` (required), `style`, and `numSlides` parameters. Matches the existing `parseSkillsetMessage()` contract in `src/app/api/copilot/skillset/route.ts`.

2. **`docs/copilot-extension-setup.md`** — Step-by-step guide covering GitHub App creation, Copilot Agent enablement, callback URL configuration, installation for users/orgs, usage examples with flags, local testing with curl, and troubleshooting common errors.

3. No code changes — docs only. The existing `/api/copilot/skillset` endpoint already handles the full Copilot Extension flow (auth, message parsing, generation, response formatting).

**Trade-offs:** The skill schema in `copilot-extension.json` is informational (GitHub reads the agent URL, not a local JSON file). Kept it in the repo as a reference contract for the skill's API surface. If GitHub introduces a formal manifest format, this file should be updated to match.

---

### MCP Configuration Files and Client Setup Documentation
**Author:** Keyser (Lead) · **Date:** 2025-07-23 · **Issue:** #48 · **Status:** Proposed

Added MCP client configuration files and setup documentation for the `@slidemaker/mcp-server` package.

**What was created:**

- `docs/mcp-configs/claude_desktop_config.json` — Claude Desktop MCP server config
- `docs/mcp-configs/copilot-mcp.json` — GitHub Copilot CLI MCP server config
- `docs/mcp-configs/vscode-mcp.json` — VS Code MCP server config
- `docs/mcp-setup.md` — Complete setup guide covering installation, authentication, per-client configuration, all four tool schemas with examples, environment variables reference, and troubleshooting

**Key decisions:**

- Auth token resolution order follows the existing server logic: `SLIDEMAKER_TOKEN` → `GITHUB_TOKEN` → `gh auth token`. Documented all three paths.
- Claude Desktop config uses the Azure Container Apps URL as default (`https://your-app.azurecontainerapps.io`) since it targets production. Copilot CLI and VS Code configs default to `http://localhost:3000` for local development.
- Copilot CLI config omits explicit token config because Copilot CLI injects `GITHUB_TOKEN` automatically.
- No secrets in any committed file — all configs use env var references or placeholders.
- Tool documentation includes parameter schemas, types, required flags, and natural-language usage examples derived from the actual tool definitions in `packages/mcp-server/src/tools/`.

---

### Token Audit — No Leaked Credentials Found
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Status:** Completed

Exhaustive search of all git history across all 17 branches found **no actual GitHub tokens** (ghp_, gho_, ghs_, github_pat_) committed to the repository. The previously-reported `gho_` leak (referenced in the security directive) occurred in a GitHub issue body (#12), not in repo code.

**Remediation performed:**
- Replaced `ghp_your_token_here` placeholder in `docs/mcp-setup.md` with `$(gh auth token)` shell substitution to avoid triggering secret scanners.
- Verified `.gitignore` already covers `.env*` files.
- Confirmed test fixtures use obviously-fake tokens (`ghp_abc123`, `ghp_valid_token`, etc.).
- Confirmed `resolveGitHubToken()` in `src/lib/openai.ts` has never had a hardcoded token — uses env var + CLI fallback only.

**Recommendation:** If the team ever suspects a real token was exposed, it should be revoked immediately at https://github.com/settings/tokens regardless of cleanup.
