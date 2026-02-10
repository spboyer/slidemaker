# Decision: Slide Component Architecture

**Author:** Verbal (Frontend Dev)
**Date:** 2026-02-10
**Issue:** #2 — View and navigate slides

## Decisions

1. **SlideViewer receives a single `Slide` + `index`** — keeps it a pure presentational component. The parent page owns all state (slides array, current index).

2. **Gradient rotation by index** — 8 gradient presets cycle based on slide index to give visual variety without requiring user configuration or AI-generated backgrounds.

3. **Keyboard navigation lives in SlideNav** — the `useEffect` keydown listener is co-located with the nav buttons for cohesion. Uses `useCallback` to avoid listener churn.

4. **Sample slides are hardcoded in the page** — the `presentation/[slug]/page.tsx` currently uses sample data. Once the API (Issue #7) is ready, this will switch to `fetch`/`useSWR` using the slug param.

5. **prose prose-invert for markdown** — Tailwind v4 includes typography utilities without a separate plugin. This gives us good default styling for markdown content rendered by react-markdown.
