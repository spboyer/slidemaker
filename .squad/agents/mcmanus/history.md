# Project Context

- **Owner:** Shayne Boyer
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2026-02-10 — Initial Next.js Scaffold
- Scaffolded Next.js 16.1.6 with TypeScript, Tailwind CSS v4, ESLint, App Router, and `src/` directory structure.
- Key file paths:
  - `src/app/page.tsx` — main page
  - `src/app/layout.tsx` — root layout
  - `src/lib/types.ts` — `Slide` and `Presentation` interfaces
  - `src/lib/openai.ts` — OpenAI client singleton
  - `presentations/` — JSON storage directory (with `.gitkeep`)
  - `.env.local.example` — environment variable template
- Installed packages: `openai` (^6.19.0), `react-markdown` (^10.1.0)
- Actual stack versions: Next.js 16.1.6, React 19.2.3, TypeScript 5.x, Tailwind CSS 4.x
- Import alias `@/*` configured in `tsconfig.json`
- `.gitignore` covers `.env*` files via wildcard pattern
- Build verified: `npm run build` passes cleanly

### 2026-02-10 — API Routes for CRUD and AI Generation (Issues #7 & #8)
- Created three API route files:
  - `src/app/api/presentations/route.ts` — GET (list all) and POST (create new) presentations
  - `src/app/api/presentations/[slug]/route.ts` — GET, PUT, DELETE single presentation by slug
  - `src/app/api/generate/route.ts` — POST AI slide generation via OpenAI
- Presentations stored as JSON files in `presentations/{slug}.json` at repo root
- Slug generation: lowercase, strip special chars, replace spaces with hyphens, max 40 chars
- Next.js 16 dynamic route params are `Promise<{ slug: string }>` — must `await params`
- Changed `src/lib/openai.ts` from eager singleton to lazy `getOpenAIClient()` factory because the OpenAI constructor throws if `OPENAI_API_KEY` is not set, which breaks `npm run build` during static page collection
- The deprecated `openai` export kept as `undefined` for backward compat; new code should use `getOpenAIClient()`
- AI generate endpoint uses `gpt-4o` with `response_format: { type: "json_object" }` for structured output
- Error handling: OpenAI 429 → 429, 401 → 401, timeout → 504, other → 500
- Build verified: `npm run build` passes cleanly with all routes registered

📌 Team update (2026-02-10): Test plan created with 40+ cases; security cases SEC-1–SEC-4 documented — ensure slug sanitization for path traversal — decided by Fenster
📌 Team update (2026-02-10): SlideViewer/SlideNav components built for #2; will switch from sample data to API fetch when #7 is ready — decided by Verbal
📌 Team update (2026-02-10): Vitest installed with 23 passing tests — `npm run test` available, CRUD integration tests use temp dirs — decided by Fenster

### 2026-02-10 — Switched to GitHub Models API (Issue #12)
- `src/lib/openai.ts` now uses `resolveGitHubToken()` which checks `GITHUB_TOKEN` env var first, then falls back to `execSync("gh auth token")` for local dev auto-detection.
- OpenAI SDK kept as HTTP client dependency, but `baseURL` changed to `https://models.github.ai/inference`.
- Model name convention for GitHub Models: prefix with provider, e.g. `openai/gpt-4o` instead of `gpt-4o`.
- `getOpenAIClient()` now throws a descriptive error if no token is found — callers should catch this.
- `src/app/api/generate/route.ts` wraps `getOpenAIClient()` in a try/catch, returning 401 with a friendly message when auth is missing.
- `.env.local.example` updated — `OPENAI_API_KEY` replaced with `GITHUB_TOKEN` instructions (commented out by default since local dev auto-detects).
- Build and all 23 tests pass after changes.
- Branch: `squad/12-github-models-api`
📌 Team update (2026-02-10): Never include secrets in GitHub issues, PRs, or repo content — directive by Shayne Boyer
📌 Team update (2026-02-10): Always update docs, tests, and agents.md when making changes — directive by Shayne Boyer

### 2026-02-10 — Upgraded AI Prompt for High-Fidelity reveal.js Slides (Issue #36)
- Rewrote SYSTEM_PROMPT in `src/app/api/generate/route.ts` from a basic formatter to a comprehensive reveal.js designer prompt.
- Prompt engineering techniques used:
  - **Few-shot examples**: Included JSON examples of auto-animate slide pairs so the model sees concrete output format.
  - **Feature enumeration with HTML snippets**: Listed each reveal.js feature (r-fit-text, fragments, code blocks, tables, blockquotes) with exact HTML syntax so the model copies the patterns.
  - **Critical Variety Rules**: Explicit negative constraints ("Do NOT make every slide a bullet list") plus minimum diversity thresholds ("at least 2 different fragment types").
  - **Per-style guidance**: Expanded STYLE_INSTRUCTIONS from 1-line hints to detailed multi-line directives with specific feature/transition/background recommendations per style.
- Key reveal.js features added to prompt: auto-animate (`data-auto-animate`), `r-fit-text`, 10 fragment types (fade-in, fade-up, grow, shrink, fade-in-then-out, fade-in-then-semi-out, highlight-red/blue/green), code blocks with `data-line-numbers` pipe syntax, `backgroundGradient` for CSS gradients, styled tables with fragment rows, blockquotes with `<footer>` attribution.
- Extended `Slide` type with optional `autoAnimate: boolean` and `backgroundGradient: string` fields.
- Updated `RevealSlideshow.tsx` `sectionAttrs()` to render `data-auto-animate` and `data-background-gradient` attributes.
- All changes backward compatible — new fields are optional, existing presentations render unchanged.
- Branch: `squad/36-ai-prompt-upgrade`, PR #39.
📌 Team update (2026-02-10): Playwright e2e tests available via `npm run test:e2e` — use `e2e/helpers.ts` for fixtures, follow skip pattern for API-dependent tests — decided by Fenster

### 2026-02-10 — Removed r-fit-text from AI Generation Prompt
- Removed the `r-fit-text` section (was section 2) from `SYSTEM_PROMPT` in `src/app/api/generate/route.ts` — the AI will no longer instruct slides to use `class="r-fit-text"`.
- Removed the Critical Variety Rule that required `r-fit-text` on the title/cover slide.
- Updated the example slide in the prompt to use plain `<h2>` instead of `<h2 class="r-fit-text">`.
- Renumbered remaining prompt sections: Rich Fragments→2, Code Blocks→3, Backgrounds→4, Tables→5, Blockquotes→6.
- Stripped `r-fit-text` from `presentations/untitled-presentation.json` (the only existing presentation file containing it).
- **Reason:** reveal.js's fitty library (used by `r-fit-text`) runs a `requestAnimationFrame` loop that crashes with `TypeError: Cannot read properties of null (reading 'clientWidth')` when React reconciles and removes DOM nodes. Verbal is also stripping `r-fit-text` on the rendering side.
- Build and all 50 unit tests pass.

### 2026-02-10 — SYSTEM_PROMPT V2: Conference-Quality Slide Generation
- Rewrote SYSTEM_PROMPT in `src/app/api/generate/route.ts` for dramatically better slide output matching revealjs.com demo quality.
- **Slide Type Taxonomy**: Defined 8 required slide types (Cover, Section Divider, Content, Code, Comparison, Quote, Impact, Closing) with specific HTML structure rules for each.
- **Typography Rules**: h1 only on cover slide, h2 for all other headings, 3-7 word titles, 3-4 lines max per slide.
- **HTML Quality Rules (STRICT)**: Max 5 bullets per slide, no nested lists, no r-fit-text, no nested sections, code blocks must use data-trim data-noescape, fragments on ~60% of slides not 100%.
- **Background Design**: Cover must have dark gradient, section dividers must have contrasting backgrounds, 40%+ slides with custom backgrounds, defined complementary color palettes.
- **Speaker Notes Quality**: Timing cues, engagement prompts, transition hints — not just restating slide content.
- **Theme Intelligence**: Technical→night/black/moon, business→white/simple/serif, creative→league/sky/solarized. NEVER suggest "beige".
- **Example Deck Fragment**: 3-slide example (cover, impact auto-animate start, content auto-animate end) replacing the old 2-slide example.
- **STYLE_INSTRUCTIONS upgraded**: Each style now includes specific feature guidance (e.g. technical requires 2+ code slides with data-line-numbers).
- Constraints preserved: no r-fit-text, no vertical slides, JSON format unchanged.
- Build passes, all 50 unit tests pass.
📌 Team update (2026-02-10): CSS `all: revert` replaced with targeted property reverts — all 11 reveal.js themes now render correctly — decided by Verbal (based on Keyser audit)
📌 Team update (2026-02-10): Console error detection e2e tests added — `page.on('pageerror')` catches uncaught JS errors during Playwright runs — decided by Fenster
📌 Team update (2026-02-10): r-fit-text stripped from rendering in RevealSlideshow — fitty crash eliminated — decided by Verbal
📌 Team update (2026-02-10): Default theme locked to "black" with slide transition — SYSTEM_PROMPT default updated in route.ts — decided by Verbal (directive by Shayne Boyer)
📌 Team update (2026-02-10): Three CSS rendering fixes — viewport bg/color !important override, code block font-size/styling fix, hljs post-render re-highlighting — never use font-size:revert inside .reveal — decided by Verbal
📌 Team update (2026-02-10): Slide area polish — compact chrome (~50px saved), fragment visibility in embedded mode, nav control colors via --r-link-color — decided by Verbal
📌 Team update (2026-02-10): h1 font-size capped at min(2.5em, 2em), showcase presentation updated with TypeScript content — decided by Verbal

### 2026-02-10 — Token Audit: No Leaked Credentials Found
- Exhaustive search of all git history (17 branches, full diff output) for `ghp_`, `gho_`, `ghs_`, `github_pat_` patterns found **zero real tokens** committed.
- The previously-reported `gho_` leak was in a GitHub issue body (#12), not in repo source code.
- Replaced `ghp_your_token_here` placeholder in `docs/mcp-setup.md` with `$(gh auth token)` to avoid false positives from secret scanners.
- Confirmed `.gitignore` already covers `.env*` files — no additions needed.
- Confirmed test fixtures use obviously-fake tokens only (`ghp_abc123`, `ghp_valid_token`, etc.).
- `resolveGitHubToken()` in `src/lib/openai.ts` has never contained a hardcoded token value.

📌 Team update (2026-02-11): No-secrets directive consolidated — never commit tokens, API keys, or secrets into git; use env vars or placeholders only — decided by Shayne Boyer
📌 Team update (2026-02-11): Copilot Extension registration docs and copilot-extension.json added — docs only, no code changes — decided by Keyser
📌 Team update (2026-02-11): MCP client config files and setup docs added for Claude Desktop, Copilot CLI, VS Code — decided by Keyser

### 2026-02-11 — Copilot Coding Agent Setup
- Created `.github/copilot-setup-steps.yml` — the GitHub-required workflow that runs when the Copilot coding agent picks up an issue. Uses Node.js 22, `npm ci`, and `npm run build`.
- Created `.github/copilot-instructions.md` — project-level instructions for all Copilot interactions (Chat + coding agent). Covers tech stack, file locations, build/test commands, architecture patterns, AI generation details, auth, storage, and project rules.
- Chose Node.js 22 to match the project's Next.js 16 + React 19 requirements.
- Included `npm run build` in setup steps so the agent sees the compiled output and understands the project structure before making changes.
- Confirmed `.github/workflows/squad-issue-assign.yml` already references the Copilot coding agent at line 78 — no changes needed there.
- `copilot-instructions.md` mentions the Squad AI team config but explicitly notes the agent doesn't need to follow orchestration rules.

📌 Team update (2026-02-11): Copilot coding agent setup added — decided by McManus

📌 Team update (2026-02-20): Copilot Extension registration docs and copilot-extension.json skill definition added — docs only, no code changes — decided by Keyser

📌 Team update (2026-02-20): MCP client configuration files and setup docs added for Claude Desktop, Copilot CLI, VS Code — decided by Keyser

### 2026-02-22 — README.md Updated to Reflect Current Capabilities
- Updated Features list: added PPTX Export, Slide Search (Cmd+K), 6 Slide Layouts, Auto-Animate, AI Chat Theme Commands, slide type auto-detection, background customization, fragment toggle.
- Updated Tech Stack table: added `pptxgenjs` as Export layer, clarified AI model as `openai/gpt-4o`.
- Updated Keyboard Navigation table: added `Cmd+K` / `Ctrl+K` for search.
- Updated Edit Slides section: documented layout picker, background (color/gradient/image), fragment toggle, auto-animate checkbox.
- Replaced "Export to PDF" section with unified "Export" section covering both PPTX download button and PDF print method. Added "Search" section.
- Updated Project Structure: added `SlideSearch.tsx` and `pptx-export.ts` entries.
- Sections NOT touched (confirmed accurate): Architecture, Project Structure layout, API Reference, MCP Server, Copilot Extension, Environment Variables, Deployment, Authentication, Prerequisites, Getting Started.
