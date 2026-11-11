import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Keep the dev-only "N" badge away from the mobile bottom navigation.
  devIndicators: {
    position: "top-right",
  },
  experimental: {
    // The signed-in pages are client-rendered behind a Firebase auth gate, so
    // there is no server-rendered content for instant-navigation checks to
    // inspect. Only validate segments that opt in with `export const instant`.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
