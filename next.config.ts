import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@0gfoundation/0g-storage-ts-sdk"],
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
