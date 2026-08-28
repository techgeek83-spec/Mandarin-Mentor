# ADR-014: Reinstating LLM-Driven AST Tagging with Strict Syntax Constraints

## Context
Simplifying the LLM system prompt broke the frontend UI because the custom ReactMarkdown parsers strictly depend on `<tts-inline>`, `<tts-block>`, and `<ruby>` tags to mount the edge-tts micro-players and display pinyin. 

## Decision
1. Restore the verbose system prompt to explicitly enforce the generation of custom HTML/XML tags.
2. Inject strict formatting guardrails into the prompt to prevent unclosed tags or nested English text, which would panic the React AST renderer.

## Consequences
- Audio pills and sentence-level TTS will immediately resume functioning.
- Token consumption increases slightly due to verbose output formatting.
- The frontend remains tightly coupled to LLM output stability; malformed LLM responses will still risk rendering crashes.