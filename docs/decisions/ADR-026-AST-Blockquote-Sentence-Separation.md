# ADR-026: AST Blockquote Multi-Line Sentence Separation

## Context
ReactMarkdown aggregates contiguous Markdown blockquotes into a single DOM node. Raw string extraction collapsed multi-turn dialogue into a single card with one merged TTS trigger.

## Decision
Split the extracted text within the `blockquote` AST renderer by newline boundaries (`\n`), filtering empty tokens, and mapping each valid CJK string to an independent `<TTSPlayer mode="block">` component while emitting non-CJK lines as plain text elements.

## Consequences
- Isolates individual dialogue turns into separate actionable audio blocks.
- Eliminates audio bleeding across adjacent dialogue lines without requiring backend prompt modifications.