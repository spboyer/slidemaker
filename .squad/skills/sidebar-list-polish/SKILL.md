---
name: "sidebar-list-polish"
description: "Patterns for polishing sidebar list components in React/Tailwind apps"
domain: "frontend-ui"
confidence: "low"
source: "earned"
---

## Context
Sidebar list panels (slide lists, file trees, layer panels) often start utilitarian and need polish. These patterns transform a basic list into a professional, designed panel.

## Patterns

### Icons Over Unicode
Replace unicode symbols (↑↓✕←→) with inline SVG components. Unicode renders inconsistently across OS/browser combos and looks unpolished. Inline SVGs are 5-7 lines each, need no icon library, and render crisply at any size.

### Hover-Reveal Actions
Wrap list items in a Tailwind `group` class. Place action buttons as `absolute` positioned elements with `opacity-0 group-hover:opacity-100 transition-opacity`. This keeps the list clean while making actions discoverable. For the selected/active item, always show buttons (`opacity-100`).

### Selected State Hierarchy
A single background highlight (`bg-indigo-600/20`) is not visually distinct enough. Use three signals together:
1. **Left accent bar** — `absolute left-0 w-[3px] rounded-full bg-indigo-400`
2. **Ring border** — `ring-1 ring-indigo-500/30`
3. **Background** — `bg-indigo-500/15`

### Mini Thumbnails
For list items that represent visual content (slides, pages, cards), add a small preview area. Even a simple colored box with a number or icon is better than text-only. Use cycling accent colors for visual variety.

### Panel Open/Close Transitions
Never conditionally render (`{show && <Panel />}`) — it causes a hard mount/unmount cut. Instead, always render the panel and control with CSS: `w-64` ↔ `w-0` with `transition-all duration-200 overflow-hidden`. The inner content should have a fixed width matching the open state.

## Anti-Patterns
- **Icon libraries for < 5 icons** — inline SVG is lighter and avoids dependency
- **Conditional rendering for panel visibility** — use CSS transitions
- **Single-signal selected state** — combine accent bar + ring + background
- **Always-visible action buttons** — creates visual noise at scale
