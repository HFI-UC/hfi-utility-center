import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import sitemap from 'vite-plugin-sitemap'

const dynamicRoutes = [
    "/reservation/create",
    "/reservation/status",
    "/admin/login",
    "/admin/reservations",
    "/admin/approval",
    "/admin/policy",
    "/maintenance",
    "/lostnfound"
]

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), sitemap({ hostname: "https://www.hfiuc.org", readable: true, dynamicRoutes: dynamicRoutes})],
    define: {
        "process.env.VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV),
        "process.env.VERCEL_GIT_COMMIT_SHA": JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA)
    }
});
