import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set the root directory to avoid Turbopack permission issues
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
