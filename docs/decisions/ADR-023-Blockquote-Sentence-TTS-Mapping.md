# ADR-023: Markdown Blockquote to Sentence-Level TTS Player Mapping

## Context
Stripping HTML/XML tags caused full dialogue sentences to lose their block-level audio player bindings. Without explicit block boundaries, the client-side regex parser fragmented sentences into multiple adjacent inline audio pills.

## Decision
Mapped Markdown blockquotes (`>`) to full-sentence `<TTSPlayer mode="block">` containers. Configured `createNodeHydrator` with a `renderTTS=false` flag for blockquote children to hydrate ruby pinyin without nesting redundant inline play buttons inside the block player.

## Consequences
- Preserves clean visual hierarchy: block audio cards for dialogue lines, inline pills for vocabulary lists.
- Avoids nested audio button DOM collision.