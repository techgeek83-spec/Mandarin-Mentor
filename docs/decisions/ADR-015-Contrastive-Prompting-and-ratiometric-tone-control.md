# ADR-015: Contrastive Prompting & Ratiometric Tone Control

## Context
Gemini Flash models struggle with abstract HTML nesting rules and tone instructions, resulting in missing `<tts-inline>` wrappers and 100% Hanzi outputs for advanced users.

## Decision
1. Implement Contrastive Prompting (explicit WRONG vs CORRECT examples) in the system prompt to anchor the model's formatting behavior.
2. Replace abstract tone adjectives ("primarily") with strict percentage ratios ("50% Mandarin / 50% English").

## Consequences
- Prevents 100% Mandarin saturation for advanced users.
- Forces consistent `<tts-inline>` generation for mid-sentence Chinese.
- Keeps prompt execution viable on the cheaper Flash tier without requiring Pro.