# ADR-034: Direct Gateway Architecture via Stateless Supabase JWT Authentication

* **Date:** 2026-08-30
* **Status:** Accepted
* **Context:** ADR-033 proposed a Next.js API proxy to hide a pre-shared key (PSK). However, the proxy introduces transient throwaway code, artificial 10–15s Vercel execution ceilings on SSE streams, and an unnecessary network hop that degrades TTFB.
* **Decision:** Skip the Next.js API proxy entirely. Deploy the frontend to Vercel strictly as an Edge CDN asset host. The Next.js client authenticates via Supabase Auth and passes the user JWT directly in the `Authorization: Bearer <token>` header to the Fly.io FastAPI backend. FastAPI verifies the JWT statelessly using the Supabase JWT secret via `PyJWT`.
* **Consequences:** Eliminates proxy buffering and Vercel timeout constraints on long-lived SSE connections. Maintains direct single-hop sub-second TTFB between the client and Fly.io Tokyo (`nrt`). Requires scaffolding basic Supabase Auth client state and FastAPI JWT verification middleware prior to deployment.