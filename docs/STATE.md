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

### Definition of Done (DoD) Checklist (ADR-018)
- [x] **Scaffold & Build:** Complete database schemas, FastAPI routes, and Next.js client UI integration.
- [x] **E2E Validation:** Verified full session write/read lifecycle via Supabase (`POST /api/chat` -> PostgreSQL `asyncpg` -> `GET /api/history` client hydration).
- [x] **State Sync:** `STATE.md` and `api_contracts.md` updated to reflect the dynamic `session_id` read path.

**Current Phase:** Pre-Alpha Hardening (Targeting Taichung Tester Network)

### Active Backlog
1. Implement client-side regex parsing (`/[\u4e00-\u9fff]+/g`) within the ReactMarkdown AST to mount `<TTSPlayer>` components dynamically.
2. Build text-node buffering logic to evaluate Hanzi in complete phrases (preventing polyphone context loss in `pinyin-pro`).
3. Build text-node buffering logic to evaluate Hanzi in complete phrases (preventing polyphone context loss in `pinyin-pro`).
4. Re-architect Redis token-bucket rate limiting to fail open asynchronously without blocking the SSE stream yield.
5. Build Next.js PWA service worker with WebM/WAV audio capture fallback.

### Technical Debt & Accepted Trade-offs
* **LLM Formatting Constraints Stripped (ADR-016):** Relying on Flash Lite to output complex HTML/XML tags (`<ruby>`, `<tts-inline>`) caused continuous UI crashes. Formatting duties are now exclusively handled by the client.
* **Unprotected API / Redis Stripped (ADR-017):** Synchronous Redis rate-limiting was stripped to restore sub-second TTFB. API is currently vulnerable to token exhaustion.
* **Whisper Hallucinations (ADR-002):** Groq Whisper-large-v3-turbo occasionally hallucinates on ambient noise. 
* **CJK Font Fallback (ADR-001):** Utilizing native OS-level Kai fallbacks (BiaoKai / STKaiti) to eliminate FOIT.