import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native addon; keep it out of the bundle so the .node
  // binary loads at runtime instead of being traced/bundled by Turbopack/Webpack.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
