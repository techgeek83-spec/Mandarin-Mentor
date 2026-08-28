# Mandarin Mentor: System Architecture

**Stack Overview**
* Frontend: Next.js (App Router, TypeScript), Tailwind CSS, ReactMarkdown
* Backend: FastAPI (Python, Uvicorn)
* AI/ML Services: Groq Whisper API (STT), Gemini API (LLM), edge-tts (Audio)

**Core Data Pipelines**
** **Audio Capture (STT):** Feature-detected pipeline. Native `audio/webm` at 32kbps for Chromium/Android. iOS Safari bypasses `MediaRecorder` bugs using an `AudioContext` `ScriptProcessorNode` to downsample raw Float32 PCM to a 16-bit WAV client-side. Target latency: <1000ms TTFB.
* **Text Generation (LLM):** Gemini configured for Server-Sent Events (SSE) delta streaming. Prompt enforces exhaustive `<ruby>` tag wrapping for all Hanzi.
Audio Playback (TTS) & Concurrency Architecture:
- **Dual-tier Client Cache:** Tier 1: In-memory `Map<string, AudioBuffer>` / DOM Audio objects (instant replay). Tier 2: `sessionStorage` (raw base64 audio data, keyed by raw Hanzi string hash) to eliminate redundant network egress across page navigations.
- **Micro-Player Interception:** Unified `<TTSPlayer>` component intercepts explicitly routed `<tts-inline text="...">` and `<tts-block text="...">` tags emitted by the LLM AST.
- **Audio State Machine & Concurrency Control:**
  - **Singleton Playback Manager:** Only one active audio context or `HTMLAudioElement` may execute at any given time across all rendered `<TTSPlayer>` instances.
  - **Request Cancellation:** Rapid triggering of distinct Hanzi nodes must trigger an immediate `AbortController.abort()` on any inflight `POST /api/tts` HTTP fetch to prevent stale stream hydration.
  - **Deregistration / Teardown:** Unmounting micro-players or streaming re-renders must pause active audio nodes and revoke object URLs (`URL.revokeObjectURL`) to prevent browser memory leaks.

Infrastructure & Deployment (Alpha)

PWA Edge & Service Worker Caching:
- Delivery: Progressive Web App (PWA) powered by `@serwist/next` Service Worker and SVG `manifest.json` for frictionless Taichung Alpha distribution.
- Static Assets & Fonts: `CacheFirst` strategy for CJK fonts and static UI chunks to eliminate FOIT (Flash of Invisible Text).
- Audio Blobs: DOM Audio -> SessionStorage caching with LRU eviction to prevent device storage bloat.
- Network APIs: `NetworkFirst` strategy for SSE streams and STT endpoints.

FastAPI Gateway & Security:
- Hosting: Regional Asian node (Tokyo/Singapore) to drastically cut STT/TTS TTFB.
- Rate Limiting: Token-bucket algorithm (Redis Lua script) applied at the route level to protect API credits. `/api/chat` (10 cap, 0.2/sec), `/api/tts` (40 cap, 1.0/sec), `/api/transcribe` (15 cap, 0.33/sec). Gracefully fails open during local dev if Redis is unreachable.
- Database: PostgreSQL (asyncpg connection pool) migrating from local JSON for persistent sessions.