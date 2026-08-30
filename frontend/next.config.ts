import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Architecture Note: Wraps Next.js config to inject workbox-based service worker for PWA caching, enabling Add to Home Screen (A2HS) for Alpha testers.
const withSerwist = withSerwistInit({
  // Architectural Note: Resolves src/sw.ts path relative to frontend root for Serwist Webpack compilation.
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Architectural Note: Disable Next.js dev indicators to prevent mobile touch event interception on fixed viewport footers
  devIndicators: false,
// Architectural Note: Empty turbopack block silences Next 16 assertions when invoking dev mode with --turbo.
  turbopack: {},
};

export default withSerwist(nextConfig);