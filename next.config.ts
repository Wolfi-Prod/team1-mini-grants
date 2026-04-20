import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;

// Enable Cloudflare bindings (env, R2, KV, etc.) during `next dev`.
// Runs only in Node dev context; no-op in production builds.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
