# ADR-002: Cloud Whisper vs. Native Web Speech API

**Status:** Accepted

**Context:**
The Web Speech API executes locally on client hardware at zero cloud cost. However, iOS WebKit's implementation fails unpredictably during rapid English/Traditional Chinese code-switching.

**Decision:**
Route all voice input through a server-side proxy calling the Groq `whisper-large-v3-turbo` API using hardware-downsampled (16kHz mono, 32kbps) audio blobs at `temperature=0.0`.

**Consequences:**
* **Pros:** Deterministic zero-shot code-switching transcription with sub-second TTFB.
* **Cons:** Introduces third-party API dependencies and minor metered costs per audio minute.