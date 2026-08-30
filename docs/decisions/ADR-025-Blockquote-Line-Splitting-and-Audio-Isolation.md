# ADR-025: Blockquote Multi-Line Splitting and Audio Isolation

## Context
Contiguous Markdown blockquotes collapsed multiple dialogue turns into a single unified `<TTSPlayer mode="block">`. English translation annotations inside quotes were incorrectly wrapped into the container, while multi-turn lines shared a single audio trigger.

## Decision
Refactored the AST blockquote renderer to split raw text by line boundaries (`\n`). Each line containing Hanzi is instantiated as an independent `<TTSPlayer mode="block">` instance, while non-CJK lines render as plain semantic text. Updated the backend system prompt to isolate dialogue lines from English glosses.

## Consequences
- Every dialogue turn receives an isolated play button.
- English translations render cleanly outside block audio wrappers.
- Preserves token savings by avoiding custom XML/HTML tag emission.