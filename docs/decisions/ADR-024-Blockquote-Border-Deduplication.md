# ADR-024: Blockquote Visual Deduplication

## Context
Rendering a `<TTSPlayer mode="block">` inside a standard ReactMarkdown `<blockquote>` generated duplicate left accent borders and conflicting container paddings.

## Decision
Removed the outer styled `<blockquote>` container in the AST renderer, delegating layout, background styling, and border accents solely to `<TTSPlayer mode="block">`.

## Consequences
- Eliminates visual double-border artifacts on dialogue blocks.
- Centralizes block typography and spacing inside TTSPlayer.