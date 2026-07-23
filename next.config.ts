import type { NextConfig } from "next"
import path from "node:path"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
}

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig)
