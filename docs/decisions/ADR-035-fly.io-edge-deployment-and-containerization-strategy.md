ADR-035: Fly.io Edge Deployment and Containerization Strategy

- **Context:** The FastAPI backend requires persistent deployment with sub-50ms latency to the target user base, circumventing standard serverless limitations for WebSockets and async database pooling.
    
- **Decision:** Deploy containerized micro-VMs to Fly.io (`nrt` region) using a multi-stage `python:3.11-slim` Docker image. The application will route via Fly's edge network and enforce CORS dynamically via the `FRONTEND_URL` environment variable.
    
- **Consequences:** Requires manual secrets injection for AI/DB credentials. Drops native Vercel backend integration but guarantees asynchronous execution stability for `edge-tts` and Supabase IPv6 `asyncpg` routing.
    

**Prerequisites**

- Fly.io CLI (`flyctl`) authenticated locally.
    
- Next.js production domain provisioned (e.g., `[https://mandarin-mentor.vercel.app](https://mandarin-mentor.vercel.app)`).
    
- Active API keys for Supabase, Groq, and Gemini ready for injection.