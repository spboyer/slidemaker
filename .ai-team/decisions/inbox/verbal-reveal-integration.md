### RevealSlideshow Integration & Keyboard Coordination
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #16, #17

- `SlideViewer` is no longer used in the main presentation view — replaced by `RevealSlideshow`. `SlideViewer` remains in `SlideEditor` for the live preview panel.
- Keyboard coordination: reveal.js uses `keyboardCondition: "focused"` (set in RevealSlideshow). SlideNav's global keydown listener skips events when the reveal container is focused. This prevents double-navigation.
- ThemePicker uses native `<details>` element for the dropdown — no external dropdown library needed.
- Theme changes are persisted via `PUT /api/presentations/{slug}` with `{ slides, theme }` body. The API must accept and store the `theme` field.
- Fullscreen uses the browser Fullscreen API on the `.reveal` container element.
