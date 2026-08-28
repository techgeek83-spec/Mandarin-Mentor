import os
import asyncpg
from typing import Optional

# Architectural Note: Fail fast on unconfigured template strings to prevent obscure urllib/asyncpg parsing tracebacks.
    if "[HOST]" in database_url or "[PASSWORD]" in database_url:
        raise RuntimeError("DATABASE_URL contains unconfigured placeholders. Update your .env with actual Supabase credentials.")
        
    # Architectural Note: statement_cache_size=0 is strictly required when connecting 
    # to Supabase PgBouncer/Supavisor poolers (port 6543) to avoid prepared statement collision errors across pooled connections.
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