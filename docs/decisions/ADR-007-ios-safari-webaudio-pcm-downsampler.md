# ADR-007: Client-Side PCM Downsampling for iOS Safari

**Context:** The standard Web `MediaRecorder` API reliably produces highly-compressed `audio/webm` files on Chromium/Android. However, iOS WebKit frequently corrupts `audio/mp4` encodings, truncates buffers, or crashes entirely during background/foreground tab switches, resulting in silent API failures against Groq Whisper.

**Decision:** Implement a dual-path audio extraction engine leveraging feature detection. If `audio/webm` is supported, rely on the native browser encoder. If absent (Safari), instantiate an `AudioContext` with a `ScriptProcessorNode` to manually scrape raw `Float32Array` PCM data directly from the microphone stream. Downsample the output client-side and encode it manually into a 16kHz, 16-bit WAV file format before transmitting to the FastAPI server.

**Consequences:**
- *Pros:* Fully bypasses all iOS MediaRecorder encoding bugs; guarantees raw audio integrity for Groq Whisper; maintains peak efficiency for Android.
- *Cons:* Increases client-side CPU overhead for Apple devices during WAV formatting; requires strict maintenance of Web Audio API deprecated lifecycles (ScriptProcessorNode).