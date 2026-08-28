# ADR-010: Dynamic Session Routing and State Hydration

## Context
The application previously operated on a hardcoded static session (`mandarin_session.json` / static session name). To support multiple concurrent conversations, persistent URL bookmarks, and decoupled state hydration, the frontend must dynamically route each conversation via UUIDs and sync state with PostgreSQL.

## Decision
1. Implement dynamic routing in Next.js via `/app/[sessionId]/page.tsx`.
2. Introduce a root redirect at `/app/page.tsx` that generates a new UUID v4 and redirects to `/[sessionId]`.
3. Update FastAPI endpoints (`GET /api/chat`, `POST /api/chat`) to accept `session_id` as a query/body parameter instead of hardcoded session strings.
4. Maintain lazy-loading micro-player isolation per session.

## Consequences
- Deep-linking directly to a session hydrates historical messages from PostgreSQL.
- Eliminates cross-session race conditions and global state collisions.
- Frontend requires URL-aware parameter passing across SSE streams and STT handlers.