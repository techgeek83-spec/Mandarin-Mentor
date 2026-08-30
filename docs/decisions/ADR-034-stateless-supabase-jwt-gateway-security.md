# ADR-034: Stateless Supabase JWT Gateway Security

## Context
Deploying the FastAPI backend to Fly.io exposes `/api/*` endpoints publicly. The Next.js API proxy was deprecated in favor of direct client-to-Fly.io communication. To protect upstream APIs (Groq Whisper, Gemini API, Microsoft Edge-TTS) against unauthenticated exhaustion without introducing blocking database lookups into the request lifecycle, gateway ingress must be secured statelessly.

## Decision
Enforce stateless JWT signature verification at the FastAPI gateway level via `PyJWT` and FastAPI `HTTPBearer`.
1. The Next.js frontend initializes `@supabase/supabase-js`, acquires an anonymous session on mount, and injects the `Bearer <token>` into all outbound API fetch headers.
2. FastAPI `verify_token` dependency decodes and validates incoming tokens locally, supporting modern Supabase ECC P-256 (`ES256`) and HMAC-SHA256 (`HS256`) signatures without performing remote auth server roundtrips.

## Consequences
* Ingress routes reject unauthenticated requests with `401 Unauthorized`.
* Eliminates network and database overhead on token validation, maintaining sub-second TTFB on LLM streams and audio synthesis.
* Allows seamless transition to full authenticated user accounts in Beta without altering backend API dependency contracts.