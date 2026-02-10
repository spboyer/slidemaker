# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- **2026-02-10 — Issue #2 (slide viewer/nav):** Created `SlideViewer.tsx`, `SlideNav.tsx`, and `presentation/[slug]/page.tsx`. Tailwind v4 with `@import "tailwindcss"` works fine; `prose prose-invert` classes work without `@tailwindcss/typography` plugin in Tailwind v4. react-markdown v10 uses default export. Build passes cleanly with Next.js 16 + Turbopack.
- **2026-02-10 — Issues #3, #5, #6 (editor, slide mgmt, landing page):** Created `PresentationList.tsx` (landing page grid with fetch/delete), `SlideEditor.tsx` (side-by-side edit + live preview), `SlideManager.tsx` (sidebar with reorder/delete). Rewrote `page.tsx` landing to use `PresentationList`. Rewrote `presentation/[slug]/page.tsx` to fetch real data from API, integrate editor toggle, slide manager sidebar, and auto-save via PUT. Next.js 16 `useParams` returns the params object directly (no `use()` needed). Build passes cleanly.

📌 Team update (2026-02-10): CRUD API (#8) and AI generation API (#7) are complete — use `getOpenAIClient()` factory, slugs max 40 chars, `await params` for Next.js 16 dynamic routes — decided by McManus
📌 Team update (2026-02-10): PRD decomposed into 9 issues; Verbal owns #1–#6, next pick up US-3/5/6 (depend on CRUD API now available) — decided by Keyser
