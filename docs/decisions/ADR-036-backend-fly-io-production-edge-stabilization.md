# ADR-036: Backend Fly.io Production Edge Stabilization and Ingress Hardening

## Context
Deploying the FastAPI backend to Fly.io micro-VMs encountered runtime crashes during container initialization. The failures stemmed from missing binary dependencies in Docker multi-stage builds (`asyncpg`, `groq`, `pyjwt[crypto]`, `python-multipart`), mismatched environment variable names (`SUPABASE_DB_URL` vs. `DATABASE_URL`), and unencoded RFC 3986 reserved characters in the database password breaking connection URI parsing.

## Decision
1. Explicitly pinned `asyncpg`, `groq`, `pyjwt[crypto]`, and `python-multipart` in `backend/requirements.txt` to guarantee pre-compiled binary wheel resolution.
2. Implemented resilient fallback key resolution in `backend/database.py` across `DATABASE_URL`, `SUPABASE_DB_URL`, and lowercase variations.
3. Enforced URL percent-encoding for reserved credential characters (`!` -> `%21`, `$` -> `%24`) and used single-quoted string literals in shell secret provisioning commands to block variable interpolation.
4. Validated edge ingress routing: protected endpoints enforce stateless JWT 401 rejections (ADR-034), and CORS preflight returns dynamic origin headers for authorized clients.

## Consequences
- **Positive:** Backend micro-VM boots cleanly without restart loops; stateless JWT authentication and asyncpg database connection pools initialize reliably.
- **Negative:** Non-alphanumeric database passwords require manual percent-encoding prior to provisioning on edge platforms.