# SlideMaker — Copilot Instructions

## Project Overview

SlideMaker is an AI-powered slide presentation builder. Users describe what they want, and the app generates conference-quality reveal.js slide decks using AI. It's a Next.js web application with OpenAI-driven slide generation, persistent storage, and a Copilot Extension + MCP server for IDE integration.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with `output: "standalone"` for Docker builds
- **UI:** React 19, Tailwind CSS 4, reveal.js 5
- **Language:** TypeScript 5 (strict)
- **AI:** OpenAI SDK against GitHub Models API (`https://models.github.ai/inference`)
- **Auth:** Auth.js v5 (`next-auth@beta`) with GitHub OAuth; bearer token validation for API routes
- **Storage:** Abstracted via `getStorage()` in `src/lib/storage.ts` — `LocalFileStorage` (local dev, writes to `presentations/`) or `BlobStorage` (production, Azure Blob Storage)
- **Testing:** Vitest (unit), Playwright (e2e)
- **Linting:** ESLint 9 with `eslint-config-next`
- **Infrastructure:** Azure (Bicep templates in `infra/`)

## Key File Locations

| Area | Path |
|---|---|
| API routes | `src/app/api/` |
| React components | `src/app/components/` |
| Library/utilities | `src/lib/` |
| TypeScript types | `src/lib/types.ts` |
| OpenAI client | `src/lib/openai.ts` |
| Storage abstraction | `src/lib/storage.ts` |
| Auth utilities | `src/lib/auth-utils.ts` |
| Middleware | `src/middleware.ts` |
| Unit tests | `src/__tests__/` |
| E2E tests | `e2e/` |
| Presentations (local) | `presentations/` |
| MCP server | `packages/mcp-server/` |
| Copilot Extension | `src/app/api/copilot/skillset/route.ts` |
| Infrastructure (Bicep) | `infra/` |
| Squad AI team config | `.github/agents/squad.agent.md` |

## Commands

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm run dev` | Local dev server |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e tests |
| `npm run lint` | ESLint |

## Architecture Notes

- **API routes** validate input and return meaningful error responses with proper HTTP status codes. Never trust untyped input at API boundaries.
- **OpenAI client** uses a lazy `getOpenAIClient()` factory (not an eager singleton) because the constructor throws if credentials are missing, which would break `npm run build` during static page collection.
- **Token resolution** checks `GITHUB_TOKEN` env var first, then falls back to `execSync("gh auth token")` for local dev.
- **Storage** is selected at runtime via `getStorage()`: if `AZURE_STORAGE_CONNECTION_STRING` or `AZURE_STORAGE_ACCOUNT_NAME` is set, it uses Azure Blob Storage; otherwise it uses local file storage in `presentations/`.
- **Auth middleware** validates GitHub bearer tokens against the GitHub API with a 5-minute TTL cache and 60 req/min rate limiting per user.
- **Slugs** are generated from presentation titles: lowercase, strip special chars, replace spaces with hyphens, max 40 chars. Path traversal prevention is critical.
- **Dynamic route params** in Next.js 16 are `Promise<{ slug: string }>` — you must `await params`.

## AI Generation

- The AI generate endpoint (`src/app/api/generate/route.ts`) uses a detailed system prompt that produces conference-quality reveal.js slides.
- Slide types include: Cover, Section Divider, Content, Code, Comparison, Quote, Impact, Closing.
- The prompt enforces strict HTML quality rules: max 5 bullets, no nested lists, no `r-fit-text` (causes fitty crashes), code blocks must use `data-trim data-noescape`.
- Model: `openai/gpt-4o` via GitHub Models API.
- Error mapping: OpenAI 429 → 429, 401 → 401, timeout → 504, other → 500.

## Testing Conventions

- Unit tests in `src/__tests__/` use Vitest. CRUD integration tests use temp directories.
- E2E tests in `e2e/` use Playwright. API-dependent tests use a skip pattern.
- Test tokens are obviously-fake values only (`ghp_abc123`, `ghp_valid_token`). Never use real tokens.
- Console error detection is enabled in Playwright via `page.on('pageerror')`.

## Squad AI Team

The file `.github/agents/squad.agent.md` defines a Squad AI team (Keyser, McManus, Verbal, Fenster) that manages this project in interactive Copilot sessions. You don't need to follow its orchestration rules — those are for interactive sessions, not coding agent runs. But be aware of team decisions in `.ai-team/decisions.md` as they represent project conventions.

## Important Rules

- **No secrets in code.** Never commit tokens, API keys, or credentials. Use env vars or placeholders.
- **No `r-fit-text`** in reveal.js slides — it causes fitty runtime crashes.
- **Never use `font-size: revert`** inside `.reveal` — it breaks reveal.js theme rendering.
- **Default theme is "black"** with slide transitions.
