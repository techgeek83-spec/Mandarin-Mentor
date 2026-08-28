# ADR-004: Alpha Runtime Target — PWA Web vs. Capacitor Hybrid Wrapper

**Context:** The Taichung Alpha requires low-friction distribution, sub-second STT/TTS TTFB, and reliable audio capture on both Android and iOS devices. iOS WebKit severely restricts PWA background audio context and has inconsistent `MediaRecorder` MIME type support.

**Decision:** Maintain the Next.js App Router frontend as a hybrid-compatible build. The initial web deployment will run as a Progressive Web App (PWA) with a client-side WebKit fallback (using WAV PCM capture via Web Audio API/AudioWorklet if `MediaRecorder` fails). Capacitor wrapping is deferred to Beta if iOS WebKit failure rates exceed 5% during the Alpha field test.

**Consequences:**
- *Pros:* Zero build-step overhead for iOS test flights; instant OTA web updates; unified codebase.
- *Cons:* Requires client-side fallback for iOS audio capture (`audio/mp4` or raw PCM encoding to 16kHz WAV); no true background audio playback.