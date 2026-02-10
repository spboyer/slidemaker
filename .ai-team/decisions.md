# Decisions

> Shared decision log. All agents read this before starting work. Scribe merges new entries from the inbox.

---

### PRD Decomposition into GitHub Issues
**Author:** Keyser (Lead) · **Date:** 2025-07-22 · **Status:** Accepted

9 user stories decomposed into issues #1–#9. McManus owns APIs (#7, #8), Verbal owns frontend (#1–#6), Fenster owns testing (#9). Dependency graph: US-7 (#8) and US-8 (#7) are foundational with no deps; most frontend stories depend on them. US-2 (#2) can start immediately.

**Execution order:** McManus US-7+US-8 and Verbal US-2 in parallel → Verbal US-3/5/6 after CRUD API → Verbal US-1/4 after both APIs → Fenster US-9 last.

---

### Next.js 16 + Tailwind 4 Scaffold
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10

- Scaffolded Next.js 16.1.6, React 19.2.3, Tailwind CSS v4, TypeScript.
- React Compiler declined; Turbopack disabled.
- `/presentations` directory at repo root for JSON file storage.
- OpenAI client in `src/lib/openai.ts` reads `OPENAI_API_KEY` from env.
- Import alias `@/*` maps to `src/*`. Shared types in `src/lib/types.ts`.

---

### Lazy OpenAI Client Initialization
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

OpenAI SDK constructor throws if `OPENAI_API_KEY` is not set, breaking `npm run build`. Changed to lazy `getOpenAIClient()` factory. All server code must use `getOpenAIClient()` instead of the old `openai` export.

---

### Slug Generation Convention
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Slugs: lowercase, strip non-alphanumeric (except spaces/hyphens), collapse multiple hyphens, trim, cap at 40 chars. No collision detection — duplicate titles overwrite.

---

### Next.js 16 Dynamic Route Params
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Dynamic route handler params are `Promise<{ slug: string }>`. Must `await params` before accessing `.slug`.

---

### AI Model and Response Format
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Generate endpoint uses `gpt-4o`, `response_format: { type: "json_object" }`, `temperature: 0.7`. System prompt returns `{ slides: Slide[] }`. Existing slides included in user message for complementary generation.

---

### File Storage Path
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

Presentations stored in `presentations/` at repo root (`path.join(process.cwd(), "presentations")`). Directory created on demand with `fs.mkdir({ recursive: true })`.

---

### Error Handling Strategy
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issues:** #7, #8

All API routes return JSON errors with appropriate HTTP status. OpenAI 429 → 429, 401 → 401, timeout → 504, other → 500.

---

### Slide Component Architecture
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10 · **Issue:** #2

- SlideViewer receives a single `Slide` + `index` — pure presentational, parent owns state.
- Gradient rotation: 8 presets cycle by slide index.
- Keyboard navigation lives in SlideNav via `useEffect` keydown listener with `useCallback`.
- Sample slides hardcoded; will switch to API fetch when #7 is ready.
- `prose prose-invert` for markdown — Tailwind v4 includes typography utilities natively.

---

### Test Plan & Infrastructure
**Author:** Fenster (Tester) · **Date:** 2026-02-10

- Test plan covers all 9 user stories with 40+ test cases in `src/__tests__/test-plan.md`.
- Naming: `TC-{US}.{seq}`. Priority: P0 (build & CRUD basics), P1 (core API), P2 (UI & security).
- No test runner yet — smoke test uses plain `assert`, structured for vitest/jest migration.
- API tests (US-7: 17 cases, US-8: 8 cases) are primary validation target.
- Security cases: path traversal (SEC-1), XSS (SEC-2), large payloads (SEC-3), API key leakage (SEC-4). McManus should ensure slug sanitization.
