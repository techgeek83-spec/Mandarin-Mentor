# ADR-027: Isolated Hanzi Pinyin Cursor Indexing

## Context
When lines contained punctuation, spaces, or mixed Latin characters, passing the entire un-sanitized line into `pinyin-pro` caused array length mismatches against `line.split('')`. This shifted ruby annotations onto incorrect characters or left trailing Hanzi with empty `<rt>` tags.

## Decision
Extracted pure Hanzi substrings (`/[^\u4e00-\u9fff]/g`) to query `pinyin-pro` and cache lookups, then used an isolated integer cursor (`hanziCursor`) during character mapping to strictly align ruby annotations with Chinese characters regardless of punctuation or whitespace.

## Consequences
- Guarantees 1:1 pinyin-to-character alignment across arbitrary mixed-content blockquote strings.
- Prevents cache fragmentation caused by varied surrounding whitespace in dialogue lines.