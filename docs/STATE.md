# Mandarin Mentor: Development Notes & Execution Roadmap[cite: 5]

**Local Runtime Commands**[cite: 5]
* Backend Gateway: `uvicorn main:app --reload --port 8000` (from `backend/`)[cite: 5]
* Frontend Client: `npm run dev` (from `frontend/`)[cite: 5]
* Release Automation: `npm run release` (from `frontend/`)[cite: 5]

---

## Architectural Priority Matrix

| Initiative                                   | Priority     | Strategy / Pros                                                                                                                                                                                                                   | Cons / Risks                                                                                                                     |
| :------------------------------------------- | :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Inline Audio Pill Bounding**               | **Critical** | Constrain inline `<TTSPlayer mode="inline">` mounting strictly to bold Markdown AST tokens (`strong` / `**...**`), allowing general conversational Hanzi in paragraphs to render pure ruby pinyin without actionable audio pills. | Requires splitting text hydrator logic between plain paragraph ruby rendering and actionable audio pill wrapping.                |
| **Client-Side TTS Hydration**                | **Stable**   | Deterministic AST interceptor in ReactMarkdown with memoized `pinyin-pro` dictionary cache (ADR-021) and isolated blockquote sentence cards (ADR-026).                                                                            | Resolved double-pinyin hydration and render lockups.                                                                             |
| **Persistent Storage (PostgreSQL)**          | **Stable**   | Supabase `asyncpg` connection pool with dynamic client UUIDs across history fetch, chat persistence, and reset endpoints (ADR-022).[cite: 4, 5]                                                                                   | Stable. FK constraints and multi-tenant isolation verified.[cite: 5]                                                             |
| **Gateway Security & Rate Limiting**         | **Critical** | Re-implement non-blocking rate limiting on `/api/chat`, `/api/tts`, and `/api/transcribe`. **Pros:** Hardens API keys against credit exhaustion.[cite: 5]                                                                         | **Currently stripped (ADR-017)**. Blocking Redis lookups destroyed sub-second TTFB. Needs an async/edge-based solution.[cite: 5] |
| **PWA Distribution & Audio Fallback Engine** | **Critical** | Next.js PWA (`manifest.json`, ServiceWorker cache) with client-side Web Audio PCM/WAV fallback (ADR-019).[cite: 5]                                                                                                                | Stable. Resolves iOS `MediaRecorder` codec failures.[cite: 5]                                                                    |
| **Audio Concurrency Control**                | **High**     | Sequential promise chain in streaming consumer to manage auto-play audio queue.[cite: 1, 5]                                                                                                                                       | Minor: Pre-fetching bold tokens may cause background fetch spikes on large responses.                                            |
| **Managed Authentication** | **Low** | Stateless JWT signature verification at FastAPI gateway layer. **Pros:** Offloads identity management. | Deferred to Beta. Risk of split-brain user identity vs database state prior to user accounts rollout. |
---

## Active Development Log

### Definition of Done (DoD) Checklist
- [x] **Scaffold & Build:** Database schemas, FastAPI routes, and Next.js client UI integration[cite: 5].
- [x] **E2E Validation:** Full session write/read lifecycle via Supabase (`POST /api/chat` -> PostgreSQL `asyncpg` -> `GET /api/history` client hydration)[cite: 2, 5].
- [x] **Reset Lifecycle:** Dynamic UUID routing for database session purge (`POST /api/reset`).
- [x] **TTS AST Engine:** Pure Markdown output, blockquote multi-line sentence splitting, single-border styling, and isolated pinyin cursor indexing.
- [x] **State Sync:** `STATE.md`, `system_architecture.md`, and `api_contracts.md` synchronized through ADR-028.

**Current Phase:** Pre-Alpha Hardening (Targeting Taichung Tester Network)[cite: 5]

### Active Backlog
1. **Constrain Inline Audio Pills:** Restrict `<TTSPlayer mode="inline">` strictly to bolded Markdown vocabulary tokens (`**Hanzi**`), allowing free-form Chinese text in paragraphs and explanations to display ruby pinyin without actionable audio buttons.
2. **Re-architect Redis Rate Limiting:** Implement non-blocking token-bucket rate limiter that fails open without delaying SSE stream connection.
3. **PWA Service Worker Verification:** Complete offline cache auditing and verify installability across mobile viewports.

### Technical Debt & Accepted Trade-offs
* **LLM Formatting Constraints Stripped (ADR-016 / ADR-020):** LLM emits pure Markdown. All layout, ruby annotation, and TTS bindings are derived client-side from the AST.
* **Unprotected API / Redis Stripped (ADR-017):** Rate-limiting middleware is bypassed to maintain sub-second TTFB. API must be hardened before public release[cite: 5].
* **Whisper Hallucinations (ADR-002):** Groq Whisper-large-v3-turbo occasionally hallucinates on ambient noise; filtered via entropy/length thresholds[cite: 2, 5].
* **CJK Font Fallback (ADR-001):** Native OS-level Kai fallbacks (BiaoKai / STKaiti) eliminate FOIT[cite: 5].