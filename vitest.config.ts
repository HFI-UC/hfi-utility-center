import { defineConfig } from "vitest/config"

process.env.TZ = "Asia/Hong_Kong"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    coverage: {
      include: ["lib/**/*.ts", "app/reservation/search/search-query.ts"],
    },
  },
})
