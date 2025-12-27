import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // ✅ Essential: Prevents the bundler from breaking pdf2json internals
  serverExternalPackages: ["pdf2json"],
};

export default nextConfig;
