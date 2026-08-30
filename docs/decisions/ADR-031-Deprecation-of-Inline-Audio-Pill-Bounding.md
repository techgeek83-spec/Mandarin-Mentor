# ADR-031: Deprecation of Inline Audio Pill Bounding and UI Normalization

## Context

Attempts to constrain interactive TTS audio micro-players strictly to targeted vocabulary (`strong` Markdown tags) via AST recursion resulted in severe component tree corruption, double-hydration pinyin collision ("double bubbles"), and unmaintainable technical debt.

## Decision

Formally deprecate inline audio pill bounding (superseding ADR-030). We retain the global client-side CJK regex hydration (`/[\u4e00-\u9fff]+/g`) across all text nodes as the singular, stable source of truth. System stability and component predictability take permanent precedence over localized UI optimization.

## Consequences

- **Positive:** Elimination of ReactMarkdown AST recursion loops, zero double-hydration bugs, and complete architectural stability.
    
- **Negative:** Minor UX trade-off where long conversational LLM paragraphs display audio micro-players on non-target CJK characters.
    
- **Action:** Save this file as `decisions/ADR-031-Deprecation-of-Inline-Audio-Pill-Bounding.md`.