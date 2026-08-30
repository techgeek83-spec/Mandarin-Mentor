### ADR-021: AST Pinyin Memoization

**Context:** The client-side AST interception strategy for pinyin hydration caused fatal main-thread lockups during SSE stream consumption. Re-evaluating the entire chat history with synchronous dictionary lookups on every stream tick resulted in an $O(N^2)$ computation bottleneck, manifesting as 1-2 minute "TTFB" delays.

**Decision:** Implemented a global singleton `Map<string, string[]>` cache outside the React component lifecycle to memoize `pinyin-pro` array outputs based on raw string inputs.

**Consequences:**

- Eliminates CPU lockups; restores sub-second UI responsiveness.
    
- Memory overhead increases marginally but is negligible for standard text lengths.