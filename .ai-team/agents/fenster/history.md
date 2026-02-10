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
