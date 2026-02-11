### Copilot Extension Registration & Setup Documentation
**Author:** Keyser (Lead) · **Date:** 2025-07-22 · **Issue:** #46 · **Status:** Proposed

Added documentation and skill definition for registering SlideМaker as a GitHub Copilot Extension:

1. **`copilot-extension.json`** — Skill definition at project root with `topic` (required), `style`, and `numSlides` parameters. Matches the existing `parseSkillsetMessage()` contract in `src/app/api/copilot/skillset/route.ts`.

2. **`docs/copilot-extension-setup.md`** — Step-by-step guide covering GitHub App creation, Copilot Agent enablement, callback URL configuration, installation for users/orgs, usage examples with flags, local testing with curl, and troubleshooting common errors.

3. No code changes — docs only. The existing `/api/copilot/skillset` endpoint already handles the full Copilot Extension flow (auth, message parsing, generation, response formatting).

**Trade-offs:** The skill schema in `copilot-extension.json` is informational (GitHub reads the agent URL, not a local JSON file). Kept it in the repo as a reference contract for the skill's API surface. If GitHub introduces a formal manifest format, this file should be updated to match.
