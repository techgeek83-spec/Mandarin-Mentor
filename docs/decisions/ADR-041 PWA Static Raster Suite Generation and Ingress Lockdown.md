# ADR-041: PWA Static Raster Suite Generation and Ingress Lockdown

## Context
Mobile PWA install heuristics across Android (Chromium) and iOS (WebKit) require discrete, high-resolution PNG raster assets (`192x192`, `512x512`, `180x180` Apple Touch, and `512x512` Maskable) to satisfy Add to Home Screen (A2HS) prompts without visual squircle edge clipping or splash screen distortion.

## Decision
1. Automated the extraction of the brand emblem directly from source assets via `sharp` utilizing a tight coordinate bounding box (`0.23` offset, `0.54` dimension scale) and matched `#F4EFE6` background fill.
2. Standardized manifest icon routing and Webpack Serwist compilation with explicit `NetworkOnly` runtime exclusion for `/api/*` endpoints to protect Server-Sent Events (SSE) and JWT auth headers.

## Consequences
* **Positive:** Guaranteed compliance with Chrome A2HS criteria and zero icon double-border distortion on Android Adaptive UI.
* **Positive:** Completely bypasses Service Worker caching for dynamic LLM streams and TTS audio generation.