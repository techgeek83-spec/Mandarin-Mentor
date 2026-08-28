# ADR-001: CJK Font Optimization & Native Fallbacks

**Status:** Accepted

**Context:**
Mandarin learners benefit from Kai-style stroke anatomy (e.g., BiaoKai, Klee One). However, importing full CJK web fonts introduces multi-megabyte payloads, causing severe Flash of Invisible Text (FOIT) and degrading page load latency.

**Decision:**
Do not bundle or import remote CJK web fonts. Rely strictly on OS-level font stacks (`BiaoKai`, `Kaiti TC`, `Microsoft JhengHei`) and enforce standard `zh-TW` language tags at the HTML root.

**Consequences:**
* **Pros:** Zero network bloat; eliminates FOIT and sub-resource blocking.
* **Cons:** Visual rendering of strokes varies slightly across client operating systems.