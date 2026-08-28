# ADR-012: Pinning Gemini 3.5 Flash-Lite Alias for Low-Latency Ingestion

## Context
The legacy 2.5 generation models have transitioned to paid/archival status and introduce significant TTFB overhead. The current production tier for high-throughput, low-latency conversational tasks is the 3.5 Flash Lite lineage.

## Decision
1. Standardize all chat streaming endpoints on `gemini-flash-lite-latest` (aliased to `gemini-3.5-flash-lite`).
2. Maintain in-memory session UUID resolution to eliminate pre-stream PostgreSQL blocking.

## Consequences
- Restores sub-second token generation latency.
- Keeps unit economics optimal at $0.30 / $2.50 per 1M tokens.
- Protects against deprecated model endpoints.