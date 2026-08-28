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

- **Status Codes:** `200 OK`, `429 Too Many Requests` (Redis Token Bucket), `500 Internal Server Error` (Groq failure).
    
2. Chat Streaming Endpoint (`POST /api/chat`)

* **Protocol:** Server-Sent Events (`text/event-stream`).
* **Request Payload:**
```json
{
  "messages": [
    { "role": "user" | "assistant", "content": "string" }
  ],
  "session_id": "string"
}
```
- **Payload Output Rules:**
    
    - All Hanzi MUST be wrapped in explicit `<ruby>漢字<rt>pīnyīn</rt></ruby>` tags.
        
    - Audio triggers MUST be formatted as `<tts-inline text="漢字">` or `<tts-block text="漢字">`.
        
- **Client-Side SSE Chunk Aggregation & HTML Tag Boundary Invariants:**
    
    - **Tag Split Buffer:** LLM token chunks can split across `<ruby>`, `<rt>`, or `<tts-inline>` boundaries (e.g., Chunk 1: `<tts-in`, Chunk 2: `line text="你好">`).
        
    - **Parser Sanitization:** The client streaming consumer must buffer partial tag matches matching `/<\/?(?:ruby|rt|rp|tts-inline|tts-block)?[^>]*$/` before feeding the string to `ReactMarkdown`.
        
    - **Render State:** Incomplete tags must NOT be evaluated by the markdown AST parser mid-stream to prevent raw HTML string flashing and broken DOM tree re-renders.
    - 
**3. Synthesize Audio Endpoint (`POST /api/tts`)**

- **Request:**
    

JSON

```
{
  "text": "string", // Pure Hanzi string extracted via client-side regex
  "voice": "zh-TW-HsiaoChenNeural" // Default fallback
}
```

- **Response:** JSON payload containing base64 encoded audio: `{"audio": "base64_encoded_string"}`
- **Resilience:** Automatic fallback to `zh-TW-HsiaoYuNeural` on primary upstream WebSocket failure (502).
- **Status Codes:** `200 OK`, `429 Too Many Requests`, `502 Bad Gateway` (Upstream TTS provider offline).