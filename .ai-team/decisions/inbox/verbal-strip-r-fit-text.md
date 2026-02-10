### 2026-02-10: Strip r-fit-text from slide content in RevealSlideshow
**By:** Verbal
**What:** r-fit-text CSS class is stripped from slide HTML content before rendering to prevent fitty crashes
**Why:** fitty's requestAnimationFrame loop holds stale DOM references during React reconciliation, causing uncaught TypeError on clientWidth
