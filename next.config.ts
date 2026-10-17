import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Cloudinary on real Node https — Turbopack bundling breaks upload_stream.
  serverExternalPackages: ["cloudinary"],
  turbopack: {
    root: process.cwd(),
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
