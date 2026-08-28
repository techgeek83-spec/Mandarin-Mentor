import os
import json
import base64
import asyncio

from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pydantic import BaseModel
from rate_limiter import limiter, rate_limit
from database import init_db_pool, close_db_pool

# Architecture Note: Manage lifecycle events for Redis connection pool and asyncpg PostgreSQL pool cleanly. Binds the asyncpg connection pool to the ASGI application lifecycle to prevent connection leaks during worker reloads.
@asynccontextmanager
async def lifespan(app: FastAPI):
    await limiter.init_redis()
    app.state.pool = await init_db_pool()
    yield
    await close_db_pool(app.state.pool)
    await limiter.close()

from google import genai
from google.genai import types
import edge_tts
from groq import AsyncGroq

from fastapi import Request
from chat_store import load_session, save_message, clear_session

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Fatal: GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=GEMINI_API_KEY)
app = FastAPI(title="Mandarin Mentor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_ID = "mandarin_session"

# Architecture Note: Dynamic System Prompt generator scaling instructional language and pinyin density based on client proficiency, while strictly enforcing Markdown/AST routing constraints against English hallucination.
def get_system_prompt(proficiency: str) -> str:
    # Architecture Note: Maps custom frontend UI capability strings directly to LLM instruction tone.
    if "我知道" in proficiency:
        tone = "Use primarily Taiwanese Mandarin for explanations, resorting to English only for complex nuance."
    elif "Ordering Food" in proficiency:
        tone = "Use a mix of simple Taiwanese Mandarin and English for explanations."
    else:
        tone = "Use plain English for all explanations, feedback, and questions."

    return f"""
# Role & Persona
You are a friendly, patient Taiwanese Mandarin language coach for adult expats.

# Instructional Medium & Tone ({proficiency} Level)
{tone}
Never write conversational sentences in unannotated Chinese.

# Phonetics & CJK Display (FATAL UI CRASH IF IGNORED)
You MUST wrap ALL Traditional Chinese characters in standard HTML ruby tags with their corresponding pinyin.
This strictly includes ALL grammatical particles and structural characters (e.g., 的, 了, 嗎, 在). Do not skip a single character.
Format strictly as: <ruby>捷運<rt>jié yùn</rt></ruby>. 
NEVER output pinyin in parentheses following the characters.

# EXHAUSTIVE PINYIN REQUIREMENT (FATAL UI CRASH IF IGNORED)
You MUST wrap EVERY SINGLE Chinese character in `<ruby>` tags, no exceptions. Do not skip common grammar particles (like 的, 了, 在, 是). Format strictly as: <ruby>捷運<rt>jié yùn</rt></ruby>. NEVER output pinyin in parentheses.

# Target Vocabulary & Audio Setup (STRICT DELIMITER CONSTRAINTS)
1. INLINE AUDIO: When listing isolated vocabulary or short grammar points, you MUST wrap the Chinese text and its ruby tags in `<tts-inline>...</tts-inline>`.
2. BLOCK AUDIO: You MUST wrap EVERY full sentence, dialogue line, or conversational Mandarin phrase in `<tts-block>...</tts-block>`.
3. NO ENGLISH AUDIO: NEVER wrap English text inside `<tts-inline>` or `<tts-block>`. These tags are EXCLUSIVELY used to trigger the Chinese edge-tts player.

REQUIRED FORMAT PATTERN:
Dialogue:
<tts-block>A: <ruby>請<rt>qǐng</rt></ruby><ruby>問<rt>wèn</rt></ruby>，<ruby>捷運<rt>jié yùn</rt></ruby><ruby>站<rt>zhàn</rt></ruby><ruby>在<rt>zài</rt></ruby><ruby>哪<rt>nǎ</rt></ruby>？</tts-block>
<tts-block>B: <ruby>就<rt>jiù</rt></ruby><ruby>在<rt>zài</rt></ruby><ruby>前<rt>qián</rt></ruby><ruby>面<rt>miàn</rt></ruby>。</tts-block>

Vocabulary Breakdown:
* <tts-inline><ruby>捷運<rt>jié yùn</rt></ruby></tts-inline> - MRT / subway
* <tts-inline><ruby>前<rt>qián</rt></ruby><ruby>面<rt>miàn</rt></ruby></tts-inline> - Ahead / in front
"""

# Architecture Note: Consolidated try/except block.

class ChatRequest(BaseModel):
    prompt: str  # Delta payload: Only receive the newest message
    level: str = "Beginner" # Architecture Note: Client-provided proficiency state to drive dynamic prompt scaffolding.

class TTSRequest(BaseModel):
    text: str
    voice: str = "zh-TW-HsiaoChenNeural"
    rate: str = "+0%"

@app.post("/api/transcribe", dependencies=[Depends(rate_limit(capacity=15, refill_rate=0.33))])
async def transcribe_audio(file: UploadFile = File(...)):
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API key not configured on backend.")
    
    try:
        audio_bytes = await file.read()
        # Architecture Note: explicitly set temperature=0.0 to force greedy decoding and prevent latency spikes from fallback sampling loops. Upgraded to turbo model for reduced TTFB.
        transcription = await groq_client.audio.transcriptions.create(
            file=(file.filename or "audio.webm", audio_bytes),
            model="whisper-large-v3-turbo",
            response_format="json",
            temperature=0.0,
            prompt="繁體中文, 台灣用語, English, code-switching. Examples: 'Can you help me with 我的中文說得不好?', 'What does 你好 mean?', 'Let's practice 吃吧.'"
        )
        text = transcription.text.strip()

        # Hallucination filter for empty/low-entropy audio
        hallucination_patterns = [
            "subtitles by the amara.org community",
            "amara.org",
            "咳嗽",
            "thank you",
            "thanks for watching",
        ]
        if any(pattern in text.lower() for pattern in hallucination_patterns) or len(text) < 2:
            text = ""
            return {"text": ""}

        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    
@app.get("/api/chat")
async def get_session_history(request: Request):
    """Authoritative read-only hydration endpoint backed by PostgreSQL."""
    pool = request.app.state.pool
    history = await load_session(pool, SESSION_ID)
    return {"messages": history if history else []}

# Architecture Note: Streams raw token chunks over SSE without blocking server thread
@app.post("/api/chat", dependencies=[Depends(rate_limit(capacity=10, refill_rate=0.2))])
async def chat_stream(http_request: Request, request: ChatRequest):
    pool = http_request.app.state.pool
    history_records = await load_session(pool, SESSION_ID) or []
    
    # Architectural Note: Fire user message persistence asynchronously to remove WAN round-trip latency from the TTFB critical path.
    asyncio.create_task(save_message(pool, SESSION_ID, "user", request.prompt))
    history_records.append({"role": "user", "content": request.prompt})
    
    # 2. Non-destructive payload generation (strictly the last 10 turns)
    MAX_CONTEXT = 10
    gemini_payload = history_records[-MAX_CONTEXT:]
    
    # 3. Build SDK contents using the TRUNCATED payload
    contents = [
        types.Content(
            role="model" if msg["role"] == "assistant" else "user",
            parts=[types.Part.from_text(text=msg["content"])]
        )
        for msg in gemini_payload
    ]

    async def event_stream():
        full_response = ""
        try:
            # Architectural Note: Target gemini-2.5-flash-lite (or gemini-flash-lite-latest) with direct streaming generation.
            response_stream = await client.aio.models.generate_content_stream(
                model="gemini-flash-lite-latest", 
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=get_system_prompt(request.level),
                    temperature=0.7
                )
            )
            async for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = f"Gemini Stream Error: {str(e)}"
            print(error_msg)
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
            yield "data: [DONE]\n\n"
            
        finally:
            # Architectural Note: Offload assistant response persistence to background task upon stream termination.
            if full_response:
                asyncio.create_task(save_message(pool, SESSION_ID, "assistant", full_response))

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.post("/api/reset")
async def reset_session(request: Request):
    """Architectural Note: Purges active session state directly from PostgreSQL tables."""
    pool = request.app.state.pool
    try:
        await clear_session(pool, SESSION_ID)
        return {"status": "success", "message": "Session history deleted from PostgreSQL"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset database session: {str(e)}")

@app.post("/api/tts", dependencies=[Depends(rate_limit(capacity=40, refill_rate=1.0))])
async def generate_tts(request: TTSRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text payload required")
    try:
        # Architecture Note: Sanitizes rate parameter to strictly enforce edge-tts [+-]XX% format, converting invalid numeric strings (like '1' or '1x') to the baseline '+0%'.
        safe_rate = request.rate.strip()
        if safe_rate in ["1", "1.0", "1x"] or not safe_rate.endswith("%"):
            safe_rate = "+0%"
        elif not safe_rate.startswith(("+", "-")):
            safe_rate = f"+{safe_rate}"

        # Architecture Note: Default to HsiaoChen; if synthesis yields no bytes or errors, fallback to HsiaoYu to ensure audio continuity.
        audio_data = b""
        
        # Architecture Note: Isolate primary TTS attempt. edge-tts raises a hard exception if the 
        # MS WebSocket drops. We must catch it locally so it does not bypass the fallback logic.
        try:
            communicate = edge_tts.Communicate(request.text, request.voice, rate=safe_rate)
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
        except Exception as primary_err:
            print(f"[TTS Warning] Primary voice {request.voice} failed ({primary_err}). Triggering HsiaoYu fallback.")
            audio_data = b""

        if not audio_data:
            try:
                fallback = edge_tts.Communicate(request.text, "zh-TW-HsiaoYuNeural", rate=safe_rate)
                async for chunk in fallback.stream():
                    if chunk["type"] == "audio":
                        audio_data += chunk["data"]
            except Exception as fallback_err:
                raise HTTPException(status_code=502, detail=f"TTS upstream failed entirely on all voices: {fallback_err}")

        if not audio_data:
            raise HTTPException(status_code=502, detail="TTS upstream service produced empty audio stream.")

        b64_audio = base64.b64encode(audio_data).decode('utf-8')
        return {"audio": b64_audio}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
