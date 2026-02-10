# Playwright E2E Test Setup

**Author:** Fenster (Tester) · **Date:** 2026-02-10 · **Issue:** #37

## Decisions

1. **Chromium-only**: Playwright configured with Chromium only (not Firefox/WebKit) for CI speed. Can expand later if cross-browser coverage is needed.

2. **File-based fixtures**: E2E test fixtures write JSON files directly to `presentations/` directory rather than using the API or AI generation. This makes tests independent of the GitHub Models API and fast to set up/tear down.

3. **Chat generation tests skip gracefully**: Tests in `chat-generation.spec.ts` probe the `/api/generate` endpoint before running. If the API returns auth errors (401/403), all tests in the suite are skipped via `test.skip()`. This prevents CI failures when `GITHUB_TOKEN` is not available.

4. **webServer auto-start**: `playwright.config.ts` uses `webServer.command: "npm run dev"` so `npm run test:e2e` is self-contained — no manual dev server startup needed. `reuseExistingServer: true` in local dev to avoid port conflicts.

5. **Test isolation**: Each test file uses a unique presentation slug (`e2e-{feature}-test`) and cleans up in `afterAll` / `afterEach`. Tests do not interfere with each other or with real user data.

6. **reveal.js readiness**: Tests wait for `.reveal .slides section` to appear before interacting with the slideshow. The `waitForReveal()` helper in `e2e/helpers.ts` handles this with a 15s timeout.

## Impact

All agents should know:
- `npm run test:e2e` runs the full Playwright suite
- `e2e/helpers.ts` is the shared fixture module — use it for new e2e tests
- Tests that need the AI API should follow the skip pattern in `chat-generation.spec.ts`
- Playwright artifacts (`test-results/`, `playwright-report/`, `blob-report/`) are gitignored
