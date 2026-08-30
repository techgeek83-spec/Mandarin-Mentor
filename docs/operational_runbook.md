# Mandarin Mentor: Operational Runbook & Command Reference

**Local Development Environment**

- **Frontend Client (Next.js Dev Server):**
    
    Bash
    
    ```
    cd frontend
    npm run dev -- -H 0.0.0.0 -p 3000
    ```
    
- **Frontend Webpack Build Verification (Next.js + Serwist):**
    
    Bash
    
    ```
    cd frontend
    npm run build
    ```
    
- **Frontend Production Preview:**
    
    Bash
    
    ```
    cd frontend
    npm run start
    ```
    
- **Backend Gateway (FastAPI Local Reload):**
    
    Bash
    
    ```
    cd backend
    uvicorn main:app --reload --port 8000
    ```
    
- **Frontend Semantic Release Automation:**
    
    Bash
    
    ```
    cd frontend
    npm run release
    ```
    

**Cloud Deployment & Ingress Pipelines**

- **Fly.io Backend Deployment (Region: `nrt`):**
    
    Bash
    
    ```
    cd backend
    fly deploy
    ```
    
- **Fly.io Backend Application Logs:**
    
    Bash
    
    ```
    fly logs
    ```
    
- **Fly.io Micro-VM Status:**
    
    Bash
    
    ```
    fly status
    ```
    
- **Vercel Production Deployment:**
    
    Bash
    
    ```
    cd frontend
    vercel deploy --prod
    ```
    
- **Vercel Build Inspection & Logs:**
    
    Bash
    
    ```
    vercel inspect <deployment-url> --logs
    ```
    
- **Vercel Environment Variable Binding:**
    
    Bash
    
    ```
    cd frontend
    vercel env add NEXT_PUBLIC_API_URL production
    vercel env add NEXT_PUBLIC_SUPABASE_URL production
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
    ```
    

**Edge Verification & Ingress Diagnostics**

- **Fly.io Dynamic CORS Preflight Verification (PowerShell Native cURL):**
    
    PowerShell
    
    ```
    curl.exe -X OPTIONS https://mandarin-mentor-api.fly.dev/api/history `
      -H "Origin: https://frontend-mandarin-mentor.vercel.app" `
      -H "Access-Control-Request-Method: GET" `
      -i
    ```
    
- **Fly.io Dynamic CORS Preflight Verification (PowerShell WebRequest):**
    
    PowerShell
    
    ```
    (Invoke-WebRequest -Uri "https://mandarin-mentor-api.fly.dev/api/history" `
      -Method Options `
      -Headers @{
        "Origin" = "https://frontend-mandarin-mentor.vercel.app";
        "Access-Control-Request-Method" = "GET"
      }).Headers
    ```
    
- **Backend Unauthenticated Route Guard Check (ADR-034):**
    
    Bash
    
    ```
    curl -i https://mandarin-mentor-api.fly.dev/api/history
    # Expected Response: 401 Unauthorized
    ```