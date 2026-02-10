# Scaffold Decision: Next.js 16 + Tailwind 4

**Author:** McManus (Backend Dev)
**Date:** 2026-02-10

## What happened
- `create-next-app@16.1.6` installed Next.js 16.1.6 (not 15 as originally noted in project context), React 19.2.3, and Tailwind CSS v4.
- The actual versions are newer than the original spec. This shouldn't cause issues but everyone should be aware.

## Key decisions
- **Package name** set to `slidemaker` in `package.json`.
- **React Compiler** was declined during scaffolding to keep the build simple and stable.
- **Turbopack** disabled via `--no-turbopack` flag as requested.
- **`/presentations`** directory created at repo root for JSON file storage, with `.gitkeep` to ensure it's tracked.
- **OpenAI client** (`src/lib/openai.ts`) reads `OPENAI_API_KEY` from environment. No default/fallback — will throw if missing.

## Impact on other agents
- Frontend devs: `src/app/page.tsx` has default Next.js boilerplate — ready to be replaced.
- All agents: use `@/*` import alias (maps to `src/*`).
- Shared types live in `src/lib/types.ts`.
