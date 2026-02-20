# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### Summary: 2026-02-10 — Issues #2, #3, #5, #6, #1, #4 (Core UI)
Built all frontend components: `SlideViewer.tsx` (presentational, parent owns state), `SlideNav.tsx` (keyboard nav, optional add buttons), `SlideEditor.tsx` (side-by-side edit+preview), `SlideManager.tsx` (sidebar reorder/delete), `PresentationList.tsx` (landing page grid), `PresentationChat.tsx` (collapsible right-side chat panel). Tailwind v4 includes typography utilities natively (`prose prose-invert`). Next.js 16 `useParams` returns params directly. `/presentation/new` handled by `[slug]/page.tsx` — creates via POST on first AI generation, replaces URL with slug. All mutations auto-save via PUT.

📌 Team update (2026-02-10): CRUD API (#8) and AI generation API (#7) are complete — use `getOpenAIClient()` factory, slugs max 40 chars, `await params` for Next.js 16 dynamic routes — decided by McManus
📌 Team update (2026-02-10): Vitest installed with 23 passing tests — `npm run test` available, covers types, CRUD, slugs, API exports, security — decided by Fenster

### Summary: 2026-02-10 — Issues #15, #16, #17 (reveal.js Integration)
Created `RevealSlideshow.tsx` — `forwardRef` client component wrapping reveal.js 5.x via dynamic import. CSS loaded via `<link>` tags from jsDelivr CDN (not static imports). Created `src/types/reveal.d.ts` for ambient declarations. Replaced `SlideViewer` with `RevealSlideshow` in main presentation view. Created `ThemePicker.tsx` using `<details>` dropdown. Keyboard coordination: `keyboardCondition: "focused"` in reveal.js, SlideNav skips when reveal focused. Added fullscreen, overview, speaker notes to top bar.

📌 Team update (2026-02-10): Never include secrets in GitHub issues, PRs, or repo content — directive by Shayne Boyer
📌 Team update (2026-02-10): Always update docs, tests, and agents.md when making changes — directive by Shayne Boyer

### Summary: 2026-02-10 — Issues #32–35 (CSS + Plugins + Editor Wiring)
Added reveal.js plugins (Highlight, Notes, Zoom) via dynamic import. Loaded highlight.js Monokai CSS from CDN. Added `overviewhidden` event sync. Applied `layout`, `autoAnimate`, `backgroundGradient` fields in `sectionAttrs()`. Added editor controls for autoAnimate checkbox and backgroundGradient input.

📌 Team update (2026-02-10): AI prompt now generates auto-animate, r-fit-text, rich fragments, code line highlighting, background gradients — new `autoAnimate` and `backgroundGradient` fields on Slide type — decided by McManus
📌 Team update (2026-02-10): Playwright e2e tests available via `npm run test:e2e` — use `e2e/helpers.ts` for fixtures, follow skip pattern for API-dependent tests — decided by Fenster

### 2026-02-10 — fitty/r-fit-text crash fix
reveal.js uses fitty internally for `r-fit-text`. Fitty's `requestAnimationFrame` loop crashes with `TypeError: Cannot read properties of null (reading 'clientWidth')` during React reconciliation. Fix: `stripFitText()` removes class before rendering. Headings render correctly via CSS revert rules.

### 2026-02-10 — CSS scoping fix (all: revert → targeted reverts)
`all: revert` on 30+ elements was destroying theme styles. Replaced with targeted `revert` on only Tailwind-reset properties (margin, padding, font-size, font-weight, font-family, list-style, border, text-decoration, color). Removed fragment animation reverts. All 11 themes render correctly.

📌 Team update (2026-02-10): SYSTEM_PROMPT V2 deployed — 8-type slide taxonomy, strict HTML rules, curated backgrounds, theme intelligence — decided by McManus
📌 Team update (2026-02-10): Console error detection e2e tests added — `page.on('pageerror')` catches uncaught JS errors during Playwright runs — decided by Fenster
📌 Team update (2026-02-10): r-fit-text removed from AI prompt and stripped from rendering — fitty crash eliminated — decided by McManus & Verbal
- **2026-02-10 — Default theme locked in (black):** Set `black` as the one and only default theme with `slide` transition across all components: `RevealSlideshow.tsx` fallback, `page.tsx` ThemePicker default, `route.ts` SYSTEM_PROMPT default suggestion, and showcase presentation JSON. Fixed CSS: removed heading `font-size: revert`/`font-weight: revert`/`margin: revert` from `.reveal .slides h1-h6` — these were at higher specificity (0,2,1) than the theme's `.reveal h1` rules (0,1,1), causing theme heading sizes/weights/margins to be overridden with UA defaults instead of the theme's CSS custom property values. Created 8-slide self-referential showcase presentation (`untitled-presentation.json`) demonstrating: cover with gradient, impact statement, fragment bullets, code with line highlighting, comparison table, blockquote, auto-animate pair. Build passes, 50 unit tests pass, 34 e2e tests pass.
- **2026-02-10 — Viewport background/color override fix:** Playwright computed style inspection revealed three cascade issues: (1) `.reveal-viewport` background was white (#fff) instead of theme's `--r-background-color` (#191919) — Tailwind's `:root { --background: #fff }` cascaded through body and won. (2) Text color was black (#171717) from `--foreground` instead of theme's `--r-main-color` (#fff). (3) h2 titles were 105px (2.5em × 42px) due to `.reveal .slides section h2:first-child:last-of-type` at specificity (0,4,1) beating theme's `.reveal h2` at (0,1,1). Fix: added `.reveal-viewport { background-color: var(--r-background-color) !important; color: var(--r-main-color) !important }` and `.reveal { color: var(--r-main-color) !important; font-family: var(--r-main-font) !important }` to globals.css. Removed all r-fit-text replacement heading rules — theme already sizes headings correctly via `--r-heading1-size`/`--r-heading2-size`. The `!important` is justified to beat the Tailwind body cascade. Build passes, 50 unit tests pass, 34 e2e tests pass. Key learning: when reveal.js themes set CSS custom properties on `:root`, Tailwind's own `:root` variables for body background/color cascade through and override the theme's `.reveal-viewport` rules at equal specificity — explicit `!important` overrides in globals.css are the correct fix.
- **2026-02-10 — Code block rendering fix:** Three CSS fixes in `globals.css`: (1) Removed `font-size: revert` on `.reveal .slides pre` and `.reveal .slides code` — `revert` goes to UA default `inherit`, which picks up `.reveal`'s 42px base font, making code 42px instead of ~23px. Theme's `.reveal pre { font-size: 0.55em }` at (0,1,1) now wins correctly. (2) Added explicit `background: #3f3f3f`, `padding: 20px`, `border-radius: 8px`, `overflow: auto`, `box-shadow` to `.reveal .slides pre` — Tailwind strips pre backgrounds, and without highlight.js activation the code block was fully transparent with no padding. (3) Removed `.reveal .slides .fragment { opacity: revert; transform: revert; visibility: revert; transition: revert; }` — reveal.js sets fragments to `opacity: 0` initially and animates them in; `revert` set opacity to 1 (visible), breaking all fragment animations. Key learning: never use `font-size: revert` on elements inside `.reveal` — the UA default for pre/code font-size is `inherit`, which inherits the 42px base from `.reveal`, not the expected browser monospace sizing. Build passes, 50 unit tests pass, 34 e2e tests pass.
- **2026-02-10 — highlight.js activation fix:** The `RevealHighlight` plugin processes `<pre><code>` during `deck.initialize()`, adding `hljs` class, `data-highlighted` attribute, syntax-colored `<span>` elements, and line-number tables. However, `setReady(true)` after init triggers a React re-render, and React's `dangerouslySetInnerHTML` reconciliation replaces the plugin-modified DOM with the original `slide.content` HTML, stripping all highlighting. Fix: added `highlightCodeBlocks()` utility that queries `pre code:not([data-highlighted])`, adds `code-wrapper` to parent `<pre>`, and calls `plugin.highlightBlock(block)` using the plugin's own bundled hljs instance via `deck.getPlugin('highlight')`. Called from a `useEffect` dependent on `ready` state (runs after the re-render), and also after `deck.sync()` for dynamic content changes. Key learning: any React state change after reveal.js plugin processing will cause `dangerouslySetInnerHTML` to re-render and wipe plugin DOM modifications — always re-apply plugin effects after state-triggered re-renders. Build passes, 50 unit tests pass, 34 e2e tests pass.
📌 Team update (2026-02-10): Three CSS rendering fixes — viewport bg/color !important override, code block font-size/styling fix, hljs post-render re-highlighting — all verified via Playwright — decided by Verbal

### 2026-02-10 — Slide area polish (compact chrome, fragment visibility, controls)
Three visual gaps closed from Playwright screenshot comparison against revealjs.com demo:
- **Compact chrome:** Top bar reduced from `px-4 py-2` to `px-3 py-1`, SlideNav from `px-6 py-4` to `px-3 py-1.5`, button text replaced with icon-only arrows (← →) and shortened labels (+ AI, + Blank). Saves ~50px vertical space, improving embedded scale factor.
- **Fragment visibility in editor:** `.reveal.embedded .slides .fragment:not(.visible) { opacity: 1; visibility: inherit; }` makes all fragment content visible in the embedded editor view while preserving fragment animations in fullscreen presentation mode.
- **Navigation control colors:** `.reveal .controls { color: var(--r-link-color, #42affa) !important; }` makes reveal.js arrow controls visible on dark themes. Progress bar also colored via `--r-link-color`.
- **Speaker notes hint:** Moved from bottom-right (overlapping controls) to top-right corner, shortened text.
Key learning: `embedded: true` in reveal.js means the deck sizes to fit its container — making the container taller (by shrinking chrome) directly increases slide scale factor. Build passes, 50 unit tests pass, 34 e2e tests pass.

### 2026-02-10 — h1 font-size cap and showcase presentation fix
The reveal.js black theme's `--r-heading1-size: 2.5em` = 105px at 42px base. Multi-word titles (3+ words) fill the entire slide viewport, wrapping to 2 lines and pushing subtitles off-screen. Fix: `font-size: min(var(--r-heading1-size, 2.5em), 2em)` caps h1 at 84px — proportional like the revealjs.com demo. Also replaced `untitled-presentation.json` with a proper 5-slide showcase: short 1-word h1 title ("TypeScript"), `class="language-typescript"` on code blocks for hljs detection, comparison table, and h2 closing slide. Key learning: `min()` CSS function is the cleanest way to cap theme custom properties without breaking the variable cascade — it respects the theme value but enforces a ceiling. Build passes, 50 unit tests pass, 34 e2e tests pass.

📌 Team update (2026-02-11): No-secrets directive consolidated — never commit tokens, API keys, or secrets into git; use env vars or placeholders only — decided by Shayne Boyer

📌 Team update (2026-02-11): Copilot coding agent setup added — decided by McManus

### 2026-02-10 — SlideManager polish (left panel)
- Replaced raw unicode arrows (↑/↓/✕) with inline SVG icon components (`ChevronUp`, `ChevronDown`, `XIcon`) — cleaner rendering across platforms, consistent stroke width.
- Added mini slide thumbnails: colored accent bar (cycling through 8 Tailwind accent colors) with slide number, plus a content-type label (`Code`, `Table`, `Image`, `Quote`, `List`, `Slide`) derived from slide HTML content.
- Selected slide state: left indigo accent bar (`w-[3px]`), `ring-1 ring-indigo-500/30` border, `bg-indigo-500/15` background — much more visually distinct than the old `bg-indigo-600/20`.
- Action buttons (move up/down, delete) now hidden by default, revealed on hover via `group`/`group-hover:opacity-100` — reduces visual clutter.
- Added `transition-all duration-150` on slide items for smooth hover/select state changes.
- Header: uppercase tracking-wider label with pill-shaped slide count badge.
- Panel open/close: replaced conditional render (`{showManager && ...}`) with CSS width/opacity transition (`transition-all duration-200 ease-in-out`, `w-64` ↔ `w-0`) in `page.tsx` — smooth slide-in animation instead of hard cut.
- Key files: `SlideManager.tsx` (component), `presentation/[slug]/page.tsx` (panel integration).
- Pattern established: inline SVG icon components for UI icons (no icon library dependency). Content-type detection via regex on `slide.content`.

📌 Team update (2026-02-20): Copilot Extension registration docs and copilot-extension.json skill definition added — docs only, no code changes — decided by Keyser

📌 Team update (2026-02-20): MCP client configuration files and setup docs added for Claude Desktop, Copilot CLI, VS Code — decided by Keyser
