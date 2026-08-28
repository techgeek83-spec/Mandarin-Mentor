import asyncpg
from typing import List, Dict, Any, Optional
import uuid

# Architectural Note: In-memory UUID lookup cache eliminates redundant SELECT/INSERT roundtrips to Supabase over WAN on every conversation turn.
SESSION_CACHE: Dict[str, uuid.UUID] = {}

async def get_or_create_session(pool: asyncpg.Pool, session_name: str) -> uuid.UUID:
    """Architectural Note: Resolves or provisions a persistent session UUID mapped to a human-readable session key, leveraging an in-memory cache to prevent blocking database round-trips."""
    if session_name in SESSION_CACHE:
        return SESSION_CACHE[session_name]

    async with pool.acquire() as connection:
        row = await connection.fetchrow(
            "SELECT id FROM sessions WHERE metadata->>'name' = $1 LIMIT 1", session_name
        )
        if row:
            SESSION_CACHE[session_name] = row["id"]
            return row["id"]
        
        new_id = await connection.fetchval(
            "INSERT INTO sessions (metadata) VALUES ($1::jsonb) RETURNING id",
            f'{{"name": "{session_name}"}}'
        )
        SESSION_CACHE[session_name] = new_id
        return new_id

async def load_session(pool: asyncpg.Pool, session_name: str) -> List[Dict[str, Any]]:
    """Architectural Note: Fetches message history ordered chronologically from PostgreSQL, eliminating local disk I/O bottlenecks."""
    session_id = await get_or_create_session(pool, session_name)
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            "SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC",
            session_id
        )
        return [{"role": row["role"], "content": row["content"]} for row in rows]

async def save_message(pool: asyncpg.Pool, session_name: str, role: str, content: str):
    """Architectural Note: Resolves session UUID via get_or_create_session prior to message insertion to strictly prevent foreign key constraint violations during asynchronous background writes."""
    session_id = await get_or_create_session(pool, session_name)
    async with pool.acquire() as connection:
        await connection.execute(
            "INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)",
            session_id, role, content
        )

async def clear_session(pool: asyncpg.Pool, session_name: str):
    """Architectural Note: Cascades deletion or purges messages for the active session key."""
    async with pool.acquire() as connection:
        row = await connection.fetchrow(
            "SELECT id FROM sessions WHERE metadata->>'name' = $1 LIMIT 1", session_name
        )
        if row:
            session_id = row["id"]
            async with connection.transaction():
                await connection.execute("DELETE FROM messages WHERE session_id = $1", session_id)
                await connection.execute("DELETE FROM sessions WHERE id = $1", session_id)