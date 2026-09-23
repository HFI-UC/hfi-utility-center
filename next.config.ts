import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "preview-api.hfiuc.org",
        pathname: "/assets/**",
      },
    ],
  },
}

export default nextConfig
