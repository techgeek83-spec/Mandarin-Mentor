### ADR-020: Enforce Pure Markdown in LLM Output

**Context:** The LLM was injecting nested HTML (`<ruby>`) and custom XML (`<tts>`) elements directly into the SSE stream. This fragmented the incoming chunks, defeating the client-side `[\u4e00-\u9fff]+` regex parser and causing React to mount isolated micro-players for individual characters instead of full phrases. **Decision:** Updated the backend system prompt to strictly prohibit HTML/XML tag generation. The LLM now emits pure conversational text and standard Markdown (bolding). **Consequences:**

- Restores proper contextual phrase-boundaries for `pinyin-pro`.
    
- Groups complete Hanzi strings into unified, single `<TTSPlayer>` UI components.
    
- Vastly decreases token generation output costs.