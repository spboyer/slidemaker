### CSS Scoping: Replace `all: revert` with Targeted Property Reverts
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

**Problem:**
The `all: revert` rule applied to 30+ elements inside `.reveal .slides` was a nuclear option that reverted ALL CSS properties to browser defaults. This wiped out:
1. **Theme styles** — reveal.js themes (night, moon, black, dracula, etc.) set custom fonts, colors, heading sizes, letter-spacing, and text-transforms via CSS custom properties (`--r-heading-font`, `--r-heading1-size`, `--r-main-color`). These are applied through `.reveal h1`, `.reveal ul`, etc. selectors. `all: revert` reverted these to UA defaults, making all themes look identical and unstyled.
2. **Fragment animations** — `.fragment` classes rely on opacity, transform, visibility, and transition properties. `all: revert` could reset these.
3. **Code block styling** — `pre`/`code` elements have reveal.js-specific font-family, font-size, padding, and box-shadow. `all: revert` wiped the monospace font and sizing.
4. **Typography scale** — heading sizes (`3.77em`, `2.11em`, `1.55em`) defined by themes were lost.

**Decision:**
Replace `all: revert` with targeted `revert` on only the specific properties Tailwind v4's base layer resets:
- `margin`, `padding` (on headings, paragraphs, lists, blockquotes, tables, figures)
- `font-size`, `font-weight` (on headings — Tailwind's `font: inherit` kills heading scale)
- `font-family`, `font-size` (on `pre`, `code`)
- `list-style`, `padding`, `margin` (on `ul`, `ol`)
- `border`, `padding`, `text-align` (on `table`, `th`, `td`)
- `color`, `text-decoration` (on links)
- `font-weight` on `strong`/`b`, `font-style` on `em`/`i`
- `opacity`, `transform`, `visibility`, `transition` (on `.fragment`)

Also added:
- **r-fit-text compensation** — standalone title headings (`h1`/`h2` that are first-child and only/last-of-type in a section) get `font-size: 2.5em–3em` to replace the lost fitty auto-sizing.
- **Fragment animation preservation** — explicit revert of the four key animation properties on `.fragment` elements.

**Impact:**
- All 11 reveal.js themes now render with their intended typography, colors, and styling.
- Fragment animations (fade-in, fade-up, grow, shrink, highlight-*) work correctly.
- Code blocks render with proper monospace fonts and sizing.
- Title-only slides look large and impactful instead of default body-text size.
- Build passes. 50 unit tests pass.
- No changes to `RevealSlideshow.tsx` — purely a CSS fix in `globals.css`.
