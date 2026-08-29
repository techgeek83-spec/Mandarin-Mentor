# Mandarin Mentor: System Architecture

**Stack Overview**
* Frontend: Next.js (App Router, TypeScript), Tailwind CSS, ReactMarkdown
* Backend: FastAPI (Python, Uvicorn)
* AI/ML Services: Groq Whisper API (STT), Gemini API (LLM), edge-tts (Audio)
* Database: PostgreSQL (Supabase / asyncpg)

**Core Data Pipelines**
* **Audio Capture (STT):** Feature-detected pipeline. Native `audio/webm` at 32kbps for Chromium/Android. iOS Safari bypasses `MediaRecorder` bugs using an `AudioContext` to downsample raw Float32 PCM to a 16-bit WAV client-side. Target latency: <1000ms TTFB.
* **Text Generation (LLM):** Gemini configured for Server-Sent Events (SSE) delta streaming. Outputs strict Markdown. **All HTML/XML tag formatting instructions have been removed** to prevent LLM context drift and hallucination.

**Audio Playback (TTS) & Concurrency Architecture**
* **Dual-tier Client Cache:** Tier 1: In-memory `Map<string, AudioBuffer>` / DOM Audio objects. Tier 2: `sessionStorage` (raw base64 audio data, keyed by raw Hanzi string hash) to eliminate redundant network egress.
* **Micro-Player Interception (Client-Side Hydration):** The Next.js frontend utilizes a deterministic text-node interceptor during the ReactMarkdown AST render cycle. CJK strings matching `/[\u4e00-\u9fff]+/g` are isolated, processed through a local dictionary (`pinyin-pro`) for phonetic annotation, and dynamically wrapped in `<TTSPlayer>` components.
* **Audio State Machine & Concurrency Control:**
  * **Singleton Playback Manager:** Only one active audio context or `HTMLAudioElement` may execute at any given time.
  * **Request Cancellation:** Triggering distinct Hanzi nodes aborts any inflight `POST /api/tts` HTTP fetch to prevent stale stream hydration.
  * **Deregistration / Teardown:** Unmounting micro-players pauses active nodes and revokes object URLs.

**Infrastructure & Deployment (Alpha)**
* **PWA Edge & Service Worker Caching:** Delivery via `@serwist/next` Service Worker and SVG `manifest.json`. `CacheFirst` for CJK fonts/static UI; `NetworkFirst` for SSE streams.
* **FastAPI Gateway & Security:** Regional Asian node (Tokyo/Singapore). **Rate Limiting is currently DISABLED (ADR-017)** to prevent blocking the initial SSE yield. Must be re-implemented via non-blocking async architecture before public Beta.
* **Database Pipeline:** Session UUIDs are dynamically resolved (`get_or_create_session`) prior to background asynchronous message insertion to strictly prevent PostgreSQL foreign key constraint violations.