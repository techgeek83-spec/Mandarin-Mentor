### ADR-022: Dynamic PostgreSQL Session Reset

**Context:** The legacy global `SESSION_ID` variable was deprecated during the PostgreSQL migration, but the `/api/reset` route still referenced it, throwing an HTTP 500 when attempting to purge chat history. **Decision:** Implemented a `ResetRequest` Pydantic model to mandate the passing of the dynamic client UUID (`session_id`) from the frontend via a JSON payload. **Consequences:**

- Restores database purge functionality.
    
- Ensures strict multi-tenant isolation by explicitly tying reset actions to the active client browser cache.