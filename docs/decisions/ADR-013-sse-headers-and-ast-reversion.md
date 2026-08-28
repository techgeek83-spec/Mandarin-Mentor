# ADR-013: SSE Header Explicit Flush & Client-Side AST Reversion

## Context
TTFB metrics appeared falsely inflated (7+ seconds) due to network-layer buffering of Server-Sent Events, hiding the actual chunk delivery. Concurrently, forcing the LLM to generate custom HTML `<tts-block>` and `<ruby>` tags broke the frontend ReactMarkdown parser which already relies on regex-based AST injection for CJK characters.

## Decision
1. Inject explicit `Cache-Control: no-cache` and `X-Accel-Buffering: no` headers into the FastAPI `StreamingResponse` to force immediate TCP chunk flushing.
2. Strip HTML layout constraints from the backend system prompt, returning to clean Markdown. 

## Consequences
- The browser will instantly process the first SSE byte (restoring sub-second TTFB).
- The Next.js frontend regains authoritative control over rendering audio pills via its existing regex parser.
- Reduces token consumption by removing verbose HTML tags from the LLM output.