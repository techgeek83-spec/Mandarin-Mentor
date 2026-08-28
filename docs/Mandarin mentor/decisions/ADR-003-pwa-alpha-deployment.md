# ADR-003: PWA Alpha Deployment and Caching Strategy
**Context:** Distributing the Alpha to testers in Taichung via native App Stores introduces unacceptable review delays and distribution friction. However, deploying as a PWA introduces iOS WebKit `MediaRecorder` inconsistencies and drops native background audio processing.
**Decision:** Deploy as a Progressive Web App (PWA) using Next.js `manifest.json` and a service worker. Implement a strict `CacheFirst` strategy for CJK fonts/assets and decouple the rate-limited FastAPI gateway to a regional Asian node.
**Consequences:** 
- *Pros:* Zero app store friction; instant OTA updates; allows immediate field testing of the audio pipeline.
- *Cons:* iOS users must manually "Add to Home Screen" to retain session persistence; zero background audio execution; high risk of microphone permission drops on WebKit if the tab suspends.