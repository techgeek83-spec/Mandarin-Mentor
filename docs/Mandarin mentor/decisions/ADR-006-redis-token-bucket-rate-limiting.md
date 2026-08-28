# ADR-006: Redis-Backed Token-Bucket Rate Limiting

**Context:** The API gateway exposes unauthenticated endpoints that trigger high-cost downstream APIs (Groq Whisper and Gemini). Allowing unbounded requests exposes the infrastructure to credit exhaustion and DDoS vulnerabilities, while naive fixed-window limiting throttles legitimate rapid audio micro-player interactions.

**Decision:** Implement an asynchronous, Redis Lua-backed Token Bucket algorithm in FastAPI. Route limits are decoupled: `/api/tts` allows bursts of 40 requests with a 1.0/sec refill rate, `/api/transcribe` allows bursts of 15 requests with a 0.33/sec refill rate, and `/api/chat` is capped at 10 requests with a 0.2/sec refill rate. Requests are identified by IP address during Alpha, automatically upgrading to User ID extraction when JWT auth is present.

**Consequences:**
- *Pros:* Prevents API abuse; enables bursty Hanzi micro-player tapping without 429 errors; prepares infrastructure for tiered user accounts.
- *Cons:* Introduces Redis as a hard operational dependency on the backend gateway.