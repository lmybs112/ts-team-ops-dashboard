import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@team-hq/domain", "@team-hq/api-contract"],
  // Packages use ESM ".js" specifiers that map to ".ts" sources.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
