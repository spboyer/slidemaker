# 2026-02-10 — CSS Visual Fixes

**Requested by:** Shayne Boyer
**Agent:** Verbal (Frontend Dev)

## Changes

### 1. `.reveal-viewport` background/color override
Tailwind's `--background: #fff` was cascading into reveal.js container via `body`, making slides have white background instead of theme's dark `#191919`. Fixed with `!important` rules using reveal.js CSS custom properties on `.reveal-viewport` and `.reveal`.
- Commit: ca251d0

### 2. Code block rendering
`font-size: revert` on `pre`/`code` was reverting to 42px (inherited from `.reveal` base). Removed revert, added explicit dark background, padding, border-radius for code blocks. Removed broken fragment opacity revert that was making all fragments always visible.
- Commit: 5793747

### 3. highlight.js activation
React's `dangerouslySetInnerHTML` was undoing hljs processing after re-render. Added `highlightCodeBlocks()` utility that re-applies highlighting after ready state changes and `deck.sync()`.
- Commit: 5793747

## Verification

- All fixes verified via Playwright computed style inspection and screenshots
- Build ✅
- 50 unit tests ✅
- 34 e2e tests ✅
