import type { NextConfig } from "next"

const backendOrigin =
  process.env.BACKEND_ORIGIN || "https://cn.hfiuc.api.743.world"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cn.hfiuc.api.743.world",
        pathname: "/assets/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ]
  },
}

export default nextConfig
