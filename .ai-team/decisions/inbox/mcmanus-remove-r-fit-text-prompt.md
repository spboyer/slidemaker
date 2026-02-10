### 2026-02-10: Remove r-fit-text from AI generation prompt
**By:** McManus
**What:** Removed r-fit-text instructions from SYSTEM_PROMPT — AI no longer generates slides with the r-fit-text class
**Why:** fitty library used by reveal.js for r-fit-text causes uncaught TypeError crashes in React due to stale DOM references in rAF loops
