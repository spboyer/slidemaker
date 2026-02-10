# Decision: API Route Conventions

**Author:** McManus (Backend Dev)
**Date:** 2026-02-10
**Issues:** #7, #8

## Decisions Made

### 1. Lazy OpenAI Client Initialization
The OpenAI SDK constructor throws if `OPENAI_API_KEY` is not set. Since Next.js evaluates route modules during build for static page collection, the eager singleton pattern breaks `npm run build`. Changed `src/lib/openai.ts` to export a `getOpenAIClient()` factory that lazily instantiates. All server code should use `getOpenAIClient()` instead of the old `openai` export.

### 2. Slug Generation
Slugs are derived from presentation titles: lowercase, strip non-alphanumeric chars (except spaces/hyphens), collapse multiple hyphens, trim leading/trailing hyphens, cap at 40 characters. No collision detection — if two presentations share a title, the second overwrites the first.

### 3. Next.js 16 Dynamic Route Params
In Next.js 16, dynamic route handler params are `Promise<{ slug: string }>`. Must use `await params` before accessing `.slug`. This differs from Next.js 14/15.

### 4. AI Model and Response Format
The generate endpoint uses `gpt-4o` with `response_format: { type: "json_object" }` and `temperature: 0.7`. The system prompt instructs the model to return `{ slides: Slide[] }`. When `existingSlides` is provided, they're included in the user message so the model can generate complementary content.

### 5. File Storage Path
Presentations live in `presentations/` at the repo root (resolved via `path.join(process.cwd(), "presentations")`). The directory is created on demand with `fs.mkdir({ recursive: true })`.

### 6. Error Handling Strategy
All API routes catch errors and return JSON responses with appropriate HTTP status codes. OpenAI-specific errors (rate limits, auth failures, timeouts) are mapped to corresponding HTTP codes. Generic errors return 500.
