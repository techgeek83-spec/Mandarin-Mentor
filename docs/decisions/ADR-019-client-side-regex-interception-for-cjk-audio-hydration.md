### ADR-019: Client-Side Regex Interception for CJK Audio Hydration

**Context:** The LLM previously handled formatting Hanzi with `<ruby>` and custom `<tts-inline>` tags. This caused massive token bloat, leaked HTML during stream pauses, and frequently hallucinated nested or unclosed XML elements, resulting in UI crashes. **Decision:** We have stripped the LLM of formatting duties (ADR-016). `ReactMarkdown` now intercepts text nodes directly, parsing `/[\u4e00-\u9fff]+/g` and applying `pinyin-pro` dictionary lookups on the client. **Consequences:**

- API token usage drops significantly.
    
- UI hallucination crashes are eliminated.
    
- Pinyin accuracy now strictly relies on the client's SSE consumer properly buffering natural phrase boundaries before pushing to `msg.content` (to preserve multi-character context for polyphones).