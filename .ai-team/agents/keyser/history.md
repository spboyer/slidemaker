# Project Context

- **Owner:** Shayne Boyer (spboyer@live.com)
- **Project:** AI-powered slide presentation builder — Next.js web app with OpenAI-driven slide generation, persistent JSON storage in /presentations
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, OpenAI API
- **Created:** 2026-02-10

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

### 2025-07-22 — PRD Decomposition
- Decomposed PRD.md into 9 GitHub issues (US-1 through US-9), issues #1–#9
- Created squad labels: `squad`, `squad:mcmanus`, `squad:verbal`, `squad:fenster`, `squad:keyser`
- Assigned 6 frontend stories to Verbal, 2 backend API stories to McManus, 1 test story to Fenster
- Established dependency graph: US-7 (#8) and US-8 (#7) are the foundational APIs with no deps; most frontend stories depend on them
- Note on issue numbering: US-7 mapped to #8 and US-8 mapped to #7 due to parallel creation — dependency comments reference correct issue numbers
- Added dependency comments to issues #1, #3, #4, #5, #6, #9
- US-2 (#2) and the two backend APIs (#7, #8) can start immediately in parallel
- Decision recorded in `.ai-team/decisions/inbox/keyser-prd-decomposition.md`

📌 Team update (2026-02-10): APIs (#7, #8) and slide viewer (#2) complete — frontend stories US-3/5/6 unblocked, US-1/4 unblocked — decided by McManus & Verbal
📌 Team update (2026-02-10): Test plan with 40+ cases ready — smoke tests can run once APIs are exercised — decided by Fenster
📌 Team update (2026-02-10): Never include secrets in GitHub issues, PRs, or repo content — directive by Shayne Boyer
📌 Team update (2026-02-10): Always update docs, tests, and agents.md when making changes — directive by Shayne Boyer
📌 Team update (2026-02-10): CSS `all: revert` replaced with targeted property reverts — all 11 reveal.js themes now render correctly with intended fonts, colors, and styling — decided by Verbal (based on Keyser audit)
📌 Team update (2026-02-10): SYSTEM_PROMPT V2 deployed — 8-type slide taxonomy, strict HTML rules, curated backgrounds, theme intelligence — decided by McManus
📌 Team update (2026-02-10): Console error detection e2e tests added — `page.on('pageerror')` catches uncaught JS errors during Playwright runs — decided by Fenster
📌 Team update (2026-02-10): Default theme locked to "black" with slide transition — matches revealjs.com demo, CSS heading specificity fixed — decided by Verbal (directive by Shayne Boyer)
📌 Team update (2026-02-10): Three CSS rendering fixes — viewport bg/color !important override, code block font-size/styling fix, hljs post-render re-highlighting — verified via Playwright computed styles — decided by Verbal
📌 Team update (2026-02-10): Slide area polish — compact chrome (~50px saved), fragment visibility in embedded mode, nav control colors via --r-link-color — decided by Verbal
📌 Team update (2026-02-10): h1 font-size capped at min(2.5em, 2em), showcase presentation updated with TypeScript content — decided by Verbal

📌 Team update (2026-02-11): No-secrets directive consolidated — never commit tokens, API keys, or secrets into git; use env vars or placeholders only — decided by Shayne Boyer
