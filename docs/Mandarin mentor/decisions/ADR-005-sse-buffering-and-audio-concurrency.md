# ADR-005: SSE Tag Buffering and Singleton Audio Concurrency Control

**Context:** Streaming LLM responses via Server-Sent Events splits `<ruby>` and custom `<tts-*>` XML tags across arbitrary byte chunks, causing `ReactMarkdown` AST parser failure and visual DOM flashing. Simultaneously, independent `<TTSPlayer>` instances triggered in rapid succession cause overlapping audio output and redundant in-flight network requests.

**Decision:** 
1. Implement a client-side stream accumulation buffer that suppresses unclosed tag fragments matching `/<\/?(?:ruby|rt|rp|tts-inline|tts-block)?[^>]*$/` from reaching `ReactMarkdown` until closing delimiters are received.
2. Enforce a global audio coordinator utilizing a singleton `AbortController` and unified playback state to cancel pending `/api/tts` requests and stop playing audio when a new micro-player is activated.

**Consequences:**
- *Pros:* Eliminates UI flashing/layout shifts during SSE token generation; guarantees single-stream audio execution on mobile WebKit and Chrome.
- *Cons:* Adds a minimal (sub-5ms) stream buffering layer on the frontend; requires centralizing playback state via React context or a lightweight store.