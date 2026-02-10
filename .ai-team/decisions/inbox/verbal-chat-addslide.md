### Chat Sidebar & Add Slide Integration
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issues:** #1, #4

- `PresentationChat.tsx` is a stateless chat component: receives `existingSlides` and `onSlidesGenerated` callback. Parent page owns all presentation state and persistence logic.
- `/presentation/new` route is handled by the same `[slug]/page.tsx` — when `slug === "new"`, chat opens by default; on first AI generation, the page POSTs to `/api/presentations` and uses `router.replace()` to switch to the real slug URL.
- `SlideNav` buttons (`onAddSlide`, `onAddBlank`) are optional props — backward compatible; existing usages without them render the original nav without buttons.
- "AI Slide" button calls `POST /api/generate` with `{ topic: presentationTitle, numSlides: 1, existingSlides }` and appends the result.
- "Blank" button appends `{ title: "New Slide", content: "" }` and opens editor mode.
- All mutations (add slide, chat-generated, blank) auto-save via PUT to the existing presentation.
