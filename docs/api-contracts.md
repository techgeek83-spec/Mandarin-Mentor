````
# Mandarin Mentor: API Contracts & Schemas

**1. Transcription Endpoint (`POST /api/transcribe`)**
* **Request:** `multipart/form-data` containing `file: UploadFile` (16kHz mono audio/webm or audio/wav).
* **Response:**
```json
{
  "text": "string" // Normalized transcription; empty string on low-entropy/hallucination filter
}
````

- - **Status Codes:** `200 OK`, `500 Internal Server Error`. _(Note: `429 Too Many Requests` currently disabled per ADR-017)._
    

**2. Chat Streaming Endpoint (`POST /api/chat`)**

- **Protocol:** Server-Sent Events (`text/event-stream`).
    
- **Request Payload:**
```json
{
  "messages": [
    { "role": "user" | "assistant", "content": "string" }
  ],
  "session_id": "string"
}
```
- **Payload Output Rules (ADR-016):**
    
    - The LLM outputs pure conversational text and standard Markdown.
        
    - **NO HTML TAGS ALLOWED.** The API will no longer emit `<ruby>`, `<rt>`, `<tts-inline>`, or `<tts-block>` wrappers.
        
- **Client-Side SSE Chunk Aggregation & Hydration Invariants:**
    
    - **Text Buffer Wait-State:** The client streaming consumer must buffer partial string chunks until a natural sentence or punctuation boundary is met.
        
    - **Contextual Hydration:** Complete phrases are required before execution of `pinyin-pro` dictionary lookups to prevent polyphone (多音字) mismatch.
        

**3. Synthesize Audio Endpoint (`POST /api/tts`)**

- **Request:**
    

JSON

```
{{
  "text": "string", // Pure Hanzi string extracted via client-side regex
  "voice": "zh-TW-HsiaoChenNeural" // Default fallback
}
}
```

- **Response:** JSON payload containing base64 encoded audio: `{"audio": "base64_encoded_string"}`
    
- **Resilience:** Automatic fallback to `zh-TW-HsiaoYuNeural` on primary upstream WebSocket failure (502).
    
- **Status Codes:** `200 OK`, `502 Bad Gateway` (Upstream TTS provider offline).

**4. Session History Endpoint (`GET /api/history`)**
- **Protocol:** HTTP GET
- **Query Parameters:** `?session_id=string`
- **Response:**
```json
{
  "messages": [
    { "role": "user" | "assistant", "content": "string", "timestamp": "ISO-8601" }
  ]
}
```

**Status Codes:** `200 OK`, `404 Not Found` (Session missing), `500 Internal Server Error`.

````

```bash
git commit -am "docs(architecture): enforce ADR-018 DoD protocol and append missing GET /api/history contract"
````

**[STATE SYNC REQUIRED]** Update `STATE.md`, `system_architecture.md`, and `api_contracts.md` to reflect these changes before starting a new task.

### E2E VALIDATION PAUSE

Execution halted. To resolve the active backlog blocker and finalize the Supabase E2E integration, provide the following **Context Snapshots**:

1. **FastAPI Backend:** The `asyncpg` query function and router definition for `GET /api/history` (or state "No GET route exists").
    
2. **Next.js Client:** The top 20-30 lines of `src/app/page.tsx` showing `useState`, `session_id` logic, and any mount `useEffect`.