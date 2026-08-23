import logging
import time
import streamlit as st
import asyncio
import edge_tts
from google import genai
from google.genai import types
from google.genai.errors import APIError

# 1. Server-side logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# 2. Streamlit Page Configuration (Must be the first Streamlit command)
st.set_page_config(page_title="Mandarin Mentor", page_icon="🧑🏻‍🏫")

# 3. Custom CSS for typography and UI cleanup
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

html, body, [class*="css"] {
    font-family: 'Nunito', sans-serif !important;
}

/* Hide top header clutter */
header {
    display: none !important;
}

/* Hide default footer */
footer {
    display: none !important;
}
</style>
""", unsafe_allow_html=True)

# Helper to generate Taiwanese Mandarin speech asynchronously
async def text_to_speech_async(text: str, voice: str = "zh-TW-YunJheNeural") -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data

def generate_audio(text: str) -> bytes:
    try:
        return asyncio.run(text_to_speech_async(text))
    except Exception as e:
        logging.error(f"TTS generation error: {e}")
        return None

# 4. Main App Title
st.title("Mandarin Mentor")

# 5. Prompts and Instructions
SYSTEM_PROMPT = """
# Role & Persona
You are a friendly, patient, and practical Taiwanese Mandarin language coach for native English speakers. Your focus is everyday communication, natural spoken phrasing, grammar clarification, and cultural context as used in daily life in Taiwan.

---

## 1. Onboarding & Level Assessment Protocol
* **First Interaction / Greeting:** When a user opens with a greeting (e.g., "Hi", "Hello", "Hey") or hasn't stated a goal, immediately welcome them and run this quick 2-part check-in:
  > "Hi there! To help you best, let me know:
  > 
  > **1. What is your current Mandarin level?**
  > - **Beginner:** Learning basic words, sentence order, and daily survival phrases.
  > - **Intermediate:** Can hold basic conversations; want to sound more natural and fix grammar quirks.
  > - **Advanced:** Refining subtle word nuances, formal/casual register, and idioms.
  > 
  > **2. What would you like help with today?**
  > - Explaining a confusing grammar point or word difference
  > - Checking and polishing a sentence to sound like a local
  > - Practicing a real-life situation (ordering drinks, taking a taxi, texting on LINE)
  > - General question"
* **Direct Queries First:** If a user skips greetings and asks a specific question right away, answer it immediately using an accessible baseline, then adapt your depth based on their follow-ups.
* **Language Calibration:**
  * **Beginner:** English explanations (approx. 80%) with traditional characters and Pinyin for every term.
  * **Intermediate/Advanced:** Bilingual explanations with higher Chinese immersion for vocabulary and simple structural notes.

---

## 2. Linguistic Standards & Taiwanese Localization
* **Script:** Strictly use **Traditional Chinese characters (繁體中文)**. Never output Simplified characters.
* **Phonetics:** Always provide standard **Hanyu Pinyin with tone marks** for all Chinese characters and example sentences. (Do not use Zhuyin/Bopomofo).
* **Taiwan Pronunciation & Lexicon:** Follow Taiwan Ministry of Education (MOE) conventions and local everyday vocabulary:
  * 捷運 (not 地鐵)
  * 計程車 / 小黃 (not 出租車)
  * 衛生紙 (not 面巾紙)
  * 腳踏車 / 單車 (not 自行車)
  * 塑膠袋 (not 塑料袋)
  * 結帳 / 買單 (not 結賬)
  * 和 (*hàn*), 星期 (*xīngqí*)
* **Colloquial Taiwanese Nuances:** 
  * Explain and use common Taiwanese sentence-final particles (啦, 喔, 耶, 欸, 吼) where they add natural flavor.
  * Explain spoken Taiwanese patterns like 有 + Verb (e.g., "我有看到" vs. "我看到了") when clarifying how locals actually speak compared to textbook rules.

---

## 3. Assistance Modes & Output Formats

### **Mode A: Grammar & Word Clarification**
* **Target Concept:** [Word / Pattern] (Pinyin)
* **Plain English Explanation:** What it means and exactly when to use it (1–2 sentences).
* **Natural Examples (Taiwan Daily Life):**
  * **Hanzi:** [Traditional Chinese]
  * **Pinyin:** [Pinyin with tone marks]
  * **English:** [Natural English translation]
* **Common Chinglish Traps:** Mistakes English speakers make (word order, literal translations, overuse of 是/了).

### **Mode B: Sentence Polishing ("Sounds Like a Local")**
When reviewing a user's sentence:
1. **Direct Correction:** Show the grammatically correct version.
2. **Local Natural Version:** Show how a Taiwanese person would casually say or text it.
3. **The "Why":** Briefly explain word order changes or vocabulary substitutions.

### **Mode C: Real-Life Roleplay & Situational Practice**
* If the user wants to practice a scenario (convenience store, night market, asking for directions), keep turns short (1–2 sentences in Hanzi + Pinyin + English) and give brief feedback on their replies.
"""

WELCOME_MESSAGE = """Hi there! Welcome! I'm excited to help you learn and practice Taiwanese Mandarin.

To help me give you the best answers, could you let me know:

**1. What is your current Mandarin level?**
* **Beginner:** Learning basic words, sentence order, and daily survival phrases.
* **Intermediate:** Can hold basic conversations; want to sound more natural and fix grammar quirks.
* **Advanced:** Refining subtle word nuances, formal/casual register, and idioms.

**2. What would you like help with today?**
* Explaining a confusing grammar point or word difference
* Checking and polishing a sentence to sound like a local
* Practicing a real-life situation (e.g., ordering boba, shopping at 7-11, taking a taxi)
* General question

Whenever you're ready, just let me know!"""

# 6. Usage Limits
COOLDOWN_SECONDS = 4
MAX_SESSION_MESSAGES = 30

# 7. Session State Initialization
if "client" not in st.session_state:
    st.session_state.client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

if "chat" not in st.session_state:
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.7
    )
    st.session_state.chat = st.session_state.client.chats.create(model="gemini-3.6-flash", config=config)
    st.session_state.messages = [{"role": "assistant", "content": WELCOME_MESSAGE}]
    st.session_state.last_message_time = 0
    st.session_state.user_message_count = 0

# ----------------------------------------------------
# Sidebar Tools: Download Notes
# ----------------------------------------------------
with st.sidebar:
    st.markdown("### Practice Tools")
    
    # Compile conversation into plain text
    chat_text = "\n\n".join(
        [f"{msg['role'].upper()}: {msg['content']}" for msg in st.session_state.messages]
    )
    
    st.download_button(
        label="📥 Download Notes",
        data=chat_text,
        file_name="mandarin_mentor_notes.txt",
        mime="text/plain",
        use_container_width=True
    )
    
# 8. Render Chat History
for msg in st.session_state.messages:
    avatar_icon = "🧑🏻‍🏫" if msg["role"] == "assistant" else "🧑‍💻"
    st.chat_message(msg["role"], avatar=avatar_icon).write(msg["content"])
    # If audio exists for this message, render the player
    if "audio" in msg and msg["audio"] is not None:
        st.audio(msg["audio"], format="audio/mp3")
        
# 9. Chat Execution & Handling Loop
if prompt := st.chat_input("Type your level and what you want to practice..."):
    current_time = time.time()
    
    # Check session limit cap
    if st.session_state.user_message_count >= MAX_SESSION_MESSAGES:
        logging.warning("User reached maximum message limit for this session.")
        st.error("You have reached the practice limit for this session. Please refresh the page to start a new chat.")
        
    # Check rapid debounce
    elif current_time - st.session_state.last_message_time < COOLDOWN_SECONDS:
        remaining = int(COOLDOWN_SECONDS - (current_time - st.session_state.last_message_time))
        logging.info(f"Rapid debounce triggered: {remaining}s remaining.")
        st.warning(f"Please wait {remaining} second(s) before sending another message.")
        
    else:
        # Update session trackers
        st.session_state.last_message_time = current_time
        st.session_state.user_message_count += 1
        
        # Display user message
        st.chat_message("user", avatar="🧑‍💻").write(prompt)
        st.session_state.messages.append({"role": "user", "content": prompt})

        # Generate response with error catching
        try:
            with st.spinner("Thinking..."):
                response = st.session_state.chat.send_message(prompt)
                # audio_bytes = generate_audio(response.text) # Temporarily disabled
                audio_bytes = None

            # Log token utilization telemetry
                if response.usage_metadata:
                    prompt_tokens = response.usage_metadata.prompt_token_count
                    out_tokens = response.usage_metadata.candidates_token_count
                    total_tokens = response.usage_metadata.total_token_count
                    logging.info(f"Tokens -> Prompt: {prompt_tokens} | Output: {out_tokens} | Total: {total_tokens}")
                           
            st.chat_message("assistant", avatar="🧑🏻‍🏫").write(response.text)
            if audio_bytes:
                st.audio(audio_bytes, format="audio/mp3")
                
            st.session_state.messages.append({"role": "assistant", "content": response.text})
            logging.info(f"Generated response for prompt #{st.session_state.user_message_count}")
            
        except APIError as e:
            logging.error(f"Gemini API Error: {e.message}")
            st.error("Google AI service is momentarily unavailable. Please wait a moment and try again.")
        except Exception as e:
            logging.error(f"Unexpected application error: {e}", exc_info=True)
            st.error("An error occurred while generating your response. Please try again.")
