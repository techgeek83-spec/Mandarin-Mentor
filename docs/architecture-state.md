# Mandarin Mentor: System Architecture

**Stack Overview**
* Frontend: Next.js (App Router, TypeScript), Tailwind CSS, ReactMarkdown
* Backend: FastAPI (Python, Uvicorn)
* AI/ML Services: Groq Whisper API (STT), Gemini API (LLM), edge-tts (Audio)
* Database: PostgreSQL (Supabase / asyncpg)

**Core Data Pipelines**
* **Audio Capture (STT):** Feature-detected pipeline. Native `audio/webm` at 32kbps for Chromium/Android. iOS Safari bypasses `MediaRecorder` bugs using an `AudioContext` to downsample raw Float32 PCM to a 16-bit WAV client-side. Target latency: <1000ms TTFB.
* **Text Generation (LLM):** Gemini configured for Server-Sent Events (SSE) delta streaming. Outputs strict Markdown. **All HTML/XML tag formatting instructions have been removed** to prevent LLM context drift and hallucination.
* Session Hydration & Read/Write Lifecycle:
- Client-Driven Session Identity: The Next.js client generates and persists a standard UUID in `localStorage`.
- Authoritative Read Path (`GET /api/history`): On application mount, the client queries historical turns by dynamic `session_id` to hydrate conversation state and bypass the onboarding wizard.
- Streaming Write Path (`POST /api/chat`): Ingests the dynamic `session_id`, streaming Gemini response tokens over SSE while asynchronously committing user and assistant turns to PostgreSQL (`asyncpg`) without blocking TTFB.

**Audio Playback (TTS) & Concurrency Architecture**
* **Dual-tier Client Cache:** Tier 1: In-memory `Map<string, AudioBuffer>` / DOM Audio objects. Tier 2: `sessionStorage` (raw base64 audio data, keyed by raw Hanzi string hash) to eliminate redundant network egress.
* **Micro-Player Interception (Client-Side Hydration):** The Next.js frontend utilizes a deterministic text-node interceptor during the ReactMarkdown AST render cycle. CJK strings matching `/[\u4e00-\u9fff]+/g` are isolated, processed through a local dictionary (`pinyin-pro`) for phonetic annotation, and dynamically wrapped in `<TTSPlayer>` components.
* **Audio State Machine & Concurrency Control:**
  * **Singleton Playback Manager:** Only one active audio context or `HTMLAudioElement` may execute at any given time.
  * **Request Cancellation:** Triggering distinct Hanzi nodes aborts any inflight `POST /api/tts` HTTP fetch to prevent stale stream hydration.
  * **Deregistration / Teardown:** Unmounting micro-players pauses active nodes and revokes object URLs.

**Infrastructure & Deployment (Alpha)**
* **PWA Edge & Service Worker Caching:** Delivery via `@serwist/next` Service Worker and SVG `manifest.json`. `CacheFirst` for CJK fonts/static UI; `NetworkFirst` for SSE streams.
* **FastAPI Gateway & Security: Regional Asian node (Tokyo/Singapore). Rate Limiting is currently DISABLED (ADR-017) to prevent blocking the initial SSE yield. Must be re-implemented via non-blocking async architecture before public Beta.
* **Database Pipeline: PostgreSQL connection pooling via `asyncpg` attached to `app.state.pool`. Eliminates global session variables in favor of dynamic request-scoped UUIDs, resolving foreign key constraints and cross-user state collisions.