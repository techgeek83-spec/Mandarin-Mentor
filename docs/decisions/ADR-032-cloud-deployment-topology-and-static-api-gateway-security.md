**ADR-032: Cloud Deployment Topology & Static API Gateway Security**

- **Context:** The application requires public deployment to serve the Taichung tester network without tethering to a local workstation. However, stripping the Redis rate limiter (ADR-017) exposed the FastAPI endpoints to financial drain via unbounded AI API abuse.
    
- **Decision:** The infrastructure will utilize Vercel (Frontend edge CDN), Fly.io (Backend in Tokyo `nrt` or Singapore `sin` to guarantee sub-second TTFB for local testers), and Supabase (PostgreSQL via port `6543` transaction pooling). To protect the API before full user accounts are ready, a lightweight static pre-shared key (PSK) authentication header will be implemented at the FastAPI gateway.
    
- **Consequences:** Resolves the local-hosting blocker and secures the AI pipelines against drive-by automated scraping. True multi-tenant JWT security is deferred to the Beta release.