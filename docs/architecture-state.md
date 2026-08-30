# Mandarin Mentor: System Architecture

**Stack Overview**
* **Frontend:** Next.js (App Router, TypeScript), Tailwind CSS, ReactMarkdown
* **Backend:** FastAPI (Python, Uvicorn)
* **AI/ML Services:** Groq Whisper API (`whisper-large-v3-turbo`), Gemini API (`gemini-flash-lite-latest`), `edge-tts` (Asynchronous Audio)
* **Database:** PostgreSQL via Supabase (`asyncpg` connection pool)

---

**Core Data Pipelines**
* **Audio Capture (STT):** Feature-detected pipeline. Native `audio/webm` at 32kbps for Chromium/Android. iOS Safari bypasses `MediaRecorder` payload corruption using an `AudioContext` to downsample raw Float32 PCM to a 16-bit WAV client-side. Target latency: <1000ms TTFB.
* **Text Generation (LLM):** Gemini API configured for Server-Sent Events (SSE) delta streaming. Emits strict Markdown with zero XML/HTML formatting tags (ADR-016, ADR-020).
* **Session Hydration & Read/Write Lifecycle:**
  * **Client-Driven Identity:** Next.js client generates and persists a standard UUID in `localStorage`.
  * **Authoritative Read Path (`GET /api/history`):** On application mount, the client queries historical turns by dynamic `session_id` to hydrate conversation state and bypass the onboarding wizard.
  * **Streaming Write Path (`POST /api/chat`):** Ingests the dynamic `session_id`, streaming Gemini response tokens over SSE while asynchronously committing user and assistant turns to PostgreSQL (`asyncpg`) without blocking TTFB.
  * **Authoritative Purge Path (`POST /api/reset`):** Executes asynchronous deletion across PostgreSQL session tables targeting the specific dynamic UUID (ADR-022).

---

**Audio Playback (TTS) & Client AST Hydration Architecture**
* **Dual-tier Client Cache:** 
  * Tier 1: In-memory `Map<string, AudioBuffer>` / DOM Audio instances.
  * Tier 2: `sessionStorage` (raw base64 audio data, keyed by `tts_cache_{voice}_{rate}_{text}`) to eliminate redundant network egress.
* **Client-Side AST Parsing & Pinyin Injection:**
  * **Memoization Cache (ADR-021):** Global `pinyinDictCache` (`Map<string, string[]>`) stores evaluated pinyin arrays outside the component lifecycle to prevent $O(N^2)$ render lockups during active token streaming.
  * **Blockquote Sentence Player (ADR-023, ADR-024, ADR-026):** ReactMarkdown `blockquote` AST renderer splits multi-line dialogue strings by `\n`. Each non-empty line with Hanzi mounts an isolated `<TTSPlayer mode="block">` containing custom ruby character alignment. Non-CJK lines (English translations) render as plain text without audio triggers.
  * **Isolated Hanzi Cursor Indexing (ADR-027):** Character-by-character mapping consumes a pure Hanzi pinyin array via a local cursor index, preventing ruby offset drift on punctuation or whitespace.
  * **Global CJK Text Hydration (ADR-031):** Client-side inline hydration intercepts all Hanzi text nodes via regex (`/[\u4e00-\u9fff\u3000-\u303F\uFF00-\uFFEF]+/g`) to render `<ruby>` pinyin and mount inline `<TTSPlayer mode="inline">` micro-players. Direct AST overrides on `strong` nodes are permanently deprecated to eliminate AST double-hydration collisions and DOM recursion shredding.
* **Audio State Machine & Concurrency Control:**
  * **Singleton Playback Queue:** Sequential promise chain prevents overlapping audio playback during auto-play streaming.
  * **Speculative Pre-fetching:** Client-side scanner detects bolded Hanzi tokens (`**...**`) in completed stream buffers and pre-fetches binary audio into `sessionStorage`.

---

**Infrastructure & Deployment (Alpha)**
* **Frontend (Vercel):** Edge CDN deployment for Next.js App Router and `@serwist/next` Service Worker caching.
* **Backend (Fly.io):** Persistent Dockerized micro-VMs deployed to `nrt` (Tokyo) or `sin` (Singapore) to ensure sub-50ms network latency.
* **Database (Supabase):** PostgreSQL connection pooling via `asyncpg` strictly routed through the Supavisor transaction pooler (port `6543`) to prevent connection exhaustion.
* **Gateway Security:** Rate Limiting is currently DISABLED (ADR-017). Protected temporarily by a static Pre-Shared Key (PSK) authentication header (ADR-032) to prevent unauthorized API execution.