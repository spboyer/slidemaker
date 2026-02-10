# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- **2026-02-10 — Issue #2 (slide viewer/nav):** Created `SlideViewer.tsx`, `SlideNav.tsx`, and `presentation/[slug]/page.tsx`. Tailwind v4 with `@import "tailwindcss"` works fine; `prose prose-invert` classes work without `@tailwindcss/typography` plugin in Tailwind v4. react-markdown v10 uses default export. Build passes cleanly with Next.js 16 + Turbopack.
