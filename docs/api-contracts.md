# Mandarin Mentor: API Contracts & Schemas

> [!IMPORTANT]
> **Global Gateway Security (ADR-034)**
> All FastAPI endpoints (`/api/*`) require a valid Supabase Access Token passed via the `Authorization: Bearer <token>` header. Requests lacking this header or carrying expired/invalid signatures will immediately return `401 Unauthorized`.
> 
> **Edge Ingress & CORS Routing (ADR-036)** 
> Production edge hosting is live at `https://mandarin-mentor-api.fly.dev`. Dynamic CORS preflight (`OPTIONS /api/*`) enforces origin validation, credentials support (`Access-Control-Allow-Credentials: true`), and allows standard authorization headers.

**1. Transcription Endpoint (`POST /api/transcribe`)**
* **Request:** `multipart/form-data` containing `file: UploadFile` (16kHz mono audio/webm or audio/wav).
* **Headers:** `Authorization: Bearer <token>`
* **Response:**
```json
{
  "text": "string" // Normalized transcription; empty string on low-entropy/hallucination filter
}
```
- **Status Codes:** `200 OK`, `500 Internal Server Error`. _(Note: `429 Too Many Requests` currently disabled per ADR-017)._    

**2. Chat Streaming Endpoint (`POST /api/chat`)**

- **Protocol:** Server-Sent Events (`text/event-stream`).
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`    
- **Request Payload:**    

JSON

```json
  {
  "prompt": "string",
  "level": "string",
  "session_id": "string" // Dynamic client-generated UUID for transactional PostgreSQL persistence
}
```

- **Payload Output Rules (ADR-016 / ADR-025):**
    
    - The LLM outputs pure conversational text and standard Markdown.
        
    - **NO HTML/XML TAGS ALLOWED.** The API will never emit `<ruby>`, `<rt>`, `<tts-inline>`, or `<tts-block>` wrappers.
        
    - Dialogue lines and practice sentences MUST be formatted in standalone Markdown blockquotes (`>`) containing only the Chinese text.
        
    - English translations must appear on separate non-quoted lines directly below the blockquote.
        
    - Target vocabulary tokens must be wrapped in standard Markdown bold markers (`**捷運**`).
        
- **Client-Side SSE Chunk Aggregation & Hydration Invariants:**
    
    - **Global Pinyin Memoization (ADR-021):** Client utilizes an out-of-lifecycle `Map<string, string[]>` cache to prevent $O(N^2)$ CPU lockups during rapid SSE delta streaming.
        
    - **AST Node Interception (ADR-026 / ADR-027):** Blockquotes are parsed line-by-line to isolate multi-turn dialogues into independent `<TTSPlayer mode="block">` components using isolated Hanzi cursor indexing.
    - **Global Hydration Invariant (ADR-031):** The frontend hydrator parses all conversational and vocabulary CJK tokens in-place without requiring AST hierarchy differentiation between paragraphs and bold elements.
    - - **Status Codes:** `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.

**3. Synthesize Audio Endpoint (`POST /api/tts`)**

- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request:**
JSON

```
{ 
"text": "string", // Pure Hanzi string extracted via client-side regex "voice": "zh-TW-HsiaoChenNeural", // Default fallback "rate": "+0%" // Normalized edge-tts percentage string[cite: 1, 2] 
}
```

- **Response:** JSON payload containing base64 encoded audio: `{"audio": "base64_encoded_string"}`
    
    
    
- **Resilience:** Automatic fallback to `zh-TW-HsiaoYuNeural` on primary upstream WebSocket failure (502).
    
- - **Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`, `502 Bad Gateway` (Upstream TTS provider offline).
    

**4. Session History Endpoint (`GET /api/history`)**



- **Protocol:** HTTP GET
- **Headers:** `Authorization: Bearer <token>`    
- **Query Parameters:** `session_id=string` (Dynamic UUID)    
- **Response:**  

JSON

```
{
  "messages": [
    { "role": "user" | "assistant", "content": "string" }
  ]
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `404 Not Found` (Session missing), `500 Internal Server Error`.

**5. Session Reset Endpoint (`POST /api/reset`)**

- **Protocol:** HTTP POST
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`    
- **Request Payload (ADR-022):**    

JSON

```
{
  "session_id": "string" // Dynamic UUID targeting PostgreSQL records
}
```

- **Response:**
    

JSON

```
{
  "status": "success",
  "message": "Session history deleted from PostgreSQL"
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `500 Internal Server Error`.