# Decision: PRD Decomposition into GitHub Issues

**Date:** 2025-07-22
**Author:** Keyser (Lead)
**Status:** Accepted

## Context

The PRD (PRD.md) defines 9 user stories for SlideМaker v1. We needed to decompose these into trackable GitHub issues, assign them to squad members, and establish the dependency graph.

## Decision

### Issue Breakdown

| US | Title | Issue # | Assigned To | Can Start Immediately? |
|----|-------|---------|-------------|----------------------|
| US-1 | Generate a presentation via AI | #1 | Verbal (Frontend) | No — depends on #7, #8 |
| US-2 | View and navigate slides | #2 | Verbal (Frontend) | ✅ Yes |
| US-3 | Edit slide content | #3 | Verbal (Frontend) | No — depends on #8 |
| US-4 | Add slides to existing presentation | #4 | Verbal (Frontend) | No — depends on #7, #8 |
| US-5 | Delete and reorder slides | #5 | Verbal (Frontend) | No — depends on #8 |
| US-6 | List and manage presentations | #6 | Verbal (Frontend) | No — depends on #8 |
| US-7 | Presentation CRUD API | #8 | McManus (Backend) | ✅ Yes |
| US-8 | AI slide generation API | #7 | McManus (Backend) | ✅ Yes |
| US-9 | Build verification and smoke tests | #9 | Fenster (Tester) | No — depends on all |

### Routing Rationale

- **McManus** gets the two API stories (US-7, US-8) — these are pure backend/server work with OpenAI integration and file I/O.
- **Verbal** gets the six frontend stories (US-1 through US-6) — these are React components, pages, and client-side integration.
- **Fenster** gets US-9 — build verification and smoke tests are squarely in the testing domain.

### Recommended Execution Order

1. **Parallel start:** McManus works US-7 + US-8 (APIs), Verbal works US-2 (slide viewer — no deps)
2. **After APIs land:** Verbal picks up US-3, US-5, US-6 (depend on CRUD API)
3. **After both APIs land:** Verbal picks up US-1 and US-4 (depend on both APIs)
4. **Final:** Fenster runs US-9 (smoke tests across everything)

### Dependency Graph

```
US-7 (CRUD API) ──┬──> US-1 (Generate presentation)
US-8 (Gen API) ───┘
                   ├──> US-3 (Edit slides) [needs US-7 only]
                   ├──> US-4 (Add slides) [needs US-7 + US-8]
                   ├──> US-5 (Delete/reorder) [needs US-7 only]
                   └──> US-6 (List presentations) [needs US-7 only]

US-2 (View slides) ──> No deps, start immediately

All ──> US-9 (Smoke tests)
```

## Consequences

- All squad members have clear ownership via `squad:{member}` labels
- Dependencies are documented as comments on each issue
- McManus and Verbal can start work in parallel immediately
