import os
import asyncpg
from typing import Optional

# Architectural Note: asyncpg limits overhead by managing a persistent connection pool.
# We enforce ssl="require" and statement_cache_size=0 to remain fully compatible with Supabase's IPv4 pooler.

async def init_db_pool() -> asyncpg.Pool:
    # Architecture Note: Resilient database connection lookup supporting standard DATABASE_URL, Supabase conventions, and legacy lowercase environment keys across cloud providers.
    database_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or os.getenv("database_url")
    if not database_url:
        raise ValueError("DATABASE_URL or SUPABASE_DB_URL environment variable is missing.")
    
    if "[HOST]" in database_url or "[PASSWORD]" in database_url:
        raise RuntimeError("DATABASE_URL contains unconfigured placeholders. Update your .env with actual Supabase credentials.")
        
    pool = await asyncpg.create_pool(
        dsn=database_url,
        min_size=2,
        max_size=10,
        command_timeout=10.0,
        ssl="require",
        statement_cache_size=0,
    )
    return pool

async def close_db_pool(pool: Optional[asyncpg.Pool]):
    if pool:
        await pool.close()