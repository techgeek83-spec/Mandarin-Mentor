import os
import asyncpg
from typing import Optional

# Architectural Note: We implement a global pool wrapper. asyncpg limits overhead by utilizing prepared statements automatically. The min_size and max_size ensure we do not exhaust Supabase connection limits during traffic spikes.

async def init_db_pool() -> asyncpg.Pool:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is missing.")
    
    # Architectural Note: Fail fast on unconfigured template strings to prevent obscure urllib/asyncpg parsing tracebacks.
    if "[HOST]" in database_url or "[PASSWORD]" in database_url:
        raise RuntimeError("DATABASE_URL contains unconfigured placeholders. Update your .env with actual Supabase credentials.")
        
    pool = await asyncpg.create_pool(
        dsn=database_url,
        min_size=2,
        max_size=10,
        command_timeout=10.0,
    )
    return pool

async def close_db_pool(pool: Optional[asyncpg.Pool]):
    if pool:
        await pool.close()