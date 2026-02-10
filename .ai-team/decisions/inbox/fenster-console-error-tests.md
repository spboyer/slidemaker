### 2026-02-10: Added console error detection Playwright tests
**By:** Fenster
**What:** New `e2e/console-errors.spec.ts` catches uncaught browser JS errors during presentation load, navigation, and r-fit-text content rendering
**Why:** The fitty crash was an uncaught rAF error that Playwright tests silently ignored — we need explicit error detection via `page.on('pageerror')` to catch this class of bugs
