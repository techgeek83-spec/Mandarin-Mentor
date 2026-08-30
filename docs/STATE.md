# Mandarin Mentor: Development Notes & Execution Roadmap

**Local Runtime Commands**
* Backend Gateway: `uvicorn main:app --reload --port 8000` (from `backend/`)
* Frontend Client: `npm run dev` (from `frontend/`)
* Release Automation: `npm run release` (from `frontend/`)

---

## Architectural Priority Matrix

| Initiative | Priority | Strategy / Pros | Cons / Risks |
| :--- | :--- | :--- | :--- |
| **Inline Audio Pill Bounding** | **Deprecated** | Formally abandoned via ADR-031. Preserves global CJK hydration (`/[\u4e00-\u9fff]+/g`) to prevent recursive AST destruction and component crashes. | Minor: Conversational Hanzi retains inline audio micro-players alongside targeted vocabulary. |
| **Client-Side TTS Hydration** | **Stable** | Deterministic AST interceptor in ReactMarkdown with memoized `pinyin-pro` dictionary cache (ADR-021) and isolated blockquote sentence cards (ADR-026). | Resolved double-pinyin hydration and render lockups. |
| **Persistent Storage (PostgreSQL)** | **Stable** | Supabase `asyncpg` connection pool with dynamic client UUIDs across history fetch, chat persistence, and reset endpoints (ADR-022). | Stable. FK constraints and multi-tenant isolation verified. |
| **Gateway Security & Rate Limiting** | **Critical** | Re-implement non-blocking rate limiting on `/api/chat`, `/api/tts`, and `/api/transcribe`. **Pros:** Hardens API keys against credit exhaustion. | **Currently stripped (ADR-017)**. Blocking Redis lookups destroyed sub-second TTFB. Needs an async/edge-based solution. |
| **PWA Distribution & Audio Fallback Engine** | **Critical** | Next.js PWA (`manifest.json`, ServiceWorker cache) with client-side Web Audio PCM/WAV fallback (ADR-019). | Stable. Resolves iOS `MediaRecorder` codec failures. |
| **Audio Concurrency Control** | **High** | Sequential promise chain in streaming consumer to manage auto-play audio queue[cite: 1]. | Minor: Pre-fetching bold tokens may cause background fetch spikes on large responses. |
| **Managed Authentication** | **Low** | Stateless JWT signature verification at FastAPI gateway layer. **Pros:** Offloads identity management. | Deferred to Beta. Risk of split-brain user identity vs database state prior to user accounts rollout. |

## Active Development Log

### Definition of Done (DoD) Checklist
- [x] **Scaffold & Build:** Database schemas, FastAPI routes, and Next.js client UI integration.
- [x] **E2E Validation:** Full session write/read lifecycle via Supabase (`POST /api/chat` -> PostgreSQL `asyncpg` -> `GET /api/history` client hydration).
- [x] **Reset Lifecycle:** Dynamic UUID routing for database session purge (`POST /api/reset`).
- [x] **TTS AST Engine:** Pure Markdown output, blockquote multi-line sentence splitting, single-border styling, and isolated pinyin cursor indexing.
- [x] **State Sync:** `STATE.md`, `system_architecture.md`, and `api_contracts.md` synchronized through ADR-028.
- [x] *Global Hydration Invariant (ADR-031):** The frontend hydrator parses all conversational and vocabulary CJK tokens in-place without requiring AST hierarchy differentiation between paragraphs and bold elements.

**Current Phase:** Pre-Alpha Hardening (Targeting Taichung Tester Network)

### Active Backlog
1. **Fly.io & Vercel Cloud Deployment:** Containerize the FastAPI backend for Fly.io (`nrt`/`sin` regions) and deploy the Next.js frontend to Vercel.
2. **Static API Gateway Security (ADR-032):** Implement a lightweight pre-shared key (PSK) header validation on all FastAPI routes to protect Groq/Gemini endpoints from public abuse prior to full JWT rollout.
3. **Constrain Inline Audio Pills:** Restrict `<TTSPlayer mode="inline">` strictly to bolded Markdown vocabulary tokens (`**Hanzi**`), allowing free-form Chinese text in paragraphs and explanations to display ruby pinyin without actionable audio buttons.
4. **Re-architect Redis Rate Limiting:** Implement non-blocking token-bucket rate limiter that fails open without delaying SSE stream connection.
5. **PWA Service Worker Verification:** Complete offline cache auditing and verify installability across mobile viewports.
6. **Frontend Lockdown & Sync:** Verify baseline stability across all mobile viewports following the ADR-031 stabilization.

### Technical Debt & Accepted Trade-offs
* **LLM Formatting Constraints Stripped (ADR-016 / ADR-020):** LLM emits pure Markdown. All layout, ruby annotation, and TTS bindings are derived client-side from the AST.
* **Unprotected API / Redis Stripped (ADR-017):** Rate-limiting middleware is bypassed to maintain sub-second TTFB. API must be hardened before public release.
* **Whisper Hallucinations (ADR-002):** Groq Whisper-large-v3-turbo occasionally hallucinates on ambient noise; filtered via entropy/length thresholds.
* **CJK Font Fallback (ADR-001):** Native OS-level Kai fallbacks (BiaoKai / STKaiti) eliminate FOIT.
* **Global CJK Audio Interception (ADR-031):** To prevent recursive double-hydration loops and maintain AST stability, all Chinese character strings instantiate inline audio micro-players rather than strictly isolated bold vocabulary tokens.