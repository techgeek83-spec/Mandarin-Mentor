# ADR-011: Asynchronous Database Non-Blocking Pipe & Gemini Flash-Lite Migration

## Context
TTFB degraded from ~1.0s to 8.10s due to sequential database round-trips to remote Supabase endpoints preceding stream initialization, paired with standard model tier inference overhead. TTS requests degraded to ~4.5-5.0s.

## Decision
1. Fire-and-forget user prompt insertion using `asyncio.create_task` instead of blocking the request pipeline.
2. Pin the LLM engine to `gemini-2.5-flash-lite` (or `gemini-1.5-flash-latest`).
3. Stream the assistant completion writeback to Supabase strictly in the post-stream generator hook.

## Consequences
- TTFB drops from ~8.1s to <600ms.
- Database WAN latency is removed entirely from the critical TTFB path.
- Minimal risk of message ordering race conditions mitigated by timestamps in PostgreSQL.