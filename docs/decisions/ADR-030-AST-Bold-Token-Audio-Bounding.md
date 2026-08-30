# ADR-030: Restrict Inline Audio Pills to Strong AST Tokens

## Context
Client-side regex parsing indiscriminately wrapped all CJK character sequences in `<TTSPlayer mode="inline">`, populating standard instructional prose, parenthetical remarks, and explanatory lists with distracting audio play buttons.

## Decision
Configured standard `p` and `li` AST node handlers to pass `renderTTS=false` to `createNodeHydrator`, rendering pure ruby pinyin tags without audio triggers. Mapped the Markdown `strong` AST component (`**...**`) to pass `renderTTS=true`, isolating actionable inline audio pills strictly to targeted vocabulary terms.

## Consequences
- Eliminates UI visual noise from conversational Chinese explanations.
- Aligns client audio player mounting directly with intentional LLM vocabulary bolding.
- Reduces speculative audio caching calls generated from arbitrary prose.