# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- **2026-02-10:** Created test plan (`src/__tests__/test-plan.md`) covering all 9 user stories with 40+ test cases. Primary test focus on US-7 (CRUD API, 17 test cases) and US-8 (AI generation API, 8 test cases).
- **2026-02-10:** Created smoke test file (`src/__tests__/smoke.test.ts`) — type compilation checks pass, API test stubs are in place awaiting endpoint implementation. File compiles cleanly with `tsc --noEmit` and runs with `tsx`.
- **2026-02-10:** No test runner installed yet (per plan). File is structured to be picked up by vitest or jest when added later.
- **2026-02-10:** Security test cases documented: path traversal in slugs (SEC-1), XSS in markdown (SEC-2), large payloads (SEC-3), API key leakage (SEC-4).
- **2026-02-10:** Types (`Slide`, `Presentation`) from `src/lib/types.ts` are clean — all required/optional fields verified at runtime.

📌 Team update (2026-02-10): CRUD API (#8) and AI generation API (#7) complete — API tests (17 + 8 cases) can now be implemented against live endpoints — decided by McManus
📌 Team update (2026-02-10): SlideViewer/SlideNav components built for #2 — UI test cases can reference these components — decided by Verbal

- **2026-02-10:** Vitest installed and configured. 23 smoke tests passing: type compilation (3), CRUD file-system integration (8), slug generation (7), API route export verification (3), security slug sanitization (2).
- **2026-02-10:** `npm run build` passes cleanly (Next.js 16.1.6, Turbopack, TypeScript 0 errors). `npm run lint` passes with 0 issues.
- **2026-02-10:** vitest.config.ts uses `@` path alias matching tsconfig. Tests run in ~700ms. CRUD integration tests use temp dirs with cleanup to avoid polluting real data.
- **2026-02-10:** API route handlers (GET/POST for `/api/presentations`, GET/PUT/DELETE for `/api/presentations/[slug]`, POST for `/api/generate`) are confirmed exported and callable as functions. Full HTTP-level integration tests would require running a dev server or using Next.js test utilities.
- **2026-02-10:** Slug generation sanitizes path traversal (`../`, `..\\`) by stripping non-alphanumeric characters — SEC-1 verified at unit level.

📌 Team update (2026-02-10): Editor (#3), slide management (#5), landing page (#6) complete — auto-save via PUT, side-by-side editor layout, PresentationList client component — decided by Verbal
📌 Team update (2026-02-10): Chat sidebar (#1) and add-slide (#4) complete — PresentationChat component, SlideNav add buttons, `/presentation/new` flow — decided by Verbal
📌 Team update (2026-02-10): Never include secrets in GitHub issues, PRs, or repo content — directive by Shayne Boyer
📌 Team update (2026-02-10): Always update docs, tests, and agents.md when making changes — directive by Shayne Boyer

- **2026-02-10:** Playwright e2e test suite added (#37). Config: `playwright.config.ts` at repo root, Chromium-only for speed, `webServer` auto-starts `npm run dev` on port 3000, screenshots on failure, HTML reporter, 30s timeout.
- **2026-02-10:** Test fixture strategy: `e2e/helpers.ts` creates/deletes presentation JSON files directly in `presentations/` directory. Avoids dependency on the AI generation API for most tests. Uses `beforeAll`/`afterAll` for setup/teardown.
- **2026-02-10:** Key test patterns: (1) reveal.js readiness via `.reveal .slides section` selector; (2) theme changes verified by `#reveal-theme-link` href; (3) SlideNav buttons selected via `aria-label`; (4) chat generation tests skip when GitHub Models API unavailable; (5) editor tests verify persistence by re-reading via API after save.
- **2026-02-10:** 7 e2e test files: CRUD, navigation, themes, code highlighting, overview mode, editor, chat generation. Script: `npm run test:e2e`.
📌 Team update (2026-02-10): AI prompt now generates auto-animate, r-fit-text, rich fragments, code line highlighting, background gradients — new `autoAnimate` and `backgroundGradient` fields on Slide type — decided by McManus

- **2026-02-10:** Added console error detection tests using `page.on('pageerror')` in `e2e/console-errors.spec.ts`. Tests verify no uncaught JS errors during presentation load, slide navigation, and r-fit-text content rendering. Catches the class of bugs like the fitty/r-fit-text `clientWidth` crash that Playwright otherwise silently ignores.
📌 Team update (2026-02-10): CSS `all: revert` replaced with targeted property reverts — all 11 reveal.js themes now render correctly — decided by Verbal (based on Keyser audit)
📌 Team update (2026-02-10): SYSTEM_PROMPT V2 deployed — 8-type slide taxonomy, strict HTML rules, curated backgrounds, theme intelligence — decided by McManus
📌 Team update (2026-02-10): r-fit-text removed from AI prompt and stripped from rendering — fitty crash eliminated — decided by McManus & Verbal
📌 Team update (2026-02-10): Default theme locked to "black" with slide transition — CSS heading specificity fixed, 8-slide showcase created — decided by Verbal (directive by Shayne Boyer)
📌 Team update (2026-02-10): Three CSS rendering fixes — viewport bg/color !important override, code block font-size/styling fix, hljs post-render re-highlighting — verified via Playwright computed styles — decided by Verbal
📌 Team update (2026-02-10): Slide area polish — compact chrome (~50px saved), fragment visibility in embedded mode, nav control colors via --r-link-color — decided by Verbal
📌 Team update (2026-02-10): h1 font-size capped at min(2.5em, 2em), showcase presentation updated with TypeScript content — decided by Verbal

📌 Team update (2026-02-11): No-secrets directive consolidated — never commit tokens, API keys, or secrets into git; use env vars or placeholders only — decided by Shayne Boyer
📌 Team update (2026-02-11): Token audit completed — no real tokens found in git history, placeholder in docs/mcp-setup.md cleaned up — decided by McManus

📌 Team update (2026-02-11): Copilot coding agent setup added — decided by McManus
📌 Team update (2026-02-20): Copilot Extension registration docs and copilot-extension.json skill definition added — docs only, no code changes — decided by Keyser

📌 Team update (2026-02-20): MCP client configuration files and setup docs added for Claude Desktop, Copilot CLI, VS Code — decided by Keyser

📌 Team update (2026-02-20): SlideManager now uses inline SVG icons, hover-reveal action buttons, mini thumbnails with accent colors, CSS width transition for panel open/close — decided by Verbal
