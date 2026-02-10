### Phase 2 Test Strategy
**Author:** Fenster (Tester) · **Date:** 2026-02-10 · **Issue:** #49 · **Status:** Proposed

**Context:** Phase 2 introduces storage abstraction (#40), GitHub OAuth (#41), CORS middleware (#44), Copilot Extension, and MCP Server. Test scaffolding is needed ahead of implementation.

**Decisions:**

1. **Test plan expanded with 5 new sections (TC-10 through TC-14):**
   - TC-10.x (5 cases): Storage abstraction — LocalFileStorage CRUD, factory pattern for local vs Azure Blob
   - TC-11.x (6 cases): Auth — 401 enforcement, session access, dev bypass, bearer tokens, rate limiting
   - TC-12.x (3 cases): CORS — preflight headers, response headers, dev mode wildcard origin
   - TC-13.x (3 cases): Copilot Extension — skillset invocation, response format, error handling
   - TC-14.x (4 cases): MCP Server — all four CRUD tools

2. **Scaffold files created:**
   - `src/__tests__/storage.test.ts` — Vitest `test.todo()` stubs for TC-10.x
   - `src/__tests__/auth.test.ts` — Vitest `test.todo()` stubs for TC-11.x
   - `e2e/cors.spec.ts` — Playwright `test.fixme()` stubs for TC-12.x (e2e because CORS requires real HTTP)

3. **Priority classification:**
   - P1: Storage (TC-10.x), core auth (TC-11.1–11.3), CORS (TC-12.x) — foundational infra
   - P2: Bearer token auth (TC-11.4–11.6), Copilot Extension (TC-13.x), MCP Server (TC-14.x) — secondary features

4. **Pattern conventions maintained:**
   - Vitest for unit/integration tests in `src/__tests__/`
   - Playwright for e2e tests in `e2e/`
   - TC-{US}.{seq} naming scheme
   - Imports from `@/lib/*` path alias
   - `test.todo()` for vitest stubs, `test.fixme()` for Playwright stubs

5. **No existing tests broken:** All 50 existing unit tests pass alongside the 11 new todo stubs.

**Impact:** McManus can implement against these test contracts. When each feature merges, Fenster fills in the stubs with real assertions.
