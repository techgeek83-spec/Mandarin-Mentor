# ADR-039: PWA Manifest PNG Hardening and Service Worker API Exclusion

## Context
Chrome on Android strictly enforces PNG format icons for PWA installability heuristics, failing manifest installs that only provide SVG assets. Furthermore, generic Service Worker `defaultCache` runtime rules risk intercepting dynamic Next.js App Router `/api/*` endpoints (SSE streaming on `/api/chat` and base64 audio returns on `/api/tts`), which would degrade real-time transcription and audio responses.

## Decision
1. Converted `manifest.json` icon declarations to discrete 192x192 and 512x512 rasterized PNG entries with explicit `any` and `maskable` flags.
2. Configured Next.js App Router viewport and `appleWebApp` metadata to enforce standalone execution and safe-area boundaries (`viewport-fit=cover`) on iOS Safari.
3. Added a top-priority `NetworkOnly` runtime caching matcher for all `/api/*` routes within `src/sw.ts` preceding default Workbox/Serwist caching chains.

## Consequences
* **Positive:** Guaranteed PWA install prompt triggers across Android Chromium and clean standalone mode in iOS Safari without URL chrome bars.
* **Positive:** Prevents corrupt streaming chunk caches or invalid auth header reuse on FastAPI endpoints.
* **Negative:** Requires static PNG generation pipeline maintenance in `public/` alongside SVG sources.