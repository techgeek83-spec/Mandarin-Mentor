import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Architecture Note: Wraps Next.js config to inject workbox-based service worker for PWA caching, enabling Add to Home Screen (A2HS) for Alpha testers.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);