# SlideMaker — Test Plan

> **Author:** Fenster (Tester)
> **Version:** 1.0
> **Date:** 2026-02-10
> **Status:** Draft — tests are defined ahead of implementation

---

## 1. Test Strategy Overview

### Scope
This test plan covers all 9 user stories from PRD.md. The primary focus is on **API endpoint testing** (US-7, US-8) since those are testable without a browser. UI stories (US-1 through US-6) are documented with test cases but will require component/E2E testing infrastructure later.

### Approach
- **Unit tests:** Type compilation, utility functions, data model validation
- **API integration tests:** HTTP endpoint behavior, status codes, request/response shapes
- **Smoke tests:** Build succeeds, dev server starts, key pages render
- **Edge case tests:** Missing fields, invalid data, empty states, non-existent resources

### Test Runner
Not yet installed. Test cases are defined structurally. We will add **vitest** (or jest) in a future sprint.

### Conventions
- Test IDs follow `TC-{US}.{sequence}` format (e.g., TC-7.1)
- Each test documents: ID, description, expected behavior, edge cases

---

## 2. Test Cases by User Story

### US-1: Generate a presentation via AI

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-1.1 | User submits a valid topic | AI generates slides, presentation saved to `/presentations/{slug}.json`, chat shows confirmation | Very long topic string (>500 chars) |
| TC-1.2 | Generated slug is URL-friendly | Slug derived from title contains only lowercase alphanumeric and hyphens | Title with special chars, unicode, leading/trailing spaces |
| TC-1.3 | Presentation auto-saved after generation | File exists on disk after generation completes | Disk write failure, `/presentations` dir missing |
| TC-1.4 | Chat shows AI response | Chat sidebar displays confirmation of what was generated | Empty response from AI, network timeout |

### US-2: View and navigate slides

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-2.1 | Render current slide with markdown | Slide viewer shows formatted markdown content | Malformed markdown, very long content, empty content |
| TC-2.2 | Navigate with Prev/Next buttons | Clicking Next advances slide index, Prev goes back | At first slide (Prev disabled), at last slide (Next disabled) |
| TC-2.3 | Slide counter shows position | Display shows "N / M" format | Single slide "1 / 1", zero slides |
| TC-2.4 | Arrow key navigation | Left/Right arrow keys navigate slides | Rapid key presses, focus not on viewer |
| TC-2.5 | Zero slides state | Shows "No slides to display" message | Presentation exists but slides array is empty |

### US-3: Edit slide content

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-3.1 | Enter edit mode | Clicking Edit shows text inputs for title and textarea for content | Already in edit mode |
| TC-3.2 | Live preview | Changes in edit fields reflected in viewer in real-time | Very rapid typing, pasting large content |
| TC-3.3 | Save persists changes | Save action calls PUT API and updates JSON file | Network error during save, concurrent edits |
| TC-3.4 | Cancel discards changes | Cancel restores original content, exits edit mode | Cancel after multiple edits |

### US-4: Add slides to existing presentation

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-4.1 | Add AI-generated slide | New slide appended, viewer navigates to it | AI returns empty slide, API timeout |
| TC-4.2 | Add blank slide | Empty slide appended for manual editing | Adding to empty presentation |
| TC-4.3 | Auto-save after add | Changes persisted to JSON file automatically | Rapid successive adds |

### US-5: Delete and reorder slides

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-5.1 | Delete slide with confirmation | Slide removed after user confirms | Delete only slide → zero state, cancel confirmation |
| TC-5.2 | Reorder slides | Drag/move changes order in slides array, persisted via API | Move first to last, move last to first, single slide |
| TC-5.3 | Delete last slide shows empty state | "No slides to display" shown when all slides deleted | Re-adding after deletion |

### US-6: List and manage presentations

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| TC-6.1 | Landing page lists all presentations | Grid/list shows title, date, slide count for each | Zero presentations, many presentations (100+) |
| TC-6.2 | Click navigates to presentation | Clicking entry routes to `/presentation/{slug}` | Slug with special characters |
| TC-6.3 | New Presentation button | Starts creation flow | Multiple rapid clicks |
| TC-6.4 | Delete presentation with confirmation | Presentation removed from list and disk | Delete last presentation, cancel confirmation |

### US-7: Presentation CRUD API ⭐ (Primary test focus)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-7.1** | `GET /api/presentations` — empty list | Returns `200` with empty array `[]` | `/presentations` dir missing or empty |
| **TC-7.2** | `GET /api/presentations` — populated list | Returns `200` with array of presentation metadata (id, title, createdAt, updatedAt, slide count) | Many files, corrupted JSON file in dir |
| **TC-7.3** | `POST /api/presentations` — valid input | Returns `201` with created presentation, file written to disk | Title with special chars, slug collision |
| **TC-7.4** | `POST /api/presentations` — missing title | Returns `400` with error message | Empty string title, whitespace-only title |
| **TC-7.5** | `POST /api/presentations` — invalid slides | Returns `400` when slides is not an array | `slides: null`, `slides: "string"`, `slides: 42` |
| **TC-7.6** | `POST /api/presentations` — slide missing required fields | Returns `400` when slide objects lack title or content | `{ title: "" }`, `{ content: "" }`, `{}` |
| **TC-7.7** | `GET /api/presentations/[slug]` — existing | Returns `200` with full presentation including all slides | Slug with hyphens, very long slug |
| **TC-7.8** | `GET /api/presentations/[slug]` — non-existing | Returns `404` with error message | Empty slug, slug with path traversal (`../`) |
| **TC-7.9** | `PUT /api/presentations/[slug]` — valid update | Returns `200` with updated presentation, `updatedAt` changed | Update only title, update only slides, update both |
| **TC-7.10** | `PUT /api/presentations/[slug]` — non-existing | Returns `404` with error message | Attempting to create via PUT |
| **TC-7.11** | `PUT /api/presentations/[slug]` — invalid body | Returns `400` with validation error | Missing title, invalid slides array |
| **TC-7.12** | `DELETE /api/presentations/[slug]` — existing | Returns `200`, file removed from disk | Verify file no longer on disk |
| **TC-7.13** | `DELETE /api/presentations/[slug]` — non-existing | Returns `404` with error message | Already deleted (idempotency check) |
| **TC-7.14** | `DELETE /api/presentations/[slug]` — path traversal | Returns `400` or `404`, no file system escape | Slug = `../../etc/passwd`, `..\\windows` |
| **TC-7.15** | All endpoints return proper Content-Type | `application/json` header on all responses | Check error responses too |
| **TC-7.16** | `POST /api/presentations` — response shape | Response includes `id`, `title`, `createdAt`, `updatedAt`, `slides` | Verify ISO-8601 date format |
| **TC-7.17** | `GET /api/presentations` — metadata only | List endpoint returns slide count, NOT full slide content | Verify no `slides` array in list items, or only count |

### US-8: AI slide generation API ⭐ (Primary test focus)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-8.1** | `POST /api/generate` — valid topic | Returns `200` with `{ slides: Slide[] }` | Very short topic ("AI"), very long topic |
| **TC-8.2** | `POST /api/generate` — missing topic | Returns `400` with error message | `topic: ""`, `topic: null`, body missing entirely |
| **TC-8.3** | `POST /api/generate` — custom numSlides | Returns specified number of slides | `numSlides: 0`, `numSlides: 1`, `numSlides: 100` |
| **TC-8.4** | `POST /api/generate` — default numSlides | Returns 5 slides when numSlides not specified | Verify exactly 5 |
| **TC-8.5** | `POST /api/generate` — with existingSlides | Generated slides complement existing deck | Empty existingSlides array, large existing deck |
| **TC-8.6** | `POST /api/generate` — OpenAI error handling | Returns `500` with descriptive error on API failure | Rate limit (429), invalid key (401), timeout |
| **TC-8.7** | `POST /api/generate` — response shape | Each slide has `title` (string) and `content` (string) | Verify optional fields `notes`, `backgroundImage` |
| **TC-8.8** | `POST /api/generate` — OPENAI_API_KEY missing | Returns `500` with configuration error, not a crash | Env var unset, env var empty string |

### US-9: Build verification and smoke tests ⭐ (Primary test focus)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-9.1** | `npm run build` succeeds | Exit code 0, no TypeScript errors | Clean build after `rm -rf .next` |
| **TC-9.2** | `npm run dev` starts | Dev server binds to port, responds to requests | Port already in use |
| **TC-9.3** | Landing page renders | `GET /` returns 200 with HTML | No presentations exist yet |
| **TC-9.4** | Presentation page renders | `GET /presentation/{slug}` returns 200 with HTML | Non-existent slug returns 404 |
| **TC-9.5** | API endpoints return valid JSON | All API routes return parseable JSON responses | Empty database state |
| **TC-9.6** | TypeScript compilation | `npx tsc --noEmit` exits 0 | After all source files added |

### US-10: Storage Abstraction ⭐ (Phase 2)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-10.1** | LocalFileStorage reads/writes presentations correctly | `save()` writes JSON to disk, `get()` reads it back with identical data | Missing presentations dir (auto-create), corrupted JSON |
| **TC-10.2** | LocalFileStorage list returns all presentations | `list()` returns metadata for every `.json` file in the storage dir | Empty dir, non-JSON files mixed in |
| **TC-10.3** | LocalFileStorage delete removes file | `delete()` removes the file, subsequent `get()` returns null/throws | Delete non-existent file |
| **TC-10.4** | Factory returns LocalFileStorage when no Azure config | `createStorage()` returns `LocalFileStorage` instance when `AZURE_STORAGE_CONNECTION_STRING` is unset | Env var empty string vs undefined |
| **TC-10.5** | Factory returns BlobStorage when AZURE_STORAGE_CONNECTION_STRING set | `createStorage()` returns `BlobStorage` instance when connection string is configured | Invalid connection string |

### US-11: Authentication (GitHub OAuth) ⭐ (Phase 2)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-11.1** | Unauthenticated API request returns 401 | When OAuth is configured (`AUTH_GITHUB_ID` set), API calls without credentials return 401 | Missing header vs empty header |
| **TC-11.2** | Valid session allows API access | Authenticated request with valid session cookie proceeds normally | Expired session, tampered cookie |
| **TC-11.3** | Local dev bypass — no auth required when AUTH_GITHUB_ID not set | When `AUTH_GITHUB_ID` is not configured, all API requests proceed without auth | Partial config (ID set but no secret) |
| **TC-11.4** | Bearer token with valid GitHub token succeeds | `Authorization: Bearer <valid_token>` passes auth middleware | Token with extra whitespace |
| **TC-11.5** | Bearer token with invalid token returns 401 | `Authorization: Bearer <invalid>` returns 401 JSON error | Malformed bearer header, expired token |
| **TC-11.6** | Rate limiting returns 429 after threshold | Exceeding rate limit returns 429 with `Retry-After` header | Burst requests, reset after window |

### US-12: CORS Middleware ⭐ (Phase 2)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-12.1** | OPTIONS preflight returns correct headers | Preflight response includes `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` | Custom headers in request |
| **TC-12.2** | API responses include CORS headers | Non-preflight API responses include `Access-Control-Allow-Origin` | Responses with errors (4xx, 5xx) still have CORS headers |
| **TC-12.3** | Dev mode allows all origins | When `NODE_ENV=development`, `Access-Control-Allow-Origin: *` is set | Production mode restricts origins |

### US-13: Copilot Extension ⭐ (Phase 2)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-13.1** | Skillset endpoint accepts valid invocation | POST to skillset endpoint with valid payload returns 200 | Missing fields in payload |
| **TC-13.2** | Returns presentation link in response | Response body contains a URL to the created presentation | Presentation creation fails |
| **TC-13.3** | Handles missing topic | Request without topic field returns appropriate error | Empty string topic, null topic |

### US-14: MCP Server ⭐ (Phase 2)

| ID | Description | Expected Behavior | Edge Cases |
|----|-------------|-------------------|------------|
| **TC-14.1** | `create_presentation` tool works | MCP tool creates a presentation and returns its metadata | Duplicate title, missing required fields |
| **TC-14.2** | `list_presentations` tool works | MCP tool returns array of all presentations | Empty list, large number of presentations |
| **TC-14.3** | `get_presentation` tool works | MCP tool returns full presentation by slug | Non-existent slug |
| **TC-14.4** | `delete_presentation` tool works | MCP tool deletes presentation and confirms removal | Delete non-existent presentation |

---

## 3. Security Considerations

| ID | Description | Expected Behavior |
|----|-------------|-------------------|
| SEC-1 | Path traversal in slug | Slugs containing `..`, `/`, or `\` must be rejected or sanitized |
| SEC-2 | XSS in markdown content | Markdown renderer must sanitize HTML in slide content |
| SEC-3 | Large payload handling | API should reject excessively large request bodies |
| SEC-4 | OpenAI key not leaked | API key never appears in client-side responses or error messages |

---

## 4. Test Data

### Valid Presentation
```json
{
  "title": "Introduction to TypeScript",
  "slides": [
    { "title": "What is TypeScript?", "content": "TypeScript is a typed superset of JavaScript." },
    { "title": "Key Features", "content": "- Static typing\n- Interfaces\n- Generics" }
  ]
}
```

### Minimal Valid Presentation
```json
{
  "title": "Minimal Deck",
  "slides": []
}
```

### Invalid Presentations (should be rejected)
```json
{ "slides": [{ "title": "No Title" }] }
{ "title": "", "slides": [] }
{ "title": "Bad Slides", "slides": "not-an-array" }
{ "title": "Missing Content", "slides": [{ "title": "Slide 1" }] }
```

---

## 5. Priority

1. **P0 (Must test first):** TC-9.1, TC-9.6, TC-7.1–TC-7.8, TC-7.12–TC-7.13
2. **P1 (Core functionality):** TC-7.9–TC-7.11, TC-8.1–TC-8.4, TC-7.14–TC-7.17, TC-10.1–TC-10.5, TC-11.1–TC-11.3, TC-12.1–TC-12.3
3. **P2 (Extended):** TC-8.5–TC-8.8, TC-1.x–TC-6.x, SEC-1–SEC-4, TC-11.4–TC-11.6, TC-13.1–TC-13.3, TC-14.1–TC-14.4
