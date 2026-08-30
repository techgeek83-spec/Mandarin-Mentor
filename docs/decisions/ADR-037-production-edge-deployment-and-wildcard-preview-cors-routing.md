**ADR-037: Production Edge Deployment and Wildcard Preview CORS Routing**

_Save this block to your `decisions/` directory._

- **Context:** The decoupled Next.js frontend has been migrated to Vercel Edge hosting with `@serwist/next` Webpack service worker compilation. Ephemeral preview branches and production deployments require dynamic origin handling without hardcoding ephemeral hashes or exposing local ports to production traffic.
    
- **Decision:** Implement `allow_origin_regex=r"https://.*\.vercel\.app"` in FastAPI `CORSMiddleware`, enforce explicit `next build --webpack` in `package.json`, and scaffold `src/sw.ts` targeting `public/sw.js`.
    
- **Consequences:** Eliminates CORS preflight failures across all current and future Vercel preview environments. Enforces HTTPS origin matching while preserving local development workflows. Next.js 16 compiler assertions are satisfied via empty `turbopack: {}` configuration in `next.config.ts`.