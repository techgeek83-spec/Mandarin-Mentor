# ADR-033: Next.js API Proxy & IPv6 Direct Database Routing

* **Date:** 2026-08-30
* **Status:** Accepted
* **Context:** Deploying the FastAPI backend directly to Fly.io exposed a static Pre-Shared Key (PSK) in the browser DevTools (ADR-032). Concurrently, using Supabase's IPv4 transaction pooler (port `6543`) caused fatal conflicts with `asyncpg`'s prepared statements.
* **Decision:** 
  1. Route all client UI fetches through Next.js API Routes (`src/app/api/...`) to securely inject the PSK server-side before proxying to Fly.io.
  2. Utilize Fly.io's native IPv6 support to connect directly to the Supabase session port (`5432`), bypassing the transaction pooler.
* **Consequences:** Secures the infrastructure PSK and stabilizes PostgreSQL connections. Introduces an additional network hop which may impact sub-second TTFB. Mandates Next.js API routes be configured for the `edge` runtime to prevent SSE buffering and bypass Vercel's strict serverless execution timeouts. Database connection count must be closely monitored against Supabase direct connection limits.