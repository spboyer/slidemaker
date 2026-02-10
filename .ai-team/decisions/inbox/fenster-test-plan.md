# Decision: Test Plan & Infrastructure

**Author:** Fenster (Tester)
**Date:** 2026-02-10
**Status:** Proposed

## Decisions Made

### D-TEST-1: Test plan created ahead of implementation
- Test plan covers all 9 user stories with 40+ test cases in `src/__tests__/test-plan.md`.
- Test cases use `TC-{US}.{seq}` naming convention.
- Priority order: P0 (build & CRUD basics), P1 (core API), P2 (UI & security).

### D-TEST-2: No test runner installed yet
- Smoke test file (`src/__tests__/smoke.test.ts`) uses plain `assert` functions and `console.log`.
- Structured for easy migration to vitest or jest when the team is ready.
- Can be run now with `npx tsx src/__tests__/smoke.test.ts`.

### D-TEST-3: API tests are the primary validation target
- US-7 (CRUD) has 17 test cases; US-8 (AI generation) has 8 test cases.
- These are testable without a browser and should be the first to be fully implemented.

### D-TEST-4: Security test cases documented
- Path traversal, XSS, large payloads, and API key leakage are tracked as SEC-1 through SEC-4.
- McManus should ensure slug sanitization in the API routes.

## Open Questions
- **Test runner choice:** vitest vs jest — vitest is recommended for Next.js projects but needs team agreement.
- **Test data isolation:** Should API tests use a temp `/presentations` directory, or mock the filesystem?
- **AI API tests:** Should we mock OpenAI or use a test key with low limits?
