### Copilot Extension Skillset Endpoint
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #45

Added `POST /api/copilot/skillset` endpoint for GitHub Copilot Extension skill invocations. Key decisions:

1. **Shared presentation service** (`src/lib/presentation-service.ts`): Extracted the generate-and-create logic (AI call, slug generation, storage persistence) into a shared utility `generateAndCreatePresentation()`. Both the existing chat flow and the new Copilot endpoint can use this service, eliminating duplication. The SYSTEM_PROMPT and style instructions are co-located in the service module.

2. **Input parsing**: The skillset endpoint parses the last user message from the Copilot `messages` array. Supports `--style <style>` and `--slides <N>` flags, and strips `/slidemaker` prefix if present. Invalid styles are silently ignored; out-of-range slide counts fall back to default (5).

3. **Auth model**: Uses `X-GitHub-Token` header validation via the existing `validateBearerToken()` from `auth-utils.ts`. When `AUTH_GITHUB_ID` is not set (dev mode), all requests are allowed — matching the middleware pattern.

4. **Response format**: Returns GitHub Copilot Extension format (`{ messages: [{ role: "assistant", content: "..." }] }`) with a formatted summary including edit link, slide count, theme, and slide listing.

5. **Edit URL construction**: Uses `NEXTAUTH_URL` or `VERCEL_URL` env vars to build the presentation edit link, falling back to `http://localhost:3000`.

6. **Error handling**: Missing topic returns a friendly usage hint. AI failures return error message with retry suggestion. Auth failures return 401 with Copilot-format error messages.

7. **Tests**: 15 new tests in `copilot-skillset.test.ts` covering: service exports, route handler export, and `parseSkillsetMessage` parsing (topic extraction, flag parsing, prefix stripping, edge cases). Total test count: 75 passing.

**Files added:**
- `src/lib/presentation-service.ts` — shared generate+create service
- `src/app/api/copilot/skillset/route.ts` — Copilot Extension endpoint
- `src/__tests__/copilot-skillset.test.ts` — unit tests

**Not changed:** Existing generate and presentations routes were left unchanged to avoid risk. They can be refactored to use `presentation-service.ts` in a follow-up.
