import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
// Architectural Note: NetworkOnly class instance is strictly required by Serwist's RouteHandler type definition; string literals are rejected by TypeScript.
import { NetworkOnly, Serwist } from "serwist";

// Architectural Note: Global type declaration required to inject Webpack precache manifest at compile-time without TypeScript compiler panics.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Architectural Note: Fallback type assertion using standard WorkerGlobalScope avoids strict tsconfig DOM.iterable vs WebWorker lib collisions during Next.js compilation.
declare const self: WorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Architectural Note: Explicit network-only bypass guarantees that Server-Sent Events (SSE) and JWT-authenticated API requests are never intercepted or cached by the Service Worker layer.
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();