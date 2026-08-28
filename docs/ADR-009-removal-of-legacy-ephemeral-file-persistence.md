**Context:** The backend originally relied on local file system I/O (`mandarin_session.json`) and synchronous file operations in `chat_store.py` for state hydration. Now that PostgreSQL/Supabase persistence via `asyncpg` is active and verified, maintaining dead file-based code paths introduces technical debt and deployment risks for containerized stateless environments.

**Decision:** Fully purge local session file references, legacy JSON loader fallback paths, and the `sessions/` directory.

**Consequences:** The backend becomes strictly dependent on PostgreSQL connectivity at startup. Stateless container deployments on platforms like Cloud Run or Render will no longer attempt invalid disk writes.