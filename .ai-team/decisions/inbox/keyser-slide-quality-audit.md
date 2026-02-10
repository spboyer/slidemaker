### 2026-02-10: Slide quality audit — gap analysis
**By:** Keyser
**What:** Comprehensive audit of the gap between our generated slides and the revealjs.com demo quality bar
**Why:** User feedback that slides aren't impressive — need to match revealjs.com demo quality

---

## 1. CSS `all: revert` — THE BIGGEST PROBLEM

**Severity: CRITICAL — this is likely the #1 reason slides look bad.**

The `all: revert` rule in `globals.css` (lines 33–67) targets 30+ element types inside `.reveal .slides`. This is a sledgehammer fix for Tailwind v4's CSS reset, but it's **destroying reveal.js theme styles**, not restoring them.

### How `all: revert` actually works
`all: revert` rolls back to the **user-agent stylesheet** (browser defaults), NOT to reveal.js theme styles. Reveal.js themes apply their styling via selectors like `.reveal h1`, `.reveal ul`, `.reveal blockquote`, etc. These are *author-level* styles. `all: revert` nukes them along with Tailwind's resets.

### What's being destroyed

**Typography:** Every reveal.js theme sets heading font-family, font-size, font-weight, color, letter-spacing, text-transform, and line-height via CSS custom properties (`--r-heading-font`, `--r-heading1-size`, etc.). `all: revert` on `h1`–`h6` strips ALL of these back to browser defaults (Times New Roman, 2em for h1, bold, black text). This means:
- Night theme's Montserrat headings → Times New Roman
- Moon theme's League Gothic headings → Times New Roman  
- Black theme's Source Sans Pro headings → Times New Roman
- All heading sizing (3.77em for h1, 2.11em for h2) → browser defaults (2em, 1.5em)
- All text-transform (uppercase in black/moon themes) → none

**Lists:** Themes set `ul` to `display: inline-block; text-align: left; margin: 0 0 0 1em; list-style-type: disc`. After `all: revert`, lists get browser defaults which may look different but more critically, the `display: inline-block` (which centers list blocks on the slide) is lost. Lists may left-align at the edge of the slide.

**Blockquotes:** Themes give blockquotes `width: 70%; margin: auto; background: rgba(255,255,255,0.05); box-shadow; font-style: italic`. After revert, blockquotes get browser-default indentation and no background/shadow — they look like plain text with a margin.

**Tables:** Theme styles set `border-collapse: collapse; margin: auto; border-bottom: 1px solid` per cell. After revert, tables get browser defaults with no consistent styling.

**Code blocks (`pre`/`code`):** Themes set `pre` to `width: 90%; margin: auto; font-size: 0.55em; box-shadow`. After revert, code blocks lose their sizing, shadow, and centered positioning.

**Links:** Theme colors (`--r-link-color`) and transitions are stripped. Links revert to default blue/purple.

### What's also at risk — fragment animations

Fragment animations in `reveal.css` use selectors like `.reveal .fragment.fade-up`. The `all: revert` rule targets `.reveal .slides li`, `.reveal .slides p`, `.reveal .slides span` etc. Since fragments are applied to these elements, `all: revert` **may strip the `opacity`, `visibility`, `transform`, and `transition` properties** that fragments depend on. This would cause:
- Fragments appearing all at once instead of stepping through
- `grow`/`shrink` fragments not scaling
- `fade-up`/`fade-down` not translating
- `highlight-red`/`blue`/`green` not changing color

The `transition: all .2s ease` on `.reveal .fragment` gets reverted on list items that are fragments, breaking the animation.

### Recommendation: P0 — Replace `all: revert` with targeted property resets

Instead of `all: revert`, only reset the specific properties that Tailwind v4 zeroes out. The key Tailwind v4 resets that conflict are:
- `margin: 0` on headings, paragraphs, blockquotes, lists
- `padding: 0` on lists
- `border: 0` / `border-style: none` on tables, images
- `font-size: inherit` / `font-weight: inherit` on headings
- `list-style: none` on `ul`/`ol`
- `text-decoration: inherit` on links
- `border-collapse: separate` on tables (Tailwind default)

**The fix:** Use `all: revert` ONLY for the properties Tailwind resets, or better yet, use `@layer` to ensure reveal.js theme CSS loads at a higher cascade priority than Tailwind's base. McManus/Verbal should investigate `@layer base` in Tailwind v4 to put reveal.js overrides in a higher layer.

**Alternative quick fix:** Replace `all: revert` with `all: initial` only on properties known to conflict, or use `all: unset` scoped more carefully. But the cleanest solution is CSS `@layer` ordering.

---

## 2. Theme Quality Assessment

**Severity: HIGH**

Given the `all: revert` problem above, **ALL 11 themes are broken to the same degree** — every theme's typography, colors, and element styles are being stripped. The themes aren't "not great" — they're being actively destroyed by our CSS.

After fixing the CSS issue:
- **Dark themes (night, moon, blood, league, black):** Should look excellent — these are the themes the revealjs.com demo uses and they have distinctive fonts (Montserrat, League Gothic, Source Sans Pro) and color palettes.
- **Light themes (white, simple, sky, beige, serif):** Should work fine but some (sky, beige) can look dated. Still better than what we're showing now.
- **Solarized:** Niche but well-designed; will look correct once CSS is fixed.

**Recommendation:** After CSS fix, audit each theme visually. Consider marking 3-4 as "recommended" in the UI (night, moon, black, simple). No themes need to be removed.

---

## 3. Content Quality — `untitled-presentation.json`

**Severity: MEDIUM**

The generated content in `untitled-presentation.json` is decent but has structural issues:

### What's good:
- Varied fragment types (fade-in, fade-up, grow, fade-in-then-semi-out) ✅
- Background gradients on some slides ✅
- Table with fragment rows ✅
- Blockquote with attribution ✅
- Varied transitions across slides ✅

### What's missing vs. revealjs.com demo:

**a) No auto-animate usage.** Every slide has `"autoAnimate": false`. The prompt instructs "at least 1 auto-animate pair per 5 slides" but the AI didn't follow through. The revealjs.com demo uses auto-animate extensively for its most impressive slides (the code evolution sequence, the morphing boxes with `data-id`).

**b) No `data-id` attributes for auto-animate matching.** Even if autoAnimate were true, our `SlideContent` renders via `dangerouslySetInnerHTML` — the AI would need to include `data-id` attributes in the HTML content for elements to morph. The prompt doesn't explain this requirement. The demo's most impressive sequence (3 boxes morphing from row → row → stacked circles) relies entirely on `data-id`.

**c) No code blocks.** For a "TypeScript Best Practices" presentation, there are zero code examples. The prompt instructs code blocks with `data-line-numbers` step-through, but the AI chose not to include any.

**d) Title slide is underwhelming.** Just `<h2>TypeScript Best Practices</h2>` — no subtitle, no visual element, no gradient text. The revealjs.com demo title has a logo image + subtitle + styled footer. Without `r-fit-text`, our title text doesn't scale impressively.

**e) Light backgrounds on dark theme.** Slide 2 has `backgroundColor: "#f2f2f2"` and slide 3 has `backgroundColor: "#ffffff"` — these are WHITE backgrounds on what is set to the `"black"` theme. The result is jarring light slides interrupting a dark deck. The prompt's "visual rhythm" instruction is being interpreted as "alternate light and dark" instead of "vary within the theme's palette."

### Recommendation: P1 — Improve prompt

1. Add explicit `data-id` examples for auto-animate
2. Forbid light backgroundColor values when using dark themes (and vice versa) — add a rule like "backgroundColor values must complement the selected theme palette"
3. Require at least one code block for technical topics
4. Add a title slide template with subtitle pattern

---

## 4. Missing Features vs. revealjs.com Demo

**Severity: MEDIUM-HIGH**

### Features in revealjs.com demo that we DON'T support:

| Feature | Demo uses it? | We support it? | Effort |
|---------|--------------|----------------|--------|
| **Vertical slides** (nested `<section>`) | ✅ Yes, prominently | ❌ No — `RevealSlideshow` renders flat `section` list | HIGH — needs data model change (slides-within-slides) |
| **Background images** (`data-background-image`) | ✅ Yes | ⚠️ Partial — `sectionAttrs` handles it, `Slide` type has `backgroundImage`, but prompt doesn't instruct AI to use it | LOW — just add to prompt |
| **Background video** (`data-background-video`) | ✅ Yes | ❌ No — not in Slide type or prompt | MEDIUM |
| **Background iframe** (`data-background-iframe`) | ✅ Yes | ❌ No | LOW priority — niche feature |
| **Parallax backgrounds** | ✅ Mentioned | ❌ No — needs Reveal.js config option | LOW effort but needs UI |
| **`r-stack` for layered content** | ✅ Yes (auto-animate demo) | ❌ No — not in prompt | LOW — just HTML the AI can generate |
| **`r-fit-text`** | ✅ Yes | ❌ Stripped — crashes fitty | See section 5 |
| **`data-id` for auto-animate** | ✅ Yes (core to best slides) | ❌ Not in prompt, not understood by AI | LOW — prompt change |
| **Markdown slides** (`data-markdown`) | ✅ Yes | ❌ No — we generate HTML only | LOW priority |
| **`data-auto-animate-delay`** | ✅ Yes | ❌ No | LOW — AI can include in HTML |
| **Background transitions** (`data-background-transition`) | ✅ Yes | ❌ Not in Slide type | LOW |
| **Zoom plugin** | ✅ Yes | ✅ Yes — loaded in RevealSlideshow | ✅ |
| **Highlight plugin** | ✅ Yes | ✅ Yes — loaded | ✅ |
| **Notes plugin** | ✅ Yes | ✅ Yes — loaded | ✅ |
| **Speaker view** | ✅ Yes | ✅ Via reveal.js built-in | ✅ |

### Priority recommendations:
1. **P1: `data-id` in prompt** — this unlocks auto-animate properly, which is the single most impressive feature in the demo
2. **P1: `r-stack` and `r-hstack` in prompt** — enable layered/stacked layouts
3. **P2: Background images in prompt** — already supported in data model, just not prompted
4. **P3: Vertical slides** — impressive but requires significant data model changes
5. **P3: Background video** — nice-to-have

---

## 5. `stripFitText()` Side Effects

**Severity: MEDIUM**

### Current behavior:
`stripFitText()` in `RevealSlideshow.tsx` removes ALL instances of `r-fit-text` from slide HTML content. McManus also removed `r-fit-text` from the AI prompt, so new slides won't generate it. But old presentations or manually-edited slides could have it.

### The actual impact:
Without `r-fit-text`, title text on impact slides uses the theme's default `--r-heading2-size` (typically 2.11em for h2, which at 40px base = ~84px). This is **adequate but not impressive** — the revealjs.com demo's `r-fit-text` "FIT TEXT" slide scales to fill the entire width, creating a dramatic visual impact.

For comparison:
- With `r-fit-text`: text scales to fill 100% of slide width dynamically
- Without `r-fit-text`: text is ~84px (h2) or ~150px (h1) — fine for body slides, underwhelming for title/impact slides

### The crash:
The fitty library that `r-fit-text` depends on measures `clientWidth` in a `requestAnimationFrame` loop. When React reconciles and removes DOM nodes, fitty holds stale references. This is fundamentally a React + fitty incompatibility.

### Possible fixes (in priority order):
1. **CSS-only replacement (P1):** Add a CSS class like `.slide-fit-title` that uses `font-size: clamp(2rem, 8vw, 6rem)` or `font-size: min(10vw, 150px)` to approximate fit behavior without fitty. Replace `r-fit-text` references with this class in the prompt.
2. **Container query approach:** Use CSS container queries on the `.reveal .slides section` to scale text based on available width. More robust than viewport units.
3. **Fix fitty integration:** Fork/patch fitty to check for detached DOM nodes before measuring. HIGH effort, fragile.
4. **Accept the gap:** Just use large font sizes on title slides via prompt instructions. LOWEST effort.

**Recommendation:** Option 1 — a CSS `clamp()` replacement class. Verbal implements the CSS, McManus updates the prompt to use the new class name instead of `r-fit-text`.

---

## Priority Summary

| Priority | Issue | Owner | Impact |
|----------|-------|-------|--------|
| **P0** | Replace `all: revert` with targeted CSS fixes or `@layer` | Verbal (CSS) | Fixes ALL theme rendering, fragment animations, typography |
| **P1** | Add `data-id` and `r-stack`/`r-hstack` to AI prompt | McManus (Prompt) | Unlocks impressive auto-animate sequences |
| **P1** | CSS replacement for `r-fit-text` (clamp-based) | Verbal (CSS) + McManus (Prompt) | Restores dramatic title slides without fitty crash |
| **P1** | Fix background color vs. theme palette conflict in prompt | McManus (Prompt) | Stops jarring light-on-dark slide switches |
| **P2** | Add background image support to prompt | McManus (Prompt) | Richer visual variety |
| **P2** | Add title slide template to prompt | McManus (Prompt) | Better first impressions |
| **P3** | Vertical slides support | Verbal (Component) + McManus (Types) | Demo parity but significant refactor |
| **P3** | Background video/iframe support | McManus (Types + Prompt) | Nice-to-have |

### Execution order:
1. Verbal: Fix `all: revert` CSS (P0) — this alone will make slides dramatically better
2. Verbal: Add `r-fit-text` CSS replacement class (P1)
3. McManus: Update SYSTEM_PROMPT with `data-id`, `r-stack`, theme-aware backgrounds, title template (P1)
4. McManus: Add background image instructions to prompt (P2)
5. Verbal + McManus: Vertical slides (P3, can defer)

**Bottom line:** The slides look bad primarily because `all: revert` is destroying reveal.js's own theme styles. Fix that one CSS rule and we get 70% of the way to the demo quality bar. The remaining 30% is prompt improvements for richer content variety and auto-animate usage.
