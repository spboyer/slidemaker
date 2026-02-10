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
