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
