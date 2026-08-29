# ADR 017: Temporary Removal of Redis Rate Limiting

## Context
The initial Redis-based token bucket implementation for rate limiting was synchronously blocking the FastAPI critical path. This introduced severe network latency, violating the sub-second Time to First Byte (TTFB) requirement essential for the application's real-time streaming LLM interface.

## Decision
Redis token limiting and its associated middleware were completely stripped from the backend environment to unblock frontend development and restore baseline streaming performance.

## Consequences
* **Positive:** TTFB restored to acceptable sub-second levels, preserving the required conversational UX.
* **Negative:** The application APIs are currently completely unprotected. The system is vulnerable to DDOS, scraping, and malicious token exhaustion, risking unbounded API billing from Gemini and Groq.
* **Required Remediation:** Before public release, rate limiting must be reintroduced using a strictly non-blocking architecture. Future implementations must evaluate moving rate limiting to an Edge Gateway (e.g., Cloudflare) or utilizing a fast-path asynchronous Redis check that does not block the initial SSE chunk yield.