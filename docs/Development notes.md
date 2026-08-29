# Mandarin Mentor: Development Notes & Execution Roadmap

**Local Runtime Commands**
- Backend Gateway: `uvicorn main:app --reload --port 8000` (from `backend/`)
- Frontend Client: `npm run dev` (from `frontend/`)
- Release Automation: `npm run release` (from `frontend/`)

---

## Architectural Priority Matrix

| Initiative | Priority | Strategy / Pros | Cons / Risks |
| :--- | :--- | :--- | :--- |
| **Gateway Security & Rate Limiting** | **Critical** | Implement Redis-backed token-bucket rate limiting on `/api/chat`, `/api/tts`, and `/api/transcribe`. **Pros:** Hardens Groq/Gemini API keys against credit exhaustion; protects Alpha infrastructure. | Overly aggressive bucket thresholds will throttle rapid micro-player lookups. |
| **PWA Distribution & Audio Fallback Engine** | **Critical** | Configure Next.js PWA (`manifest.json`, ServiceWorker cache) with client-side Web Audio PCM/WAV 16kHz downsampling fallback for iOS Safari. **Pros:** Frictionless web installation for Taichung testers; resolves iOS `MediaRecorder` codec failures. | Requires robust client-side MIME detection and AudioWorklet/WAV encoding overhead. |
| **Asian Regional Gateway Hosting** | **High** | Deploy FastAPI gateway on Fly.io/Railway pinned strictly to Tokyo or Singapore; Next.js frontend on Vercel Edge. **Pros:** Sub-second TTFB for regional testers in Taiwan; eliminates cross-ocean network overhead. | Incurs minimal compute costs; requires strict CORS origin locking. |
| **Audio Concurrency & SSE Stream Buffering** | **High** | Implement frontend singleton `AbortController` audio manager and stream buffer suppressing unclosed `<ruby>`/`<tts-*>` tags. **Pros:** Eliminates concurrent audio overlap and mid-stream Markdown HTML flashing. | Minimal client-side stream buffering overhead (<5ms). |
| **Persistent Storage (PostgreSQL)** | **Medium** | Migrate local JSON sessions to PostgreSQL (asyncpg connection pool). **Pros:** ACID compliance, horizontal scaling, multi-device history persistence. | Premature implementation adds setup friction to the immediate Alpha feedback loop. |
| **Managed Authentication (Clerk / Supabase Auth)** | **Medium** | Stateless JWT signature verification at FastAPI gateway layer. **Pros:** Offloads identity management; gates paid AI tiers; isolates user data. | Introduces split-brain user identity vs database state. |
| **Codebase Housekeeping & ADR Topology** | **Complete** | Standardized Obsidian ADR directory (`ADR-001` through `ADR-005`) with automated `.versionrc.json` environment sync. **Pros:** Verifiable paper trail of all architectural trade-offs. | N/A (Maintained incrementally). |

---

## Active Development Log

**Current Phase:** Pre-Alpha Hardening (Targeting Taichung Tester Network)

### Active Backlog
1. Implement Redis token-bucket rate limiting on FastAPI gateway routes.
2. Build Next.js PWA service worker with WebM/WAV audio capture fallback.
3. Integrate frontend singleton audio concurrency manager (`TTSPlayer` cleanup + `AbortController`).
4. Apply SSE stream buffer to sanitize `<ruby>` and custom `<tts-*>` tags before ReactMarkdown AST evaluation.

### Technical Debt & Accepted Trade-offs
* **Whisper Hallucinations (ADR-002):** Groq Whisper-large-v3-turbo occasionally hallucinates on ambient noise. Bypassing client-side audio volume gate to save mobile CPU/battery; monitoring via Alpha telemetry.
* **CJK Font Fallback (ADR-001):** Utilizing native OS-level Kai fallbacks (BiaoKai / STKaiti) instead of heavy web fonts to eliminate FOIT (Flash of Invisible Text) and mobile bandwidth consumption.
* **PWA vs Capacitor (ADR-004):** Deploying as a Progressive Web App (PWA) for the Alpha phase. Capacitor hybrid wrapper is deferred to Beta contingency if iOS WebKit audio capture failure rate exceeds 5%.
* **SSE Tag Flashing & Audio Race Conditions (ADR-005):** Buffering incomplete HTML/XML tags on the client stream and cancelling inflight TTS requests via a singleton audio coordinator.


# Mandarin Mentor: Development Notes & Execution Roadmap

**Local Runtime Commands**
- Backend Gateway: `uvicorn main:app --reload --port 8000` (from `backend/`)
- Frontend Client: `npm run dev` (from `frontend/`)
- Release Automation: `npm run release` (from `frontend/`)

---

## Architectural Priority Matrix

| Initiative | Priority | Strategy / Pros | Cons / Risks |
| :--- | :--- | :--- | :--- |
| **Client-Side TTS Hydration** | **Critical** | Implement deterministic AST interceptor in ReactMarkdown. Parse raw text nodes with CJK regex `/[\u4e00-\u9fff]+/g` and hydrate pinyin using `pinyin-pro`. **Pros:** Eliminates LLM tag leakage and hallucinatory wrapping. Drops API token costs. | Increases client-side CPU overhead. Requires text buffering on mobile to prevent main-thread layout thrashing. |
| **Gateway Security & Rate Limiting** | **Critical** | Re-implement non-blocking rate limiting on `/api/chat`, `/api/tts`, and `/api/transcribe`. **Pros:** Hardens API keys against credit exhaustion. | **Currently stripped (ADR-017)**. Blocking Redis lookups destroyed sub-second TTFB. Needs an async/edge-based solution. |
| **PWA Distribution & Audio Fallback Engine** | **Critical** | Configure Next.js PWA (`manifest.json`, ServiceWorker cache) with client-side Web Audio PCM/WAV fallback. **Pros:** Frictionless web installation; resolves iOS `MediaRecorder` codec failures. | Requires robust client-side MIME detection and AudioWorklet/WAV encoding overhead. |
| **Persistent Storage (PostgreSQL)** | **Stable** | Migrate local JSON sessions to PostgreSQL (asyncpg). **Pros:** Horizontal scaling, history persistence. | FK constraints now strictly resolved via dynamic session UUID lookup prior to message insertion. |
| **Audio Concurrency Control** | **High** | Implement frontend singleton `AbortController` audio manager. **Pros:** Eliminates concurrent audio overlap. | N/A. |
| **Managed Authentication** | **Medium** | Stateless JWT signature verification at FastAPI gateway layer. **Pros:** Offloads identity management. | Introduces split-brain user identity vs database state. |

---

## Active Development Log

**Current Phase:** Pre-Alpha Hardening (Targeting Taichung Tester Network)

### Active Backlog
1. Implement client-side regex parsing (`/[\u4e00-\u9fff]+/g`) within the ReactMarkdown AST to mount `<TTSPlayer>` components dynamically.
2. Build text-node buffering logic to evaluate Hanzi in complete phrases (preventing polyphone context loss in `pinyin-pro`).
3. Re-architect Redis token-bucket rate limiting to fail open asynchronously without blocking the SSE stream yield.
4. Build Next.js PWA service worker with WebM/WAV audio capture fallback.

### Technical Debt & Accepted Trade-offs
* **LLM Formatting Constraints Stripped (ADR-016):** Relying on Flash Lite to output complex HTML/XML tags (`<ruby>`, `<tts-inline>`) caused continuous UI crashes. Formatting duties are now exclusively handled by the client.
* **Unprotected API / Redis Stripped (ADR-017):** Synchronous Redis rate-limiting was stripped to restore sub-second TTFB. API is currently vulnerable to token exhaustion.
* **Whisper Hallucinations (ADR-002):** Groq Whisper-large-v3-turbo occasionally hallucinates on ambient noise. 
* **CJK Font Fallback (ADR-001):** Utilizing native OS-level Kai fallbacks (BiaoKai / STKaiti) to eliminate FOIT.