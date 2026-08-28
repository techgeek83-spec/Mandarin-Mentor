# Progressive Web App (PWA) & Client Runtime Specification

## 1. Distribution Strategy (Alpha)
- **Target:** Next.js PWA with `manifest.json` and custom service worker.
- **Audience:** Direct web distribution for the initial Taichung testing network.
- **Contingency:** If iOS WebKit `MediaRecorder` proves unstable during Alpha, wrap the Next.js static export using Capacitor (`@capacitor-community/voice-recorder`).

## 2. Client Audio Pipeline & iOS WebKit Workarounds
- **Recording:** Inspect `MediaRecorder.isTypeSupported()`.
  - Prefer: `audio/webm;codecs=opus` (Android/Desktop Chrome).
  - Fallback: `audio/mp4` or direct downsampled PCM 16kHz WAV buffer (iOS Safari/WebKit).
- **TTS Cache Hierarchy:**
  1. In-memory `AudioBuffer` / DOM Audio object (instant playback).
  2. `sessionStorage` (raw base64/blob) to avoid duplicate network egress.
  3. Network: `POST /api/tts` (returns `audio/mpeg` with `Cache-Control: public, max-age=86400`).

## 3. Backend Gateway Deployment
- **Compute:** FastAPI deployed on a regional Asian node (Tokyo/Singapore) to keep round-trip TTFB under 1000ms.
- **Security:** Groq and Gemini API keys strictly backend-isolated.
- **Protection:** Redis-backed token-bucket rate limiter enforced at the route layer.