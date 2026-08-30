# ADR-028: AST State Consolidation and Markdown Routing Architecture

## Context
Multiple migrations (PostgreSQL session IDs, edge-tts speed normalizations, removal of XML tags, and Markdown AST hydration) resolved race conditions, 500 session resets, and double-rendering loops. However, free-form conversational Hanzi inside standard paragraph nodes continues to trigger unconstrained inline `<TTSPlayer>` micro-players.

## Decision
1. Persisted multi-line blockquote splitting (`ADR-026`) and isolated Hanzi cursor indexing (`ADR-027`).
2. Finalized removal of server-side HTML/XML formatting tags, delegating all AST layout mapping strictly to ReactMarkdown components on the client.
3. Synchronized architecture state across `STATE.md`, `system_architecture.md`, and `api_contracts.md` before resolving paragraph inline token bounds.

## Consequences
- Prevents architectural drift and memory loss across context cycles.
- Establishes a verified baseline for multi-tenant PostgreSQL session storage and sub-second TTFB rendering.