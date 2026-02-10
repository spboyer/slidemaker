### CSS: Cap h1 Font Size for Proportional Titles
**Author:** Verbal (Frontend Dev) · **Date:** 2026-02-10

**Problem:** The reveal.js black theme sets `--r-heading1-size: 2.5em` which at 42px base = 105px. Short titles like "REVEAL.JS" look fine, but multi-word titles like "UNDERSTANDING TYPESCRIPT BASICS" fill the entire slide, wrapping to 2 lines and pushing the subtitle off-screen.

**Fix:** Added `.reveal .slides section h1 { font-size: min(var(--r-heading1-size, 2.5em), 2em); }` to `globals.css`. This caps h1 at 2em (84px at 42px base) — proportional like the revealjs.com demo title at ~72px. The `min()` function respects theme custom properties while enforcing a ceiling.

**Showcase presentation updated:** Replaced the 5-slide `untitled-presentation.json` with a new version featuring a short 1-word h1 title ("TypeScript"), proper `class="language-typescript"` on code blocks for syntax highlighting, a comparison table, and a closing slide using h2. Designed to look proportional at any h1 size.

**Verified:** Build passes, 50 unit tests pass, 34 Playwright e2e tests pass.
