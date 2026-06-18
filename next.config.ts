import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  // better-sqlite3 is a native addon — don't bundle it.
  serverExternalPackages: ["better-sqlite3"],
  // The import action receives an uploaded JSON file (Pinboard exports run ~2MB).
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  // node-file-trace can't follow bindings' runtime .node lookup — include it explicitly
  // so the standalone output ships the compiled binary.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/Release/*.node",
    ],
  },
};

export default nextConfig;
