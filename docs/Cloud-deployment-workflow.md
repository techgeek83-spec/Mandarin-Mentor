|**Phase**|**Objective**|**Technical Tasks**|
|---|---|---|
|**1. Database Persistence**|Eliminate ephemeral local state.|Provision a Supabase PostgreSQL instance. Swap `mandarin_session.json` read/writes in FastAPI with asynchronous database transactions using `asyncpg`.|
|**2. Authentication**|Secure endpoints and isolate user data.|Integrate Supabase Auth or Clerk to replace IP-based rate limiting with JWT user-tier quotas and bind chat histories to specific accounts.|
|**3. Containerization**|Standardize the backend runtime environment.|Draft a production `Dockerfile` and `.dockerignore` for the FastAPI Uvicorn server to ensure parity between local development and cloud execution.|
|**4. Infrastructure Provisioning**|Expose services securely over HTTPS.|Deploy Next.js to Vercel. Deploy the FastAPI Docker container to Render. Select a Tokyo or Singapore region for the backend to minimize STT/TTS latency to Taichung.|
|**5. Network Hardening**|Connect the decoupled stack.|Inject production environment variables. Configure FastAPI CORS middleware to strictly accept origins from your assigned Vercel domain.|