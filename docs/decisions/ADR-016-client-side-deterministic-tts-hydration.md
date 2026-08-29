# ADR 016: Client-Side Deterministic TTS Hydration

## Context
The application previously relied on the Gemini LLM to generate custom HTML tags (`<tts-inline>`, `<tts-block>`) and nested `<ruby>` pinyin annotations mid-sentence. This created severe technical debt, as the probabilistic nature of the LLM frequently resulted in malformed tags, leaked naked `<ruby>` nodes, and hallucinated wrappers around English text, continuously breaking the frontend UI.

## Decision
We are completely decoupling content generation from presentation formatting. 
1. The backend system prompt will be stripped of all HTML formatting rules. The LLM will output standard raw Markdown.
2. The Next.js frontend will implement a deterministic AST interceptor. It will parse raw text nodes using a CJK Unicode regex (`/[\u4e00-\u9fff]+/g`).
3. Matched Hanzi strings will be dynamically hydrated on the client using `pinyin-pro` (or a fallback dictionary) and wrapped in the interactive TTS micro-player components.

## Consequences
* **Positive:** Eliminates UI crashes caused by LLM formatting hallucinations. Drastically reduces output token usage and generation latency.
* **Negative:** Increases client-side computational overhead during the render cycle. Requires careful memoization to prevent main-thread blocking on lower-end mobile devices.