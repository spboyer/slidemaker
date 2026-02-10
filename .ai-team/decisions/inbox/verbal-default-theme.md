### 2026-02-10: Default theme locked in
**By:** Verbal
**What:** `black` set as the one and only default theme with `slide` transition
**Why:** Shayne directive — pick one theme, match revealjs.com demo, make it default. The `black` theme uses `#191919` background, white text, Source Sans Pro font, `#42affa` link color — exactly matching the official revealjs.com demo. Updated defaults in `RevealSlideshow.tsx`, `page.tsx`, `route.ts` SYSTEM_PROMPT, and `untitled-presentation.json`. Fixed CSS specificity issue where `.reveal .slides h1` reverts at (0,2,1) were overriding theme heading sizes from `.reveal h1` at (0,1,1). Created 8-slide showcase presentation.
