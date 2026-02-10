### RevealSlideshow CSS Loading Strategy
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #15

reveal.js CSS (base `reveal.css` and theme files) cannot be imported via JS `import` in Next.js dynamic imports — they must be loaded as `<link>` tags. The `RevealSlideshow` component injects `<link>` elements into `<head>` pointing to jsDelivr CDN (`https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/...`). Theme switching swaps the `href` on the existing link. Both links are cleaned up on unmount. If the team wants to self-host these CSS files later, update the `loadRevealBaseCSS()` and `loadThemeCSS()` functions in `RevealSlideshow.tsx`.

reveal.js 5.x ships no TypeScript declarations — `src/types/reveal.d.ts` provides ambient module declarations. Keep this in sync if new reveal.js APIs are used.
