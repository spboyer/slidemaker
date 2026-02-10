### Tailwind v4 / reveal.js CSS Isolation Strategy
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #32, #33, #34

- Tailwind v4 base styles (`@import "tailwindcss"`) aggressively reset margins, fonts, colors, and element styles that reveal.js themes depend on. The fix uses `all: revert` on all content elements scoped to `.reveal .slides` in `globals.css`. This restores browser defaults so reveal.js theme CSS takes precedence. Works for all 11 themes.
- If new HTML elements are used in slide content (e.g., `<details>`, `<summary>`), they must be added to the `all: revert` selector list.

---

### reveal.js Plugin Loading Convention
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #33

- Plugins (Highlight, Notes, Zoom) are dynamically imported alongside `reveal.js` in the same `useEffect` init function. They are passed to the `plugins` array in the Reveal constructor options.
- highlight.js Monokai CSS is loaded via CDN `<link>` tag (same pattern as theme/base CSS). All injected `<link>` tags are cleaned up on unmount.
- `src/types/reveal.d.ts` must declare ambient modules for any new plugin import paths.

---

### Overview Mode Fix
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #34

- reveal.js overview mode click-to-navigate is built-in and works once Tailwind resets are reverted (via the CSS fix above). The `overviewhidden` event is listened to in `RevealSlideshow.tsx` to sync `currentSlideIndex` when leaving overview mode. No additional code is needed for click navigation.
