# ADR-040: PWA Icon Extraction Tight Bounding Box

## Context
Raw generative image outputs for application icons contain simulated UI backgrounds, drop shadows, and pre-baked squircle containers. Processing these without tight coordinate clamping results in visible rectangular framing artifacts when Android and iOS apply adaptive masking layers.

## Decision
Refactored `generate-icons.js` to clamp extraction strictly to the inner 58% coordinate space (`cropLeft: 0.21`, `cropTop: 0.21`), discarding outer mock boundaries, and scaled the maskable icon target to a 70% inner safe-zone padded with `#F4EFE6`.

## Consequences
* **Positive:** Eliminates double-border clipping and visual seams on Android Adaptive Icons and iOS home screen tiles.
* **Positive:** Retains deterministic, scriptable generation directly from `icon-raw.png`.