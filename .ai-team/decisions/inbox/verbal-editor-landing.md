# Frontend: Editor, Slide Management & Landing Page Decisions

**Date:** 2026-02-10
**Author:** Verbal (Frontend Dev)
**Issues:** #3, #5, #6

## Decisions

1. **SlideEditor uses side-by-side layout** — Edit panel on left, live SlideViewer preview on right (stacks vertically on mobile via `lg:flex-row`). This gives immediate markdown feedback without a separate preview toggle.

2. **SlideManager is a sidebar panel** — Toggle-able slide list sidebar rather than thumbnails or drag-and-drop. Uses simple move-up/move-down buttons for reorder. Keeps implementation lightweight without needing a DnD library.

3. **Auto-save on every action** — Slide edits, reorder, and delete all immediately persist via `PUT /api/presentations/{slug}`. No "unsaved changes" state to manage. The API returns the updated presentation which replaces local state.

4. **Landing page uses PresentationList client component** — Fetches from `GET /api/presentations` on mount. Server-side rendering not used here since the presentation list is dynamic and we want client-side delete/refresh without full page reloads.

5. **`/presentation/new` redirects to `/`** — The "New Presentation" link points to `/presentation/new` but the slug page detects this and redirects home. The actual creation flow (AI generation, POST to API) will be handled by a future PresentationChat component.

6. **`window.confirm()` for destructive actions** — Used for both presentation delete and slide delete. Simple and effective for v1; can be upgraded to a modal component later.
