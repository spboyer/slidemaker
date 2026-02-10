# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
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
