import type { NextConfig } from "next"
import path from "node:path"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.BACKEND_URL ?? "https://api.hfiuc.org",
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
}

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig)
